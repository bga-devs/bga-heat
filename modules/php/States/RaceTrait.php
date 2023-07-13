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
      $constructor->setSpeed(null);
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

  function stEndRound()
  {
    die('todo');
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
    $planification = Globals::getPlanification();

    // Keep that hidden
    // foreach($planification as $pId => $cardIds){
    //   $constructor = Constructors::getOfPlayer($pId);
    //   $constructor->setGear(count($cardIds));
    //   Notifications::setGear()
    // }

    $this->initCustomTurnOrder('reveal', null, 'stReveal', 'stEndOfRound');
  }

  /////////////////////////////////////
  //  ____                      _
  // |  _ \ _____   _____  __ _| |
  // | |_) / _ \ \ / / _ \/ _` | |
  // |  _ <  __/\ V /  __/ (_| | |
  // |_| \_\___| \_/ \___|\__,_|_|
  /////////////////////////////////////
  public function stReveal()
  {
    $constructor = Constructors::getActive();
    $planification = Globals::getPlanification();
    $cardIds = $planification[$constructor->getPId()];

    // Setup gear and reveal cards
    $newGear = count($cardIds);
    $heat = null;
    if (abs($newGear - $constructor->getGear()) > 1) {
      die('TODO : pay a heat for change of two gears');
    }
    $constructor->setGear($newGear);
    Cards::move($cardIds, ['inplay', $constructor->getId()]);
    $cards = Cards::getMany($cardIds);
    Notifications::reveal($constructor, $newGear, $cards, $heat);

    // TODO : handle stress

    $this->gamestate->jumpToState(ST_CHOOSE_SPEED);
  }

  ///////////////////////////////////
  //  ____                      _
  // / ___| _ __   ___  ___  __| |
  // \___ \| '_ \ / _ \/ _ \/ _` |
  //  ___) | |_) |  __/  __/ (_| |
  // |____/| .__/ \___|\___|\__,_|
  //       |_|
  ///////////////////////////////////

  public function argsChooseSpeed()
  {
    $constructor = Constructors::getActive();

    // Compute speed
    $speed = 0;
    foreach ($constructor->getPlayedCards() as $card) {
      $speed += $card['speed'];
    }
    $possibleSpeeds = [$speed];

    // Compute ending cells
    $speeds = [];
    foreach ($possibleSpeeds as $speed) {
      list($newCell, ,) = $this->getCircuit()->getReachedCell($constructor, $speed);
      $speeds[$speed] = $newCell;
    }

    return [
      'speeds' => $speeds,
    ];
  }

  public function stChooseSpeed()
  {
    // TODO : enable
    // $speeds = $this->argsChooseSpeed();
    // if(count($speeds) == 1){
    //   $this->actChooseSpeed($speeds[0], true);
    // }
  }

  public function actChooseSpeed($speed, $auto = false)
  {
    if (!$auto) {
      self::checkAction('actChooseSpeed');
    }
    $args = $this->argsChooseSpeed();
    if (!array_key_exists($speed, $args['speeds'])) {
      throw new \BgaVisibleSystemException('Invalid speed. Should not happen');
    }

    // Set the speed and move the car
    $constructor = Constructors::getActive();
    $constructor->setSpeed($speed);

    // Compute the new cell
    list($newCell, $nSpacesForward, $extraTurns) = $this->getCircuit()->getReachedCell($constructor, $speed);
    $constructor->setCarCell($newCell);
    $constructor->incTurn($extraTurns);
    Notifications::moveCar($constructor, $speed, $nSpacesForward, $extraTurns);

    $this->nextPlayerCustomOrder('reveal');
  }
}
