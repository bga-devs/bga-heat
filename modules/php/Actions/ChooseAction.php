<?php
namespace HEAT\Actions;
use HEAT\Managers\Meeples;
use HEAT\Managers\Players;
use HEAT\Core\Notifications;
use HEAT\Managers\ActionCards;
use HEAT\Core\Engine;
use HEAT\Core\Globals;
use HEAT\Core\Stats;
use HEAT\Helpers\Utils;

class ChooseAction extends \HEAT\Models\Action
{
  public function getState()
  {
    return ST_CHOOSE_ACTION;
  }

  public function getDescription()
  {
    return clienttranslate('Choose an action');
  }

  public function argsChooseActionCard()
  {
    $player = Players::getActive();
    return [];
  }

  public function actChooseAction($actionName)
  {
    self::checkAction('actChooseAction');
    $actions = [
      'archive' => ARCHIVE,
      'create' => CREATE,
      'learn' => LEARN,
      'search' => DRAW,
      'excavate' => EXCAVATE,
    ];
    if (!array_key_exists($actionName, $actions)) {
      throw new \BgaVisibleSystemException('Invalid action. Should not happen');
    }

    // Insert node
    $player = Players::getActive();
    $this->insertAsChild([
      'action' => $actions[$actionName],
      'pId' => $player->getId(),
    ]);
    Notifications::chooseAction($player, $actionName);
    $this->resolveAction(['actionName' => $actionName]);
  }
}
