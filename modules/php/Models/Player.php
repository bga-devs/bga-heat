<?php
namespace HEAT\Models;
use HEAT\Core\Stats;
use HEAT\Core\Notifications;
use HEAT\Core\Preferences;
use HEAT\Managers\Cards;
use HEAT\Core\Globals;
use HEAT\Helpers\Utils;

/*
 * Player: all utility functions concerning a player
 */

class Player extends \HEAT\Helpers\DB_Model
{
  protected $table = 'player';
  protected $primary = 'player_id';
  protected $attributes = [
    'id' => ['player_id', 'int'],
    'no' => ['player_no', 'int'],
    'name' => 'player_name',
    'color' => 'player_color',
    'eliminated' => 'player_eliminated',
    'score' => ['player_score', 'int'],
    'scoreAux' => ['player_score_aux', 'int'],
    'zombie' => 'player_zombie',
  ];

  public function getUiData($currentPlayerId = null)
  {
    $data = parent::getUiData();
    $current = $this->id == $currentPlayerId;
    return $data;
  }

  public function getPref($prefId)
  {
    return Preferences::get($this->id, $prefId);
  }

  public function getStat($name)
  {
    $name = 'get' . \ucfirst($name);
    return Stats::$name($this->id);
  }

  public function setStat($name, $val)
  {
    $name = 'set' . \ucfirst($name);
    return Stats::$name($this->id, $val);
  }

  public function incStat($name, $val = 1)
  {
    $name = 'inc' . \ucfirst($name);
    return Stats::$name($this->id, $val);
  }
}
