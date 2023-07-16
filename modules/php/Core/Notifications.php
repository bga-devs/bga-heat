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

  public function moveCar($constructor, $newCell, $speed, $nSpacesForward, $extraTurns)
  {
    $msg =
      $speed == $nSpacesForward
        ? clienttranslate('${constructor_name} moves their car ${nForward} spaces forward')
        : clienttranslate(
          '${constructor_name} moves their car ${nForward} spaces forward out of ${speed} because they are blocked by other cars'
        );
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

  public function discard($constructor, $cardIds)
  {
    self::notifyAll('discard', clienttranslate('${constructor_name} discards ${n} card(s)'), [
      'constructor' => $constructor,
      'n' => count($cardIds),
    ]);

    self::notify($constructor, 'pDiscard', clienttranslate('You discards ${n} card(s)'), [
      'constructor' => $constructor,
      'n' => count($cardIds),
      'cardIds' => $cardIds,
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

    self::notify($constructor, 'pDraw', clienttranslate('You draw ${n} card(s)'), [
      'constructor' => $constructor,
      'n' => $cards->count(),
      'cards' => $cards->toArray(),
    ]);
  }

  public function updateTurnOrder($constructors)
  {
    self::notifyAll('updateTurnOrder', clienttranslate('New order is: ${constructors_names}'), [
      'constructors' => $constructors,
    ]);
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
      foreach ($data['constructors'] as $i => $constructor) {
        $logs[] = '${constructor_name' . $i . '}';
        $args['constructor_name' . $i] = $constructor->getName();
        $args['constructor_id' . $i] = $constructor->getId();
      }
      $data['constructors_names'] = [
        'log' => join(', ', $logs),
        'args' => $args,
      ];
      $data['i18n'][] = 'constructors_names';
      unset($data['constructors']);
    }
  }
}

?>
