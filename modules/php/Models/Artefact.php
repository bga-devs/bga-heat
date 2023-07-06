<?php
namespace HEAT\Models;
use HEAT\Core\Stats;
use HEAT\Core\Notifications;
use HEAT\Core\Preferences;
use HEAT\Managers\Actions;
use HEAT\Managers\Meeples;
use HEAT\Core\Globals;
use HEAT\Core\Engine;
use HEAT\Helpers\FlowConvertor;
use HEAT\Helpers\Utils;

/*
 * Artefact: all utility functions concerning an artefact
 */

class Artefact extends \HEAT\Helpers\DB_Model
{
  protected $table = 'cards';
  protected $primary = 'card_id';
  protected $attributes = [
    'id' => 'card_id',
    'location' => 'card_location',
    'state' => ['card_state', 'int'],
    'pId' => ['player_id', 'int'],
  ];

  protected $staticAttributes = [
    ['number', 'int'],
    ['name', 'str'],
    ['text', 'obj'],
    ['country', 'str'],
    ['startingHand', 'int'],
    ['discard', 'int'],
    ['activation', 'string'],
    ['effect', 'obj'],

    ['implemented', 'bool'],
  ];

  public function getType()
  {
    return ARTEFACT;
  }

  public function isArtefact()
  {
    return true;
  }

  public function getKnowledgeReduction($card)
  {
    return 0;
  }

  public function getPlayer()
  {
    return Players::get($this->pId);
  }

  public function countIcon($icon)
  {
    return $this->getPlayer()->countIcon($icon);
  }

  /**
   * Event modifiers template
   **/
  public function isListeningTo($event)
  {
    return false;
  }
}
