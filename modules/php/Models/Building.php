<?php
namespace AK\Models;
use AK\Core\Stats;
use AK\Core\Notifications;
use AK\Core\Preferences;
use AK\Managers\Actions;
use AK\Managers\Meeples;
use AK\Core\Globals;
use AK\Core\Engine;
use AK\Helpers\FlowConvertor;
use AK\Helpers\Utils;

/*
 * Building: all utility functions concerning a building
 */

class Building extends \AK\Helpers\DB_Model
{
  protected $table = 'cards';
  protected $primary = 'card_id';
  protected $attributes = [
    'id' => 'card_id',
    'location' => 'card_location',
    'state' => ['card_state', 'int'],
    'pId' => ['player_id', 'int'],
    'knowledge' => ['knowledge', 'int'],
  ];

  protected $staticAttributes = [
    ['type', 'str'],
    ['number', 'int'],
    ['name', 'str'],
    ['text', 'obj'],
    ['country', 'str'],
    ['startingHand', 'int'],
    ['startingSpace', 'int'],
    ['initialKnowledge', 'int'],
    ['victoryPoint', 'int'],
    ['discard', 'int'],
    ['locked', 'bool'],
    ['activation', 'string'],
    ['effect', 'obj'],

    ['implemented', 'bool'],
  ];

  public function isArtefact()
  {
    return false;
  }

  public function getPlayer()
  {
    return Players::get($this->pId);
  }

  public function isRotated()
  {
    return $this->state == 1;
  }

  public function getTimelineSpace()
  {
    $t = explode('-', $this->location);
    if ($t[0] != 'timeline') {
      return null;
    } else {
      return [$t[1], $t[2]];
    }
  }

  public function getAdjacentBuildings()
  {
    $space = $this->getTimelineSpace();
    if (is_null($space)) {
      return [];
    } else {
      $slots = [[$t[0], 1 - $t[1]]]; // Space above/below
      if ($t[0] > 1) {
        $slots[] = [$t[0] - 1, $t[1]];
      }
      if ($t[0] < 6) {
        $slots[] = [$t[0] + 1, $t[1]];
      }

      $cards = [];
      $player = $this->getPlayer();
      foreach ($slots as $space) {
        $card = $player->getCardOnTimelineSpace($space);
        if (!is_null($card)) {
          $cards[] = $card;
        }
      }

      return $cards;
    }
  }

  public function countAdjacentBuildingTypes()
  {
    $icons = [CITY => 0, MEGALITH => 0, PYRAMID => 0];
    foreach ($this->getAdjacentBuildings() as $card) {
      $icons[$card->getType()]++;
    }

    return $icons;
  }

  public function getInitialKnowledgeDiscount()
  {
    return 0;
  }

  public function getKnowledgeReduction($card)
  {
    return 0;
  }

  public function countIcon($icon)
  {
    return $this->getPlayer()->countIcon($icon);
  }

  public function getReward($n = 1, $mapBonuses = null)
  {
    if (in_array($n, ICONS)) {
      $n = $this->countIcon($n);
    }

    $g = 0;
    foreach ($mapBonuses as $v => $gain) {
      if ($n >= $v) {
        $g = $gain;
      }
    }
    return $g;
  }

  /**
   * Event modifiers template
   **/
  public function isListeningTo($event)
  {
    return false;
  }
}
