<?php
namespace AK\Actions;
use AK\Managers\Players;
use AK\Core\Notifications;
use AK\Core\Stats;
use AK\Helpers\Utils;

class DeclineSlideLeft extends \AK\Models\Action
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
