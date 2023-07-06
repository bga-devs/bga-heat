<?php
namespace AK\Actions;
use AK\Managers\Meeples;
use AK\Managers\Players;
use AK\Core\Notifications;
use AK\Core\Stats;
use AK\Helpers\Utils;

class TimelinePhase extends \AK\Models\Action
{
  public function getState()
  {
    return ST_TIMELINE_PHASE;
  }

  public function isAutomatic($player = null)
  {
    return true;
  }

  public function stTimelinePhase()
  {
    // TODO
    $this->resolveAction();
  }
}
