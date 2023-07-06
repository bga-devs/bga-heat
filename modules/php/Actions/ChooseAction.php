<?php
namespace AK\Actions;
use AK\Managers\Meeples;
use AK\Managers\Players;
use AK\Core\Notifications;
use AK\Managers\ActionCards;
use AK\Core\Engine;
use AK\Core\Globals;
use AK\Core\Stats;
use AK\Helpers\Utils;

class ChooseAction extends \AK\Models\Action
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
