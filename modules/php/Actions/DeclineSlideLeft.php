<?php
namespace HEAT\Actions;
use HEAT\Managers\Players;
use HEAT\Core\Notifications;
use HEAT\Core\Stats;
use HEAT\Helpers\Utils;

class DeclineSlideLeft extends \HEAT\Models\Action
{
  public function getState()
  {
    return ST_DECLINE_SLIDE_LEFT;
  }

  public function isAutomatic($player = null)
  {
    return true;
  }

  public function stDeclineSlideLeft()
  {
    $player = Players::getActive();
    $n = 0;
    foreach ($player->getTimeline() as $card) {
      $n++;
      $spot = $card->getTimelineSpace();
      $spot[0]--;
      $card->setLocation("timeline-$spot[0]-$spot[1]");
    }

    if ($n > 0) {
      Notifications::declineSlideLeft($player, $n);
    }
    $this->resolveAction();
  }
}
