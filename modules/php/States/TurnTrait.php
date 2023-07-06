<?php
namespace AK\States;
use AK\Core\Globals;
use AK\Core\Notifications;
use AK\Core\Engine;
use AK\Core\Stats;
use AK\Helpers\Log;
use AK\Managers\Players;
use AK\Managers\Meeples;
use AK\Managers\Cards;
use AK\Managers\Actions;

trait TurnTrait
{
  function actOrderCards($cardIds)
  {
    $player = Players::getCurrent();
    foreach ($cardIds as $i => $cardId) {
      $card = Cards::getSingle($cardId);
      if (is_null($card) || $card->isPlayed() || $card->getPId() != $player->getId()) {
        throw new \BgaVisibleSystemException("You can't reorder that card:" . $card->getId());
      }

      Cards::setState($cardId, $i);
    }
  }

  /**
   * Start Engine
   */
  function stTurnAction()
  {
    $player = Players::getActive();
    self::giveExtraTime($player->getId());

    // if (Globals::isEndTriggered() && Globals::getEndRemainingPlayers() == []) {
    //   $this->endOfGameInit();
    //   return;
    // }

    // Stats::incTurns($player);
    $node = [
      'childs' => [
        [
          'action' => CHOOSE_ACTION,
          'pId' => $player->getId(),
        ],
        [
          'action' => CHOOSE_ACTION,
          'pId' => $player->getId(),
        ],
        [
          'action' => TIMELINE_PHASE,
          'pId' => $player->getId(),
        ],
        [
          'action' => DECLINE_PHASE,
          'pId' => $player->getId(),
        ],
      ],
    ];

    // Inserting leaf Action card
    Engine::setup($node, ['method' => 'stEndOfTurn']);
    Engine::proceed();
  }

  /*******************************
   ********************************
   ********** END OF TURN *********
   ********************************
   *******************************/

  /**
   * End of turn
   */
  function stEndOfTurn()
  {
    $this->nextPlayerCustomOrder('turn');
  }
}
