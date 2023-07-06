<?php
namespace HEAT\Actions;
use HEAT\Managers\Meeples;
use HEAT\Managers\Players;
use HEAT\Core\Notifications;
use HEAT\Core\Stats;
use HEAT\Helpers\Utils;

class TimelinePhase extends \HEAT\Models\Action
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
