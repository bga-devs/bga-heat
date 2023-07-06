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
 * Technology: all utility functions concerning a tech
 */

class Technology extends \AK\Helpers\DB_Model
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
