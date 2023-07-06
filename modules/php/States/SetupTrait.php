<?php
namespace AK\States;
use AK\Core\Globals;
use AK\Core\Notifications;
use AK\Core\Engine;
use AK\Core\Stats;
use AK\Core\Preferences;
use AK\Managers\Players;
use AK\Managers\Cards;
use AK\Managers\Technologies;
use AK\Managers\Actions;
use AK\Helpers\Utils;
use AK\Helpers\Log;

trait SetupTrait
{
  /*
   * setupNewGame:
   */
  protected function setupNewGame($players, $options = [])
  {
    Globals::setupNewGame($players, $options);
    Players::setupNewGame($players, $options);
    Preferences::setupNewGame($players, $this->player_preferences);
    //        Meeples::setupNewGame($players, $options);
    Cards::setupNewGame($players, $options);
    Technologies::setupNewGame($players, $options);
    // Stats::checkExistence();

    Globals::setFirstPlayer($this->getNextPlayerTable()[0]);

    $this->setGameStateInitialValue('logging', true);
    $this->activeNextPlayer();
  }

  public function stSetupBranch()
  {
    if (Globals::isStartingHands()) {
      $this->gamestate->nextState('done');
    } else {
      Cards::initialDraw();
      $this->gamestate->setAllPlayersMultiactive();
      $this->gamestate->nextState('selection');
    }
  }

  public function stFinishSetup()
  {
    // Extra card for 3rd and 4th players
    Cards::extraInitialDraw();

    // Setup technology tiles
    Technologies::initialDraw();

    // Start infinite turns loop
    $this->initCustomDefaultTurnOrder('turn', ST_TURNACTION, ST_BREAK_MULTIACTIVE, true);
  }

  /////////////////////////////////////////////////
  //    ____       _           _   _
  //   / ___|  ___| | ___  ___| |_(_) ___  _ __
  //   \___ \ / _ \ |/ _ \/ __| __| |/ _ \| '_ \
  //    ___) |  __/ |  __/ (__| |_| | (_) | | | |
  //   |____/ \___|_|\___|\___|\__|_|\___/|_| |_|
  /////////////////////////////////////////////////

  public function argsInitialSelection()
  {
    $selection = Globals::getInitialSelection();
    $args = ['_private' => []];
    foreach (Players::getAll() as $pId => $player) {
      $hand = $player->getHand();
      $args['_private'][$pId] = [
        'cards' => $hand->getIds(),
        'selection' => $selection[$pId] ?? null,
      ];
    }

    return $args;
  }

  public function actSelectCardsToDiscard($cardIds)
  {
    self::checkAction('actSelectCardsToDiscard');

    $player = Players::getCurrent();
    $selection = Globals::getInitialSelection();
    $selection[$player->getId()] = $cardIds;
    Globals::setInitialSelection($selection);
    Notifications::updateInitialSelection($player, self::argsInitialSelection());

    $this->updateActivePlayersInitialSelection();
  }

  public function actCancelSelection()
  {
    $this->gamestate->checkPossibleAction('actCancelSelection');

    $player = Players::getCurrent();
    $selection = Globals::getInitialSelection();
    unset($selection[$player->getId()]);
    Globals::setInitialSelection($selection);
    Notifications::updateInitialSelection($player, self::argsInitialSelection());

    $this->updateActivePlayersInitialSelection();
  }

  public function updateActivePlayersInitialSelection()
  {
    // Compute players that still need to select their card
    // => use that instead of BGA framework feature because in some rare case a player
    //    might become inactive eventhough the selection failed (seen in Agricola and Rauha at least already)
    $selection = Globals::getInitialSelection();
    $players = Players::getAll();
    $ids = $players->getIds();
    $ids = array_diff($ids, array_keys($selection));

    // At least one player need to make a choice
    if (!empty($ids)) {
      $this->gamestate->setPlayersMultiactive($ids, 'done', true);
    }
    // Everyone is done => discard cards and proceed
    else {
      $selection = Globals::getInitialSelection();
      foreach ($players as $pId => $player) {
        $cardIds = $selection[$pId];
        $cards = Cards::get($cardIds);
        Cards::discard($cardIds);
        Notifications::discardCards(
          $player,
          $cards,
          null,
          clienttranslate('${player_name} discards 4 cards (initial selection)')
        );
      }

      Log::checkpoint();

      $this->gamestate->nextState('done');
    }
  }
}
