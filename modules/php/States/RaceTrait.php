<?php
namespace HEAT\States;
use HEAT\Core\Globals;
use HEAT\Core\Notifications;
use HEAT\Core\Stats;
use HEAT\Helpers\Log;
use HEAT\Managers\Constructors;
use HEAT\Managers\Players;
use HEAT\Managers\Cards;

trait RaceTrait
{
  function getCircuit()
  {
    if (!isset($this->circuit)) {
      $names = [
        'usa' => 'USA',
        'italia' => 'Italia',
        'gb' => 'GB',
        'france' => 'France',
      ];
      $className = '\\HEAT\\Circuits\\' . $names[Globals::getCircuit()];
      $this->circuit = new $className();
    }

    return $this->circuit;
  }

  function stStartRace()
  {
    $circuit = $this->getCircuit();
    $cells = $circuit->getStartingCells();
    foreach (Constructors::getTurnOrder() as $i => $cId) {
      $constructor = Constructors::get($cId);
      $constructor->setCarCell($cells[$i]);
      $constructor->setTurn(-1);
      $constructor->setGear(1);
    }

    $this->gamestate->nextState('startRound');
  }

  ///////////////////////////////////
  //  ____                       _
  // |  _ \ ___  _   _ _ __   __| |
  // | |_) / _ \| | | | '_ \ / _` |
  // |  _ < (_) | |_| | | | | (_| |
  // |_| \_\___/ \__,_|_| |_|\__,_|
  ///////////////////////////////////

  function stStartRound()
  {
    Globals::setPlanification([]);
    $this->gamestate->setAllPlayersMultiactive();
    $this->gamestate->nextState('planification');
  }

  ////////////////////////////////////////////////////////////////////
  //  ____  _             _  __ _           _   _
  // |  _ \| | __ _ _ __ (_)/ _(_) ___ __ _| |_(_) ___  _ __
  // | |_) | |/ _` | '_ \| | |_| |/ __/ _` | __| |/ _ \| '_ \
  // |  __/| | (_| | | | | |  _| | (_| (_| | |_| | (_) | | | |
  // |_|   |_|\__,_|_| |_|_|_| |_|\___\__,_|\__|_|\___/|_| |_|
  ////////////////////////////////////////////////////////////////////

  public function argsPlanification()
  {
    $planification = Globals::getPlanification();
    $args = ['_private' => []];
    foreach (Constructors::getAll() as $constructor) {
      if ($constructor->isAI()) {
        continue;
      }
      $pId = $constructor->getPId();
      $hand = $constructor->getHand();
      $args['_private'][$pId] = [
        'cards' => $hand->getIds(),
        'selection' => $planification[$pId] ?? null,
      ];
    }

    return $args;
  }

  public function actPlan($cardIds)
  {
    self::checkAction('actPlan');

    $player = Players::getCurrent();
    $planification = Globals::getPlanification();
    $planification[$player->getId()] = $cardIds;
    Globals::setPlanification($planification);
    Notifications::updatePlanification($player, self::argsPlanification());

    $this->updateActivePlayersInitialSelection();
  }

  public function actCancelPlan()
  {
    $this->gamestate->checkPossibleAction('actCancelPlan');

    $player = Players::getCurrent();
    $planification = Globals::getPlanification();
    unset($planification[$player->getId()]);
    Globals::setPlanification($planification);
    Notifications::updatePlanification($player, self::argsPlanification());

    $this->updateActivePlayersInitialSelection();
  }

  public function updateActivePlayersInitialSelection()
  {
    // Compute players that still need to select their card
    // => use that instead of BGA framework feature because in some rare case a player
    //    might become inactive eventhough the selection failed (seen in Agricola and Rauha at least already)
    $planification = Globals::getPlanification();
    $players = Players::getAll();
    $ids = $players->getIds();
    $ids = array_diff($ids, array_keys($planification));

    // At least one player need to make a choice
    if (!empty($ids)) {
      $this->gamestate->setPlayersMultiactive($ids, 'done', true);
    }
    // Everyone is done => discard cards and proceed
    else {
      $this->stEndOfPlanification();
    }
  }

  public function stEndOfPlanification()
  {
    $planification = Globals::getInitialSelection();
    die('test');
    // foreach ($players as $pId => $player) {
    //   $cardIds = $planification[$pId];
    //   $cards = Cards::get($cardIds);
    //   Cards::discard($cardIds);
    //   Notifications::discardCards(
    //     $player,
    //     $cards,
    //     null,
    //     clienttranslate('${player_name} discards 4 cards (initial selection)')
    //   );
    // }

    $this->gamestate->nextState('done');
  }
}
