<?php
namespace HEAT\Models;
use HEAT\Managers\Players;
use HEAT\Managers\Cards;
use HEAT\Core\Globals;
use HEAT\Core\Notifications;
use HEAT\Core\Preferences;
use HEAT\Core\Stats;

/*
 * Constructor: all utility functions concerning a player, real or not
 */

class Constructor extends \HEAT\Helpers\DB_Model
{
  protected $table = 'constructors';
  protected $primary = 'id';
  protected $attributes = [
    'id' => ['id', 'int'],
    'no' => ['no', 'int'],
    'pId' => ['player_id', 'int'],
    'name' => 'name',
    'score' => ['score', 'int'],
    'carPosition' => ['car_position', 'int'],
    'turn' => ['turn', 'int'],
    'gear' => ['gear', 'int'],
  ];

  public function getUiData($currentPlayerId = null)
  {
    $current = $this->pId == $currentPlayerId;
    return array_merge(parent::getUiData(), [
      'ai' => $this->isAI(),
      'lvl' => $this->getLvlAI(),
      'hand' => $current ? $this->getHand()->toArray() : [],
      'handCount' => $this->getHand()->count(),
    ]);
  }

  public function isAI()
  {
    return $this->pId < 0;
  }

  public function getLvlAI()
  {
    return $this->isAI() ? ($this->pId + 20) % 5 : null;
  }

  public function getHand()
  {
    return Cards::getHand($this->id);
  }
}
