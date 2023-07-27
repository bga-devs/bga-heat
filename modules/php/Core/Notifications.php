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

  public function moveCar($constructor, $newCell, $speed, $nSpacesForward, $extraTurns, $slipstream = false)
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
    ]);

    if ($extraTurns > 0 && $constructor->getTurn() > 0) {
      die('TODO: notif crossing the ending lane');
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
    ]);

    self::notify($constructor, 'pDiscard', clienttranslate('You discards ${cards_images}'), [
      'constructor' => $constructor,
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

  public function payHeatsForCorner($constructor, $cards, $speed, $limit)
  {
    self::notifyAll(
      'payHeatsForCorner',
      clienttranslate('${constructor_name} discards ${n} heat(s) for crossing a corner at speed ${speed} instead of ${limit}'),
      [
        'constructor' => $constructor,
        'n' => count($cards),
        'cards' => $cards->toArray(),
        'speed' => $speed,
        'limit' => $limit,
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
    self::notifyAll('adrenaline', clienttranslate('${constructor_name} uses adrelanine\'s effect to increase their speed by 1'), [
      'constructor' => $constructor,
    ]);
  }

  public function heatedBoost($constructor, $heats, $cards, $card)
  {
    self::notifyAll('payHeats', clienttranslate('${constructor_name} discards 1 heat to get the boost effect'), [
      'constructor' => $constructor,
      'cards' => $heats->toArray(),
    ]);
    self::resolveBoost($constructor, $cards, $card, 1, 1);
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

    if (isset($data['cards'])) {
      $data['cards_images'] = '';
      $data['preserve'][] = 'cards';
    }
  }
}

?>
