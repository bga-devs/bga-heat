<?php
namespace HEAT\Managers;

use BgaVisibleSystemException;
use HEAT\Core\Stats;
use HEAT\Core\Globals;
use HEAT\Helpers\UserException;
use HEAT\Helpers\Collection;

/* Class to manage all the meeples for Federation */

class Meeples extends \HEAT\Helpers\Pieces
{
  protected static $table = 'meeples';
  protected static $prefix = 'meeple_';
  protected static $customFields = ['type', 'arg', 'player_id'];
  protected static $autoremovePrefix = false;

  protected static function cast($meeple)
  {
    $classes = [
      ALTERATION => 'Alteration',
      AMBASSADOR => 'Ambassador',
      ASSISTANT => 'Assistant',
      MEDAL => 'Medal',
    ];
    $class = '\HEAT\Models\\' . ($classes[$meeple['type']] ?? 'Meeple');
    return new $class($meeple);
  }

  public static function getUiData()
  {
    return self::getAll()->toArray();
  }

  ////////////////////////////////////
  //  ____       _
  // / ___|  ___| |_ _   _ _ __
  // \___ \ / _ \ __| | | | '_ \
  //  ___) |  __/ |_| |_| | |_) |
  // |____/ \___|\__|\__,_| .__/
  //                      |_|
  ////////////////////////////////////

  /* Creation of various meeples */
  public static function setupNewGame($players, $options)
  {
    $meeples = [];
    foreach ($players as $pId => $player) {
      // Ambassadors
      $meeples[] = [
        'type' => AMBASSADOR,
        'arg' => 1,
        'location' => RESERVE,
        'player_id' => $pId,
      ];
      $meeples[] = [
        'type' => AMBASSADOR,
        'arg' => 1,
        'location' => RESERVE,
        'player_id' => $pId,
      ];
      $meeples[] = [
        'type' => AMBASSADOR,
        'arg' => 2,
        'location' => RESERVE,
        'player_id' => $pId,
      ];
      $meeples[] = [
        'type' => AMBASSADOR,
        'arg' => 3,
        'location' => RESERVE,
        'player_id' => $pId,
      ];
      // assistants
      $meeples[] = [
        'type' => ASSISTANT,
        'arg' => 0,
        'location' => RESERVE,
        'player_id' => $pId,
      ];
    }

    // Medals
    $medals = [3, 4, 5, 6];
    if (count($players) == 3) {
      $medals = [4, 5, 6];
    }
    if (count($players) == 2) {
      $medals = [4, 6];
    }
    foreach (PLANETS as $planet) {
      foreach ($medals as $influence) {
        $meeples[] = [
          'type' => MEDAL,
          'arg' => $planet,
          'location' => $planet . '-' . $influence,
        ];
      }
    }

    // Alterations
    $tokenIds = self::getAlterationTokenIdsByPower();
    for ($i = 1; $i <= 4; $i++) {
      shuffle($tokenIds[$i]);
    }
    $powers = [1, 2, 2, 3, 3, 3, 4];
    foreach ($powers as $inf => $power) {
      $influence = $inf + 1;
      for ($spot = 0; $spot < 4; $spot++) {
        $id = array_shift($tokenIds[$power]);
        $meeples[] = [
          'type' => ALTERATION,
          'arg' => $id,
          'location' => \PLANET_BLUE . '-' . $influence . '-' . $spot,
          'state' => $influence == 1 ? 1 : 0,
        ];
      }
    }

    return self::getMany(self::create($meeples));
  }

  public static function getMeeples($type, $pId)
  {
    if (!in_array($type, MEEPLES)) {
      throw new BgaVisibleSystemException('Invalid type of meeple : ' . $type);
      return;
    }
    if (is_null($pId)) {
      return self::getAll()->filter(function ($m) use ($type) {
        return $m->type == $type;
      });
    } else {
      return self::getAll()->filter(function ($m) use ($pId, $type) {
        return $m->type == $type && $m->pId == $pId;
      });
    }
  }

  //////////////////////////////////////////////////////
  //     _    _ _                 _   _
  //    / \  | | |_ ___ _ __ __ _| |_(_) ___  _ __
  //   / _ \ | | __/ _ \ '__/ _` | __| |/ _ \| '_ \
  //  / ___ \| | ||  __/ | | (_| | |_| | (_) | | | |
  // /_/   \_\_|\__\___|_|  \__,_|\__|_|\___/|_| |_|
  //////////////////////////////////////////////////////

  public static function getAlterationTokenIdsByPower()
  {
    $tokenIds = [];
    foreach (self::getAlterationTokens() as $id => $token) {
      $tokenIds[$token['power']][] = $id;
    }

    return $tokenIds;
  }

  public static function getAlterationTokens()
  {
    $v = function ($power, $vote, $bonus) {
      return [
        'power' => $power,
        'side' => \SIDE_VOTING,
        'vote' => $vote,
        'bonus' => $bonus,
      ];
    };
    $f = function ($power, $bonus) {
      return [
        'power' => $power,
        'side' => \SIDE_FUNDING,
        'bonus' => $bonus,
      ];
    };

    return [
      // Power 1
      $v(1, 2, [FUNDING => 1]),
      $v(1, 2, [COPPERNIUM => 1]),
      $v(1, 2, [AUTHORITY => 1]),
      $v(1, 2, [AUTHORITY => 1]),
      $v(1, 2, [DICE => 1]),
      $v(1, 2, [OCEANIUM => 1]),
      $v(1, 2, [COPPERNIUM => 1]),
      $v(1, 1, [SPACESHIP => 1]),
      $v(1, 2, [LAVANDIUM => 2]),
      $v(1, 2, [OCEANIUM => 1]),
      $v(1, 2, [DICE => 1]),
      $v(1, 1, [SPACESHIP => 1]),
      $f(1, [\AUTHORITY => 1]),
      $f(1, [\AUTHORITY => 1]),
      $f(1, [DICE => 1]),
      $f(1, [\OCEANIUM => 1]),
      $f(1, [\OCEANIUM => 1]),
      $f(1, [\COPPERNIUM => 2]),
      $f(1, [\LAVANDIUM => 2]),
      $f(1, [\COPPERNIUM => 1, \LAVANDIUM => 1]),
      $f(1, [\COPPERNIUM => 1, \LAVANDIUM => 1]),
      // Power 2
      $v(2, 3, [DICE => 1]),
      $v(2, 3, [\OCEANIUM => 1]),
      $v(2, 2, [AUTHORITY => 1, DICE => 1]),
      $v(2, 2, [\SPACESHIP => 1]),
      $v(2, 3, [\AUTHORITY => 1]),
      $v(2, 3, [\AUTHORITY => 1]),
      $f(2, [\DICE => 1, FUNDING => 1]),
      $f(2, [\COPPERNIUM => 1, \OCEANIUM => 1]),
      $f(2, [\LAVANDIUM => 1, \OCEANIUM => 1]),
      $f(2, [\AUTHORITY => 1, FUNDING => 1]),
      // Power 3
      $v(3, 4, [\OCEANIUM => 1]),
      $v(3, 4, [\DICE => 1]),
      $v(3, 3, [\SPACESHIP => 1]),
      $v(3, 6, [LAVANDIUM => -1]),
      $v(3, 4, [LAVANDIUM => 1, \COPPERNIUM => 1]),
      $v(3, 3, [\SPACESHIP => 1]),
      $v(3, 4, [\AUTHORITY => 1]),
      $v(3, 2, [\GOLD => 1]),
      $v(3, 4, [\AUTHORITY => 1]),
      $v(3, 4, [\DICE => 1]),
      $f(3, [\AUTHORITY => 2]),
      $f(3, [\OCEANIUM => 2]),
      $f(3, [\GOLD => 1]),
      $f(3, [\COPPERNIUM => 1, PROJECT => 1]),
      // Power 4
      $v(4, 6, [\OCEANIUM => 1]),
      $v(4, 4, [\COPPERNIUM => 1, \OCEANIUM => 1, GOLD => 1]),
      $v(4, 5, [\DICE => 1, \AUTHORITY => 1]),
      $v(4, 5, [PROJECT => 1]),
      $f(4, [\COPPERNIUM => 1, \OCEANIUM => 1, GOLD => 1]),
      $f(4, [\PROJECT => 2]),
    ];
  }

  //////////////////////////////////////////////////////////////////
  //              | |                           | |
  //  __ _ _ __ ___ | |__   __ _ ___ ___  __ _  __| | ___  _ __ ___
  // / _` | '_ ` _ \| '_ \ / _` / __/ __|/ _` |/ _` |/ _ \| '__/ __|
  //| (_| | | | | | | |_) | (_| \__ \__ \ (_| | (_| | (_) | |  \__ \
  // \__,_|_| |_| |_|_.__/ \__,_|___/___/\__,_|\__,_|\___/|_|  |___/
  //////////////////////////////////////////////////////////////////

  /*
   * return all ambassadors in game
   * @return array of instances of Ambassador
   */
  public static function getAllAmbassadors()
  {
    return new Collection([]);
  }

  public static function getAmbassadorsOnBoard()
  {
    return self::getAllAmbassadors()
      ->filter(function ($ambassador) {
        return $ambassador->getBoardId() > 0;
      })
      ->toArray();
  }

  //////////////////////////////////////////////////////////
  //___   __   __  __  __  ______  ___  __  __ ______  __
  //// \\ (( \ (( \ || (( \ | || | // \\ ||\ || | || | (( \
  //||=||  \\   \\  ||  \\    ||   ||=|| ||\\||   ||    \\
  //|| || \_)) \_)) || \_))   ||   || || || \||   ||   \_))
  //////////////////////////////////////////////////////////
}
