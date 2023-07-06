<?php
namespace HEAT\Actions;
use HEAT\Managers\Cards;
use HEAT\Managers\Players;
use HEAT\Core\Notifications;
use HEAT\Core\Stats;
use HEAT\Helpers\Utils;

class Excavate extends \HEAT\Models\Action
{
  public function getState()
  {
    return ST_EXCAVATE;
  }

  public function getDescription()
  {
    return clienttranslate('Excavate');
  }

  public function argsExcavate()
  {
    $player = Players::getActive();
    return [
      'cardIds' => $player
        ->getPast()
        ->filter(function ($card) {
          return !$card->isRotated();
        })
        ->getIds(),
    ];
  }

  public function actExcavate($cardIds)
  {
    // Sanity checks
    self::checkAction('actExcavate');
    $player = Players::getActive();
    $cards = $this->argsExcavate()['cards'];
    if (!empty(array_diff($cardIds, $cards))) {
      throw new \BgaVisibleSystemException('Invalid cards to rotate. Should not happen');
    }

    // Rotate cards
    $cards = Cards::get($cardIds);
    Cards::rotate($cardIds);
    Notifications::rotateCards($player, $cards);

    $this->insertAsChild([
      'action' => DRAW,
      'args' => ['n' => 2 * count($cardIds)],
    ]);

    $this->resolveAction(['cardIds' => $cardIds]);
  }
}
