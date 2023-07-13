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

  protected static function notify($player, $name, $msg, $data)
  {
    $pId = is_int($player) ? $player : $player->getId();
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
    self::notify($player, 'updatePlanification', '', [
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
  }
}

?>
