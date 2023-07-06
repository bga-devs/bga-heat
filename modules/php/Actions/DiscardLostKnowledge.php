<?php
namespace AK\Actions;
use AK\Managers\Meeples;
use AK\Managers\Players;
use AK\Core\Notifications;
use AK\Core\Stats;
use AK\Helpers\Utils;

class DiscardLostKnowledge extends \AK\Models\Action
{
  public function getState()
  {
    return ST_DISCARD_LOST_KNOWLEDGE;
  }

  public function getDescription()
  {
    $n = $this->getN();
    return [
      'log' => clienttranslate('Discard ${n} <LOST_KNOWLEDGE>'),
      'args' => [
        'n' => $n,
      ],
    ];
  }

  public function isAutomatic($player = null)
  {
    return true;
  }

  public function getN()
  {
    return $this->getCtxArg('n') ?? 1;
  }

  public function stDiscardLostKnowledge()
  {
    $player = Players::getActive();
    $n = $this->getN();

    // Discard lost knowledge
    $knowledge = $player->getLostKnowledge();
    if ($knowledge == 0) {
      Notifications::message(clienttranslate('${player_name} cannot discard lost knowledge since they already have none.'), [
        'player' => $player,
      ]);
    } else {
      $knowledge = max(0, $knowledge - $n);
      $player->setLostKnowledge($knowledge);
      // Stats::incCardsDrawn($player, $nInDeck);
      Notifications::discardLostKnowledge($player, $knowledge);
    }

    $this->resolveAction();
  }
}
