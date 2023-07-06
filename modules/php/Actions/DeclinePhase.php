<?php
namespace HEAT\Actions;
use HEAT\Managers\Players;
use HEAT\Core\Notifications;
use HEAT\Core\Stats;
use HEAT\Helpers\Utils;

class DeclinePhase extends \HEAT\Models\Action
{
  public function getState()
  {
    return ST_DECLINE_PHASE;
  }

  public function isAutomatic($player = null)
  {
    return true;
  }

  public function stDeclinePhase()
  {
    $player = Players::getActive();

    // The two first slot of the timeline
    $spaces = [[1, 0], [1, 1]];
    $childs = [];
    foreach ($spaces as $space) {
      $card = $player->getCardOnTimelineSpace($space);
      if (!is_null($card)) {
        $childs[] = [
          'action' => DECLINE_CARD,
          'args' => ['cardId' => $card->getId()],
        ];
      }
    }

    if (!empty($childs)) {
      $this->insertAsChild([
        'type' => \NODE_PARALLEL,
        'childs' => $childs,
      ]);

      $cardsInThePast = $player->getPast()->count() + count($childs);
      if ($cardsInThePast > 7 && Globals::isFirstHalf()) {
        $this->insertAsChild([
          'action' => 'TODO', // Flip techs
        ]);
      } elseif ($cardsInThePast > 14) {
        Globals::setEndOfGameTriggered(true);
      }
    }

    $this->insertAsChild([
      'action' => \DECLINE_PHASE,
      'args' => ['method' => 'stDeclineSlideLeft'],
    ]);

    $this->resolveAction();
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
