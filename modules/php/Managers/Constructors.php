<?php

namespace HEAT\Managers;

use BgaVisibleSystemException;
use HEAT\Core\Stats;
use HEAT\Core\Globals;
use HEAT\Core\Game;
use HEAT\Core\Notifications;
use HEAT\Helpers\UserException;
use HEAT\Helpers\Collection;
use HEAT\Models\Constructor;

/* Class to manage all the constructors for Heat (and handle legend) */

class Constructors extends \HEAT\Helpers\CachedDB_Manager
{
  public static $table = 'constructors';
  protected static $primary = 'id';
  protected static $datas = null;
  protected static function cast($row): Constructor
  {
    return new \HEAT\Models\Constructor($row);
  }

  ///////////////////////////////////
  //  ____       _
  // / ___|  ___| |_ _   _ _ __
  // \___ \ / _ \ __| | | | '_ \
  //  ___) |  __/ |_| |_| | |_) |
  // |____/ \___|\__|\__,_| .__/
  //                      |_|
  ///////////////////////////////////

  public static function assignConstructor($player, $cId, $no)
  {
    self::DB()->insert([
      'id' => $cId,
      'name' => $player->getName(),
      'no' => $no,
      'player_id' => $player->getId(),
      'turn' => 0,
      'score' => 0,
      'gear' => 1,
      'speed' => -1,
    ]);
    self::invalidate();
  }

  public static function assignConstructorAutoma($fakePId, $cId, $no)
  {
    $names = [
      \CONSTRUCTOR_BLACK => clienttranslate('Black legend'),
      \CONSTRUCTOR_BLUE => clienttranslate('Blue legend'),
      \CONSTRUCTOR_RED => clienttranslate('Red legend'),
      \CONSTRUCTOR_YELLOW => clienttranslate('Yellow legend'),
      \CONSTRUCTOR_GREEN => clienttranslate('Green legend'),
      \CONSTRUCTOR_GRAY => clienttranslate('Gray legend'),
      \CONSTRUCTOR_ORANGE => clienttranslate('Orange legend'),
      \CONSTRUCTOR_PURPLE => clienttranslate('Purple legend')
    ];
    $name = $names[$cId];

    self::DB()->insert([
      'id' => $cId,
      'name' => $name,
      'no' => $no,
      'player_id' => $fakePId,
      'turn' => 0,
      'score' => 0,
      'gear' => 1,
      'speed' => -1,
    ]);
    self::invalidate();
  }

  /*
   * Return the number of companies
   */
  public static function count(): int
  {
    return Globals::getCountConstructors();
  }

  /*
   * getUiData : get all ui data of all players
   */
  public static function getUiData($cId): Collection
  {
    return self::getAll()->map(function ($constructor) use ($cId) {
      return $constructor->getUiData($cId);
    });
  }

  /*
   * Get current turn order
   */
  public static function getTurnOrder(): array
  {
    return Globals::getTurnOrder();
  }

  /*
   * get : returns the Constructor object for the given player ID
   */
  public static function get($cId = null): Constructor
  {
    $cId = is_null($cId) ? self::getActiveId() : $cId;
    return parent::get($cId);
  }

  public static function getOfPlayer($pId): Constructor
  {
    $pId = is_int($pId) ? $pId : $pId->getId();
    return self::getAll()
      ->filter(function ($constructor) use ($pId) {
        return $constructor->getPId() == $pId;
      })
      ->first();
  }

  /**
   * Emulate active constructor via a global
   */
  public static function getActiveId(): int
  {
    return Globals::getActiveConstructor();
  }

  public static function getActive(): Constructor
  {
    return self::get(self::getActiveId());
  }

  public static function changeActive($constructor)
  {
    if (is_int($constructor)) {
      $constructor = self::get($constructor);
    }
    // die("test");
    $constructorId = $constructor->getId();
    Globals::setActiveConstructor($constructorId);
    if (!$constructor->isAI()) {
      Game::get()->gamestate->changeActivePlayer($constructor->getPId());
    }
  }
}
