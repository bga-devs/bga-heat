<?php
namespace HEAT\Managers;

use BgaVisibleSystemException;
use HEAT\Core\Stats;
use HEAT\Core\Globals;
use HEAT\Core\Notifications;
use HEAT\Helpers\UserException;
use HEAT\Helpers\Collection;

/* Class to manage all the constructors for Heat (and handle legend) */

class Constructors extends \HEAT\Helpers\DB_Manager
{
  protected static $table = 'constructors';
  protected static $primary = 'id';
  protected static function cast($row)
  {
    return $row;
  }

  ///////////////////////////////////
  //  ____       _
  // / ___|  ___| |_ _   _ _ __
  // \___ \ / _ \ __| | | | '_ \
  //  ___) |  __/ |_| |_| | |_) |
  // |____/ \___|\__|\__,_| .__/
  //                      |_|
  ///////////////////////////////////

  public function assignConstructor($player, $cId)
  {
    self::DB()->insert([
      'id' => $cId,
      'name' => $player->getName(),
      'no' => self::count() - self::getAll()->count(),
      'player_id' => $player->getId(),
      'turn' => 0,
      'score' => 0,
    ]);
    return self::get($cId);
  }

  public function assignConstructorAutoma($fakePId, $cId)
  {
    $name = clienttranslate('Legend I');
    if ($fakePId < -5) {
      $name = clienttranslate('Legend II');
    }
    if ($fakePId < -10) {
      $name = clienttranslate('Legend III');
    }

    self::DB()->insert([
      'id' => $cId,
      'name' => $name,
      'no' => self::count() - self::getAll()->count(),
      'player_id' => $fakePId,
      'score' => 0,
    ]);
    return self::get($cId);
  }

  /*
   * Return the number of companies
   */
  public function count()
  {
    // TODO : remove
    $n = Globals::getCountConstructors();
    return $n == 0 ? self::getAll()->count() : $n;
  }

  public function getAll()
  {
    return self::DB()->get();
  }

  /*
   * Get current turn order
   */
  public function getTurnOrder()
  {
    return Globals::getTurnOrder();
  }

  /*
   * get : returns the Player object for the given player ID
   */
  public function get($pId = null)
  {
    $pId = $pId ?: self::getActiveId();
    return self::DB()
      ->where($pId)
      ->getSingle();
  }

  /**
   * Emulate active constructor via a global
   */
  public function getActiveId()
  {
    return Globals::getActiveConstructor();
  }

  public function getActive()
  {
    return self::get(self::getActiveId());
  }

  public function changeActive($constructor)
  {
    if (is_int($constructor)) {
      $constructor = self::get($constructor);
    }
    $constructorId = $constructor->getId();
    Globals::setActiveConstructor($constructorId);
    if (!$constructor->isAI()) {
      Game::get()->gamestate->changeActivePlayer($constructor->getPId());
    }
  }

  public function resetEnergies()
  {
    self::DB()
      ->update(['energy' => 0])
      ->run();
  }
}
