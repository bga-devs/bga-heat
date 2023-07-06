<?php
namespace AK\Actions;
use AK\Managers\Cards;
use AK\Managers\Players;
use AK\Core\Notifications;
use AK\Core\Stats;
use AK\Helpers\Utils;

class Archive extends \AK\Models\Action
{
  public function getState()
  {
    return ST_ARCHIVE;
  }

  public function getDescription()
  {
    return clienttranslate('Archive (discard cards to remove <KNOWLEDGE>)');
  }

  public function argsArchive()
  {
    $player = Players::getActive();
    return [
      '_private' => [
        'active' => [
          'cardIds' => $player->getHand()->getIds(),
        ],
      ],
    ];
  }

  public function actArchive($cardIds)
  {
    // Sanity checks
    self::checkAction('actArchive');
    $player = Players::getActive();
    $cards = $this->argsArchive()['_private']['active']['cardIds'];
    if (!empty(array_diff($cardIds, $cards))) {
      throw new \BgaVisibleSystemException('Invalid cards to discard. Should not happen');
    }

    // Discard cards
    $cards = Cards::get($cardIds);
    Cards::discard($cardIds);
    Notifications::discardCards($player, $cards);

    $this->insertAsChild([
      'action' => REMOVE_KNOWLEDGE,
      'args' => ['n' => count($cardIds)],
    ]);

    $this->resolveAction(['n' => count($cardIds)]);
  }
}
