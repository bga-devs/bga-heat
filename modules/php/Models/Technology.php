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
 * Technology: all utility functions concerning a tech
 */

class Technology extends \HEAT\Helpers\DB_Model
{
  protected $table = 'technologies';
  protected $primary = 'technology_id';
  protected $attributes = [
    'id' => 'technology_id',
    'location' => 'technology_location',
    'state' => ['technology_state', 'int'],
    'pId' => ['player_id', 'int'],
  ];

  protected $staticAttributes = [
    ['number', 'int'],
    ['name', 'str'],
    ['type', 'str'],
    ['level', 'int'],
    ['requirement', 'obj'],
    ['activation', 'string'],
    ['effect', 'obj'],

    ['implemented', 'bool'],
  ];

  public function canBePlayed($player)
  {
    return true;
  }

  /**
   * Event modifiers template
   **/
  public function isListeningTo($event)
  {
    return false;
  }
}
