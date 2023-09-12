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

  public function moveCar($constructor, $newCell, $speed, $nSpacesForward, $extraTurns, $path, $slipstream = false)
  {
    $msg =
      $speed == $nSpacesForward
        ? clienttranslate('${constructor_name} moves their car ${nForward} spaces forward')
        : clienttranslate(
          '${constructor_name} moves their car ${nForward} spaces forward out of ${speed} because they are blocked by other cars'
        );
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
      'path' => $path,
      'preserve' => ['path'],
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

    self::notify($constructor, 'pDiscard', clienttranslate('You discards ${cards_images}'), [
      'constructor' => $constructor,
      'cards' => $cards,
    ]);
  }

  public function reduceStress($constructor, $cards)
  {
    self::notifyAll('discard', clienttranslate('${constructor_name} discards ${n} stress card(s) (reduce stress)'), [
      'constructor' => $constructor,
      'n' => count($cards),
      'cards' => $cards,
    ]);
  }

  public function clearPlayedCards($constructor, $cardIds)
  {
    self::notifyAll('clearPlayedCards', clienttranslate('${constructor_name} discards played card(s)'), [
      'constructor' => $constructor,
      'cardIds' => $cardIds,
    ]);
  }

  public function draw($constructor, $cards)
  {
    self::notifyAll('draw', clienttranslate('${constructor_name} draws ${n} card(s)'), [
      'constructor' => $constructor,
      'n' => count($cards),
    ]);

    self::notify($constructor, 'pDraw', clienttranslate('You draw ${cards_images}'), [
      'constructor' => $constructor,
      'cards' => $cards->toArray(),
    ]);
  }

  public function resolveBoost($constructor, $cards, $card, $i, $n)
  {
    $msg =
      $i == 1 && $n == 1
        ? clienttranslate('${constructor_name} discards ${cards_images} and keep ${card_image} to resolve boost symbol')
        : clienttranslate(
          '${constructor_name} discards ${cards_images} and keep ${card_image} to resolve boost symbol (${i} / ${n})'
        );
    if (empty($cards)) {
      $msg =
        $i == 1 && $n == 1
          ? clienttranslate('${constructor_name} flips ${card_image} to resolve boost symbol')
          : clienttranslate('${constructor_name} flips ${card_image} to resolve boost symbol (${i} / ${n})');
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

  public function payHeatsForCorner($constructor, $cards, $speed, $limit, $cornerPos)
  {
    self::notifyAll(
      'payHeats',
      clienttranslate('${constructor_name} discards ${n} heat(s) for crossing a corner at speed ${speed} instead of ${limit}'),
      [
        'constructor' => $constructor,
        'n' => count($cards),
        'cards' => $cards->toArray(),
        'speed' => $speed,
        'limit' => $limit,
        'corner' => $cornerPos,
      ]
    );
  }

  public function spinOut($constructor, $speed, $limit, $cornerPos, $cards, $cell, $stresses, $nBack)
  {
    self::notifyAll(
      'spinOut',
      clienttranslate(
        '${constructor_name} SPINS OUT! ${constructor_name} crossed a corner at speed ${speed} instead of ${limit} but only have ${n} heat(s) to discard'
      ),
      [
        'constructor' => $constructor,
        'n' => count($cards),
        'cards' => $cards->toArray(),
        'speed' => $speed,
        'limit' => $limit,
        'corner' => $cornerPos,
        'cell' => $cell,
        'stresses' => $stresses,
        'nCellsBack' => $nBack,
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
      self::notifyAll('payHeats', clienttranslate('${constructor_name} discards 1 heat to get the boost effect'), [
        'constructor' => $constructor,
        'cards' => $heats->toArray(),
      ]);
    }
    self::resolveBoost($constructor, $cards, $card, 1, 1);
  }

  public function finishRace($constructor, $podium)
  {
    self::notifyAll('finishRace', clienttranslate('${constructor_name} finishes the race at position ${pos}'), [
      'constructor' => $constructor,
      'pos' => $podium,
    ]);
  }

  public function payHeats($constructor, $heats)
  {
    self::notifyAll('payHeats', clienttranslate('${constructor_name} discards ${n} heat(s) for its played card(s)'), [
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
    self::notifyAll('directPlay', clienttranslate('${constructor_name} plays ${card_name} from their hand'), [
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

  public static function endOfRace($scores)
  {
    self::notifyAll('endOfRace', clienttranslate('End of the race'), [
      'scores' => $scores,
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
    self::notifyAll('endDraftRound', clienttranslate('End of draft round n°${round}, removing leftover cards'), [
      'round' => $round,
      'cardIds' => $cardIds,
    ]);
  }

  public static function reformingDeckWithUpgrades()
  {
    self::notifyAll('reformingDeckWithUpgrades', clienttranslate('End of draft phase, reforming deck with upgrade cards'), []);
  }

  public static function swapUpgrade($constructor, $card1, $card2)
  {
    self::notifyAll(
      'swapUpgrade',
      clienttranslate('${constructor_name} puts back ${card_name2} and takes ${card_name} instead'),
      [
        'constructor' => $constructor,
        'card' => $card1,
        'card2' => $card2,
      ]
    );
  }

  public static function weatherHeats($constructor, $heats, $location)
  {
    self::notifyAll(
      'weatherHeats',
      clienttranslate('${constructor_name} moves ${cards_images} to ${loc} because of weather card'),
      [
        'i18n' => ['loc'],
        'constructor' => $constructor,
        'cards' => $heats,
        'loc' => $location,
        'location' => $location,
      ]
    );
  }

  /////////////////////////////////
  //// CHAMPIONSHIP
  public static function newChampionshipRace($datas, $name)
  {
    $map = [
      EVENT_INAUGURATION => clienttranslate('New grandstand inauguration'),
      EVENT_NEW_RECORD => clienttranslate('New speed record!'),
      EVENT_STRIKE => clienttranslate('Drivers\' strike'),
      EVENT_RESTRICTIONS_LIFTED => clienttranslate('Engine restrictions lifted'),
      EVENT_RECORD_CROWDS => clienttranslate('Record crowds'),
      EVENT_CORRUPTION => clienttranslate('Corruption in rules committee'),
      EVENT_NEW_TITLE_SPONSOR => clienttranslate('New title sponsor'),
      EVENT_FIRST_LIVE_TV => clienttranslate('First live television race'),
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
        'board' => $name,
        'event' => $map[$datas['circuits'][$i]['event']],
        'index' => $i,
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
      unset($data['constructor']);
    }
    if (isset($data['constructor2'])) {
      $data['constructor_name2'] = $data['constructor2']->getName();
      $data['constructor_id2'] = $data['constructor2']->getId();
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
