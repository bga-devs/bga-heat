<?php
namespace HEAT\Core;
use HEAT\Managers\Players;
use HEAT\Helpers\Utils;
use HEAT\Helpers\Collection;
use HEAT\Core\Globals;
use HEAT\Managers\Effects;

class Notifications
{
  /*************************
   **** GENERIC METHODS ****
   *************************/
  protected static function notifyAll($name, $msg, $data)
  {
    self::updateArgs($data);
    Game::get()->notifyAllPlayers($name, $msg, $data);
  }

  protected static function notify($constructor, $name, $msg, $data)
  {
    $pId = is_int($constructor) ? $constructor : $constructor->getPId();
    self::updateArgs($data);
    Game::get()->notifyPlayer($pId, $name, $msg, $data);
  }

  public static function message($txt, $args = [])
  {
    self::notifyAll('message', $txt, $args);
  }

  public static function messageTo($player, $txt, $args = [])
  {
    $pId = is_int($player) ? $player : $player->getId();
    self::notify($pId, 'message', $txt, $args);
  }

  public static function updatePlanification($player, $args)
  {
    self::notify($player->getId(), 'updatePlanification', '', [
      'args' => ['_private' => $args['_private'][$player->getId()]],
    ]);
  }

  public static function reveal($constructor, $newGear, $cards, $heat)
  {
    $msg = is_null($heat)
      ? clienttranslate('${constructor_name} shifts gear to ${gear}')
      : clienttranslate('${constructor_name} pays 1 Heat card to shift gear to ${gear}');

    self::notifyAll('reveal', $msg, [
      'constructor' => $constructor,
      'gear' => $newGear,
      'cards' => $cards,
      'heat' => $heat,
    ]);
  }

  public function moveCar(
    $constructor,
    $newCell,
    $speed,
    $nSpacesForward,
    $extraTurns,
    $distanceToCorner,
    $path,
    $slipstream = false,
    $legendSlot = null
  ) {
    $msg =
      $speed == $nSpacesForward
        ? clienttranslate('${constructor_name} moves their car ${nForward} spaces forward')
        : clienttranslate(
          '${constructor_name} moves their car ${nForward} spaces forward out of ${speed} because they are blocked by other cars'
        );

    if (!is_null($legendSlot)) {
      $msg = clienttranslate(
        '${constructor_name} moves their car ${nForward} spaces forward to reach space n°${slot} before next corner'
      );
    }

    if ($slipstream) {
      $msg =
        $speed == $nSpacesForward
          ? clienttranslate('Slipstream: ${constructor_name} moves their car ${nForward} spaces forward')
          : clienttranslate(
            'Slipstream: ${constructor_name} moves their car ${nForward} spaces forward out of ${speed} because they are blocked by other cars'
          );
    }

    self::notifyAll('moveCar', $msg, [
      'constructor' => $constructor,
      'cell' => $newCell,
      'speed' => $speed,
      'nForward' => $nSpacesForward,
      'distanceToCorner' => $distanceToCorner,
      'path' => $path,
      'progress' => Game::get()->getRaceProgress(),
      'preserve' => ['path', 'slot'],
      'slot' => $legendSlot,
      'totalSpeed' => $constructor->getSpeed(),
    ]);

    if ($extraTurns > 0 && $constructor->getTurn() > 0) {
      $nbrLaps = Game::get()->getNbrLaps();
      $turn = $constructor->getTurn() + 1;
      $msg = clienttranslate(
        '${finishIcon} ${constructor_name} crosses the finish line and starts lap n°${n}/${lap} ${finishIcon}'
      );
      if ($turn == $nbrLaps) {
        $msg = clienttranslate(
          '${finishIcon} ${constructor_name} crosses the finish line and starts the final lap of the race ${finishIcon}'
        );
      }
      if ($turn > $nbrLaps) {
        $msg = clienttranslate('${finishIcon} ${constructor_name} crosses the finish line and finishes the race ${finishIcon}');
      }

      self::notifyAll('finishTurn', $msg, [
        'constructor' => $constructor,
        'n' => $turn,
        'lap' => $nbrLaps,
        'finishIcon' => '',
      ]);
    }
  }

  public function gainAdrenaline($constructor, $last)
  {
    $msg = $last
      ? clienttranslate('${constructor_name} is last so they can use adrenaline\'s effects')
      : clienttranslate('${constructor_name} is second to last so they can use adrenaline\'s effects');

    self::notifyAll('gainAdrenaline', $msg, [
      'constructor' => $constructor,
    ]);
  }

  public function gainGearCooldown($constructor, $gear, $n)
  {
    $msg =
      $gear == 1
        ? clienttranslate('${constructor_name} gains 3 additional cooldowns for being in 1st gear')
        : clienttranslate('${constructor_name} gains 1 additional cooldown for being in 2nd gear');

    self::notifyAll('gainGearCooldown', $msg, [
      'constructor' => $constructor,
      'cooldown' => $n,
    ]);
  }

  public function discard($constructor, $cards)
  {
    self::notifyAll('discard', clienttranslate('${constructor_name} discards ${n} card(s)'), [
      'constructor' => $constructor,
      'n' => count($cards),
      'cards' => $cards,
    ]);

    /*self::notify($constructor, 'pDiscard', clienttranslate('You discard ${cards_images}'), [
      'constructor' => $constructor,
      'cards' => $cards,
    ]);*/
  }

  public function reduceStress($constructor, $cards)
  {
    self::notifyAll('discard', clienttranslate('${constructor_name} discards ${n} stress card(s) (reduce stress)'), [
      'constructor' => $constructor,
      'n' => count($cards),
      'cards' => $cards,
    ]);
  }

  public function clearPlayedCards($constructor, $cardIds, $sponsorIds)
  {
    $msg = clienttranslate('${constructor_name} discards played card(s)');
    if (!empty($sponsorIds)) {
      $msg = clienttranslate('${constructor_name} discards played card(s) and remove sponsor(s)');
    }
    self::notifyAll('clearPlayedCards', $msg, [
      'constructor' => $constructor,
      'cardIds' => $cardIds,
      'sponsorIds' => $sponsorIds,
    ]);
  }

  public function draw($constructor, $cards, $areSponsors = false)
  {
    self::notifyAll(
      'draw',
      $areSponsors
        ? clienttranslate('${constructor_name} draws ${n} sponsor card(s)')
        : clienttranslate('${constructor_name} draws ${n} card(s)'),
      [
        'constructor' => $constructor,
        'n' => count($cards),
        'areSponsors' => $areSponsors,
      ]
    );

    self::notify(
      $constructor,
      'pDraw',
      $areSponsors ? clienttranslate('You draw sponsors ${cards_images}') : clienttranslate('You draw ${cards_images}'),
      [
        'constructor' => $constructor,
        'cards' => $cards->toArray(),
        'areSponsors' => $areSponsors,
      ]
    );
  }

  public function resolveBoost($constructor, $cards, $card, $i, $n)
  {
    $msg =
      $i == 1 && $n == 1
        ? clienttranslate('${constructor_name} discards ${cards_images} and keep ${card_image} to resolve [+] symbol')
        : clienttranslate(
          '${constructor_name} discards ${cards_images} and keep ${card_image} to resolve [+] symbol (${i} / ${n})'
        );
    if (empty($cards)) {
      $msg =
        $i == 1 && $n == 1
          ? clienttranslate('${constructor_name} flips ${card_image} to resolve [+] symbol')
          : clienttranslate('${constructor_name} flips ${card_image} to resolve [+] symbol (${i} / ${n})');
    }

    self::notifyAll('resolveBoost', $msg, [
      'constructor' => $constructor,
      'cards' => $cards,
      'card' => $card,
      'i' => $i,
      'n' => $n,
    ]);
  }

  public function updateTurnOrder($constructors)
  {
    self::notifyAll('updateTurnOrder', clienttranslate('New round order is: ${constructors_names}'), [
      'constructors' => $constructors,
    ]);
  }

  public function payHeatsForCorner($constructor, $cards, $speed, $limit, $cornerPos, $roadCondition)
  {
    $msg = clienttranslate('${constructor_name} pays ${n} heat(s) for crossing a corner at speed ${speed} instead of ${limit}');
    if ($roadCondition == \ROAD_CONDITION_MORE_HEAT) {
      $msg = clienttranslate(
        '${constructor_name} pays ${n} heat(s) for crossing a corner at speed ${speed} instead of ${limit} (extra heat from road condition)'
      );
    }

    self::notifyAll('payHeats', $msg, [
      'constructor' => $constructor,
      'n' => count($cards),
      'cards' => $cards->toArray(),
      'speed' => $speed,
      'limit' => $limit,
      'corner' => $cornerPos,
    ]);
  }

  public function spinOut($constructor, $speed, $limit, $cornerPos, $cards, $cell, $stresses, $nBack, $newTurn, $roadCondition)
  {
    $msg = clienttranslate(
      '${constructor_name} SPINS OUT! ${constructor_name} crossed a corner at speed ${speed} instead of ${limit} but only have ${n} heat(s) in their engine. They go back before the corner, set gear to 1 and draw ${m} stress card(s) as a result'
    );
    if ($roadCondition == \ROAD_CONDITION_MORE_HEAT) {
      $msg = clienttranslate(
        '${constructor_name} SPINS OUT! ${constructor_name} crossed a corner at speed ${speed} instead of ${limit} but only have ${n} heat(s) in their engine (extra heat needed from road condition). They go back before the corner, set gear to 1 and draw ${m} stress card(s) as a result'
      );
    }

    self::notifyAll('spinOut', $msg, [
      'constructor' => $constructor,
      'n' => count($cards),
      'cards' => $cards->toArray(),
      'speed' => $speed,
      'limit' => $limit,
      'corner' => $cornerPos,
      'cell' => $cell,
      'turn' => $newTurn,
      'stresses' => $stresses,
      'm' => count($stresses),
      'nCellsBack' => $nBack,
    ]);
  }

  public function clutteredHand($constructor)
  {
    self::notifyAll(
      'clutteredHand',
      clienttranslate('${constructor_name} has a cluttered hand so their turn is skipped and their gear is set to 1'),
      [
        'constructor' => $constructor,
      ]
    );
  }

  public function cooldown($constructor, $heats)
  {
    self::notifyAll('cooldown', clienttranslate('${constructor_name} cooldowns ${n} heat(s)'), [
      'constructor' => $constructor,
      'cards' => $heats->toArray(),
      'n' => $heats->count(),
    ]);
  }

  public function adrenaline($constructor)
  {
    self::notifyAll('adrenaline', clienttranslate('${constructor_name} uses adrenaline\'s effect to increase their speed by 1'), [
      'constructor' => $constructor,
    ]);
  }

  public function heatedBoost($constructor, $heats, $cards, $card)
  {
    if (!is_null($heats)) {
      self::notifyAll('payHeats', clienttranslate('${constructor_name} pays 1 heat to get the [+] effect'), [
        'constructor' => $constructor,
        'cards' => $heats->toArray(),
      ]);
    }
    self::resolveBoost($constructor, $cards, $card, 1, 1);
  }

  public function finishRace($constructor, $podium, $canLeave)
  {
    self::notifyAll('finishRace', clienttranslate('${constructor_name} finishes the race at position ${pos}'), [
      'constructor' => $constructor,
      'pos' => $podium,
      'canLeave' => $canLeave,
    ]);
  }

  public function payHeats($constructor, $heats)
  {
    self::notifyAll('payHeats', clienttranslate('${constructor_name} pays ${n} heat(s) for its played card(s)'), [
      'constructor' => $constructor,
      'cards' => $heats->toArray(),
      'n' => $heats->count(),
    ]);
  }

  public function scrapCards($constructor, $cards)
  {
    self::notifyAll('scrapCards', clienttranslate('${constructor_name} scraps ${cards_images}'), [
      'constructor' => $constructor,
      'cards' => $cards,
    ]);
  }

  public function salvageCards($constructor, $cards)
  {
    self::notifyAll('salvageCards', clienttranslate('${constructor_name} salvages ${cards_images}'), [
      'constructor' => $constructor,
      'cards' => $cards,
      'discard' => $constructor->getDiscard(),
    ]);
  }

  public function directPlay($constructor, $card, $speed)
  {
    self::notifyAll('directPlay', clienttranslate('${constructor_name} plays ${card_image} from their hand'), [
      'constructor' => $constructor,
      'card' => $card,
      'speed' => $speed,
    ]);
  }

  public function refresh($constructor, $card)
  {
    self::notifyAll('refresh', clienttranslate('${constructor_name} puts back ${card_image} on the top of their deck'), [
      'constructor' => $constructor,
      'card' => $card,
    ]);
  }

  public static function newLegendCard($card)
  {
    self::notifyAll('newLegendCard', clienttranslate('A new legend card is revealed'), [
      'card' => $card,
    ]);
  }

  public static function endOfRace($scores, $order)
  {
    self::notifyAll('endOfRace', clienttranslate('End of the race'), [
      'scores' => $scores,
      'order' => $order,
    ]);
  }

  public static function clean($counters)
  {
    self::notifyAll('clean', clienttranslate('Clearing previous heat and stress cards'), [
      'counters' => $counters,
    ]);
  }

  public static function newMarket($round, $cards, $upgrades)
  {
    self::notifyAll('newMarket', clienttranslate('Starting round n°${round}/${nRounds} of Upgrade card drafting'), [
      'round' => $round,
      'nRounds' => Globals::getNDraftRounds(),
      'cards' => $cards,
      'upgrades' => $upgrades,
    ]);
  }

  public static function chooseUpgrade($constructor, $card)
  {
    self::notifyAll('chooseUpgrade', clienttranslate('${constructor_name} chooses an ${card_image}'), [
      'constructor' => $constructor,
      'card' => $card,
    ]);
  }

  public static function accelerate($constructor, $card, $n)
  {
    self::notifyAll('accelerate', clienttranslate('${constructor_name} accelerates using ${card_image}'), [
      'constructor' => $constructor,
      'card' => $card,
      'speed' => $n,
    ]);
  }

  public static function endDraftRound($round, $cardIds)
  {
    self::notifyAll(
      'endDraftRound',
      Globals::isChampionship()
        ? clienttranslate('End of draft round, removing leftover cards')
        : clienttranslate('End of draft round n°${round}, removing leftover cards'),
      [
        'round' => $round,
        'cardIds' => $cardIds,
      ]
    );
  }

  public static function reformingDeckWithUpgrades()
  {
    self::notifyAll('reformingDeckWithUpgrades', clienttranslate('End of draft phase, reforming deck with upgrade cards'), []);
  }

  public static function swapUpgrade($constructor, $card1, $card2)
  {
    self::notifyAll(
      'swapUpgrade',
      clienttranslate('${constructor_name} puts back ${card_image2} and takes ${card_image} instead'),
      [
        'constructor' => $constructor,
        'card' => $card1,
        'card2' => $card2,
      ]
    );
  }

  public static function weatherHeats($n, $location)
  {
    self::notifyAll('weatherHeats', clienttranslate('Due to weather card, everyone move ${n} heat(s) to ${loc}'), [
      'i18n' => ['loc'],
      'loc' => $location,
      'n' => $n,
    ]);
  }

  public static function loadCircuit($circuit)
  {
    self::notifyAll('loadCircuit', '', [
      'circuit' => $circuit,
    ]);
  }

  public static function setupRace($counters)
  {
    self::notifyAll('setupRace', '', [
      'counters' => $counters,
    ]);
  }

  public static function randomUpgrades($constructor, $cards)
  {
    self::notifyAll(
      'randomUpgrades',
      clienttranslate('${constructor_name} will play with the following upgrades: ${cards_images}'),
      [
        'constructor' => $constructor,
        'cards' => $cards,
      ]
    );
  }

  /////////////////////////////////
  //// CHAMPIONSHIP
  public static function newChampionshipRace($datas, $circuit)
  {
    $map = [
      EVENT_INAUGURATION => clienttranslate('New grandstand inauguration'),
      EVENT_NEW_RECORD => clienttranslate('New speed record!'),
      EVENT_STRIKE => clienttranslate('Drivers’ strike'),
      EVENT_RESTRICTIONS_LIFTED => clienttranslate('Engine restrictions lifted'),
      EVENT_RECORD_CROWDS => clienttranslate('Record crowds'),
      EVENT_CORRUPTION => clienttranslate('Corruption in rules committee'),
      EVENT_TITLE_SPONSOR => clienttranslate('New title sponsor'),
      EVENT_FIRST_LIVE_TV => clienttranslate('First live televised race'),
      EVENT_SAFETY_REGULATIONS => clienttranslate('New safety regulations'),
      EVENT_FUTURE_UNKNOWN => clienttranslate('Title sponsor withdraws future unknown'),
    ];

    $i = $datas['index'];
    self::notifyAll(
      'newChampionshipRace',
      clienttranslate('Race ${n}/${m} of championship will take place on board ${board} with following event: ${event}'),
      [
        'i18n' => ['board', 'event'],
        'n' => $i + 1,
        'm' => count($datas['circuits']),
        'board' => $circuit->getName(),
        'circuitDatas' => $circuit->getUiData(),
        'event' => $map[$datas['circuits'][$i]['event']],
        'index' => $i,
      ]
    );
  }

  public static function startRace($constructors, $positions)
  {
    self::notifyAll('startRace', clienttranslate('Order on the starting grid is: ${constructors_names}'), [
      'constructors' => $constructors,
      'cells' => $positions,
    ]);
  }

  public static function setWeather($weather)
  {
    self::notifyAll('setWeather', clienttranslate('Weather tiles and road condition tokens are revealed'), [
      'weather' => $weather,
    ]);
  }

  public function drawSponsor($constructor, $card, $reason)
  {
    if (is_null($card)) {
      $msg = clienttranslate('${constructor_name} cannot draw a sponsor card because none are left');
      self::message($msg, ['constructor' => $constructor]);
    } else {
      $msg = '';
      $pmsg = '';
      // SLIPSTREAM THROUH PRESS CORNER
      if ($reason == 'slipstream') {
        $msg = clienttranslate('${constructor_name} slipstreamed through a press corner and gain 1 sponsor card');
        $pmsg = clienttranslate('You slipstreamed through a press corner and gain sponsor ${cards_images}');
      }
      // EXCEED BY 2 PRESS CORNER SPEED
      elseif ($reason == 'exceed') {
        $msg = clienttranslate(
          '${constructor_name} exceeded the speed limit of a press corner by 2 or more and gain 1 sponsor card'
        );
        $pmsg = clienttranslate('You exceeded the speed limit of a press corner by 2 or more and gain sponsor ${cards_images}');
      }
      // EVENT: SPEED RECORD -> REACH SPEED OF 15
      elseif ($reason == EVENT_NEW_RECORD) {
        $msg = clienttranslate('${constructor_name} reached a speed of 15 or more and gain 1 sponsor card (event\'s effect)');
        $pmsg = clienttranslate('You reached a speed of 15 or more and gain sponsor ${cards_images} (event\'s effect)');
      }
      // EVENT: INAUGURATION -> FIRST 3 CARS TO FINISH 1st LAP
      elseif ($reason == EVENT_INAUGURATION) {
        $msg = clienttranslate(
          '${constructor_name} was among the first three drivers to finish the 1st lap and gain 1 sponsor card (event\'s effect)'
        );
        $pmsg = clienttranslate(
          'You were among the first three drivers to finish the 1st lap and gain sponsor ${cards_images} (event\'s effect)'
        );
      }
      // EVENT: FIRST LIVE TV -> PASS 3 CARS IN A TURN
      elseif ($reason == EVENT_FIRST_LIVE_TV) {
        $msg = clienttranslate(
          '${constructor_name} passed at least 3 cars during their round and gain 1 sponsor card (event\'s effect)'
        );
        $pmsg = clienttranslate(
          'You passed at least 3 cars during your round and gain sponsor ${cards_images} (event\'s effect)'
        );
      }

      self::notifyAll('draw', $msg, ['constructor' => $constructor, 'n' => 1,  'areSponsors' => true, ]);
      self::notify($constructor, 'pDraw', $pmsg, ['constructor' => $constructor, 'cards' => [$card],  'areSponsors' => true, ]);
    }
  }

  public function eliminate($constructor, $cell, $canLeave)
  {
    self::notifyAll('eliminate', clienttranslate('${constructor_name} is eliminated from the race and will score 0 points'), [
      'constructor' => $constructor,
      'cell' => $cell,
      'canLeave' => $canLeave,
    ]);
  }

  public function giveUp($constructor, $cell, $canLeave)
  {
    self::notifyAll(
      'eliminate',
      clienttranslate('${constructor_name} gives up the race and takes the last remaining spot on the podium'),
      [
        'constructor' => $constructor,
        'cell' => $cell,
        'canLeave' => $canLeave,
        'giveUp' => true,
      ]
    );
  }

  public function cryCauseNotEnoughHeatToPay($constructor, $cell, $turn, $distanceToCorner)
  {
    self::notifyAll(
      'cryCauseNotEnoughHeatToPay',
      clienttranslate('${constructor_name} does not have enough Heat in their engine to pay for all their played cards'),
      [
        'constructor' => $constructor,
        'cell' => $cell,
        'turn' => $turn,
        'distance' => $distanceToCorner,
      ]
    );
  }

  public function discardCantPay($constructor, $cards)
  {
    self::notify(
      $constructor,
      'discard',
      clienttranslate(
        '${constructor_name} can\'t pay for ${cards_images} and therefore discards them and resolve them as stress instead'
      ),
      [
        'constructor' => $constructor,
        'cards' => $cards,
      ]
    );
  }

  ///////////////////////////////////////////////////////////////
  //  _   _           _       _            _
  // | | | |_ __   __| | __ _| |_ ___     / \   _ __ __ _ ___
  // | | | | '_ \ / _` |/ _` | __/ _ \   / _ \ | '__/ _` / __|
  // | |_| | |_) | (_| | (_| | ||  __/  / ___ \| | | (_| \__ \
  //  \___/| .__/ \__,_|\__,_|\__\___| /_/   \_\_|  \__, |___/
  //       |_|                                      |___/
  ///////////////////////////////////////////////////////////////

  /*
   * Automatically adds some standard field about player and/or card
   */
  protected static function updateArgs(&$data)
  {
    if (isset($data['constructor'])) {
      $data['constructor_name'] = $data['constructor']->getName();
      $data['constructor_id'] = $data['constructor']->getId();
      $data['preserve'][] = 'constructor_id';
      if ($data['constructor']->isAI()) {
        $data['i18n'][] = 'constructor_name';
      }
      unset($data['constructor']);
    }
    if (isset($data['constructor2'])) {
      $data['constructor_name2'] = $data['constructor2']->getName();
      $data['constructor_id2'] = $data['constructor2']->getId();
      $data['preserve'][] = 'constructor_id2';
      if ($data['constructor2']->isAI()) {
        $data['i18n'][] = 'constructor_name2';
      }
      unset($data['constructor2']);
    }

    if (isset($data['constructors'])) {
      $args = [];
      $logs = [];
      $data['constructor_ids'] = [];
      foreach ($data['constructors'] as $i => $constructor) {
        $logs[] = '${constructor_name' . $i . '}';
        $args['constructor_name' . $i] = $constructor->getName();
        $args['constructor_id' . $i] = $constructor->getId();
        $data['constructor_ids'][] = $constructor->getId();
        if ($constructor->isAI()) {
          $args['i18n'][] = 'constructor_name' . $i;
        }
      }
      $data['constructors_names'] = [
        'log' => join(', ', $logs),
        'args' => $args,
      ];
      $data['i18n'][] = 'constructors_names';
      unset($data['constructors']);
    }

    if (isset($data['card'])) {
      $data['card_image'] = '';
      $data['preserve'][] = 'card';
    }
    if (isset($data['card2'])) {
      $data['card_image2'] = '';
      $data['preserve'][] = 'card2';
    }

    if (isset($data['cards'])) {
      $data['cards_images'] = '';
      $data['preserve'][] = 'cards';
    }
  }
}

?>
