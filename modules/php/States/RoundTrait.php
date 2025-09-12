<?php

namespace HEAT\States;

use HEAT\Core\Globals;
use HEAT\Core\Notifications;
use HEAT\Helpers\Collection;
use HEAT\Helpers\UserException;
use HEAT\Managers\Constructors;
use HEAT\Managers\Players;
use HEAT\Managers\Cards;
use HEAT\Models\Circuit;

trait RoundTrait
{
  ///////////////////////////////////
  //   ____ _                _ _
  //  / ___(_)_ __ ___ _   _(_) |_
  // | |   | | '__/ __| | | | | __|
  // | |___| | | | (__| |_| | | |_
  //  \____|_|_|  \___|\__,_|_|\__|
  ///////////////////////////////////

  public function getCircuit(): Circuit
  {
    if (!isset($this->circuit)) {
      $circuitDatas = Globals::getCircuitDatas();
      $this->circuit = new \HEAT\Models\Circuit($circuitDatas);
    }

    return $this->circuit;
  }

  public function getNbrLaps(): int
  {
    $circuit = $this->getCircuit();
    return is_null($circuit) ? 0 : $circuit->getNbrLaps();
  }

  public function getHandSizeLimit(): int
  {
    $event = Globals::getCurrentEvent();
    if ($event == EVENT_RECORD_CROWDS) {
      return 8;
    } elseif ($event == EVENT_SAFETY_REGULATIONS) {
      return 6;
    } else {
      return 7;
    }
  }

  //////////////////////////////
  //  ____  _             _   
  // / ___|| |_ __ _ _ __| |_ 
  // \___ \| __/ _` | '__| __|
  //  ___) | || (_| | |  | |_ 
  // |____/ \__\__,_|_|   \__|
  //////////////////////////////

  function stStartRound()
  {
    Globals::incRound();

    // Reset planification
    Globals::setPlanification([]);
    $t = [];
    foreach (Constructors::getAll() as $cId => $constructor) {
      $t[$cId] = false;
    }
    Globals::setPlanificationRevealed($t);

    // Reset legend card
    Globals::setLegendCardDrawn(false);

    // Compute players that still need to play that round
    $skipped = Globals::getSkippedPlayers();
    $pIds = Constructors::getAll()
      ->filter(function ($constructor) use ($skipped) {
        return !$constructor->isAI() && !$constructor->isFinished() && !in_array($constructor->getPId(), $skipped);
      })
      ->map(function ($constructor) {
        return $constructor->getPId();
      })
      ->toArray();

    if (empty($pIds)) {
      $this->gamestate->nextState('planification');
      $this->stEndOfPlanification();
    }
    // Deferred rounds
    else if (Globals::isDeferredRounds()) {
      $this->stInitDeferredRound();
    }
    // Normal mode => awake every constructors that need to play this round
    else {
      foreach ($pIds as $pId) {
        self::giveExtraTime($pId);
      }

      $this->gamestate->setPlayersMultiactive($pIds, '', true);
      $this->gamestate->nextState('planification');
    }
  }

  /////////////////////////
  //  _____           _ 
  // | ____|_ __   __| |
  // |  _| | '_ \ / _` |
  // | |___| | | | (_| |
  // |_____|_| |_|\__,_|
  /////////////////////////

  function stEndRound()
  {
    Globals::setDeferredRoundsActive(false);

    // Compute new order
    $positions = [];
    $length = $this->getCircuit()->getLength();
    foreach (Constructors::getAll() as $constructor) {
      if ($constructor->isFinished()) {
        continue;
      }

      $position = $constructor->getPosition();
      $line = $constructor->getLane();
      $raceLine = $this->getCircuit()->getRaceLane($position);
      $uid = ($length * $constructor->getTurn() + $position) * 2 + ($line == $raceLine ? 1 : 0);
      $positions[$uid] = $constructor;
    }

    krsort($positions);
    $order = [];
    $finished = Globals::getFinishedConstructors();
    foreach ($positions as $constructor) {
      $cId = $constructor->getId();

      // Is this car finished ?
      if ($constructor->getTurn() >= $this->getNbrLaps()) {
        $time = Globals::getRound() * 60 + (60 - ($constructor->getPosition() + 1));
        $ftime = intdiv($time, 60) + ($time % 60) / 100;
        $constructor->incStat('time', $ftime);

        $finished[] = $cId;
        $podium = count($finished);
        $constructor->setCarCell(-$podium);
        $canLeave = $constructor->canLeave();
        Notifications::finishRace($constructor, $podium, $canLeave);
      }
      // Otherwise, keep it for next turn
      else {
        $order[] = $cId;
      }
    }
    Globals::setFinishedConstructors($finished);
    if (empty($order)) {
      $this->stFinishRace();
      return;
    }


    Globals::setTurnOrder($order);
    $constructors = [];
    foreach ($order as $i => $cId) {
      $constructor = Constructors::get($cId);
      $constructor->setNo($i);
      $constructor->setSpeed(-1);
      $constructors[] = $constructor;
    }
    Notifications::updateTurnOrder($constructors);

    $this->gamestate->jumpToState(ST_START_ROUND);
  }

  ////////////////////////////////////////////////////////////////////////////
  //  _   ____      ____  _             _  __ _           _   _
  // / | |___ \    |  _ \| | __ _ _ __ (_)/ _(_) ___ __ _| |_(_) ___  _ __
  // | |   __) |   | |_) | |/ _` | '_ \| | |_| |/ __/ _` | __| |/ _ \| '_ \
  // | |_ / __/ _  |  __/| | (_| | | | | |  _| | (_| (_| | |_| | (_) | | | |
  // |_(_)_____(_) |_|   |_|\__,_|_| |_|_|_| |_|\___\__,_|\__|_|\___/|_| |_|
  ////////////////////////////////////////////////////////////////////////////

  public function argsPlanification()
  {
    $planification = Globals::getPlanification();
    $args = ['_private' => []];
    foreach (Constructors::getAll() as $constructor) {
      if ($constructor->isAI() || $constructor->isFinished()) {
        continue;
      }
      $pId = $constructor->getPId();
      $hand = $constructor->getHand()->filter(function ($card) {
        return $card['effect'] != HEAT;
      });

      $flooded = $constructor->isInFloodedSpace();

      // Do we have a cluttered hand ?
      $clutteredHand = false;
      $gear = $constructor->getGear();
      $nHeats = $constructor->getHeatsInEngine();
      $minGear = max(1, $gear - ($nHeats == 0 ? 1 : 2));
      if ($flooded) {
        $maxGearReduction = min(2, $nHeats);
        $minGear = max(1, $gear - $maxGearReduction);
      }
      if (count($hand) < $minGear) {
        $clutteredHand = true;
      }

      // Cluttered hand => make heat selectable
      if ($clutteredHand) {
        $pos = $constructor->getPosition();
        $cells = [$this->getCircuit()->getFreeCell($pos, $constructor->getId(), false)];
        $hand = $constructor->getHand();
        $speeds = $hand->map(fn($card) => 0);
      }
      // Compute how far can he go
      else {
        // Compute corresponding speeds
        $boostingCardIds = [];
        $speeds = $hand->map(function ($card) use (&$boostingCardIds) {
          $speed = $card['speed'];

          // Handle + symbols
          $nBoosts = $card['symbols'][BOOST] ?? 0;
          if ($nBoosts > 0) {
            $boostingCardIds[] = $card['id'];
            $t = [];
            for ($i = $nBoosts; $i <= 4 * $nBoosts; $i++) {
              $t[] = $speed + $i;
            }
            $speed = $t;
          }

          return $speed;
        });
        // Compute max speed
        $maxSpeed = 0;
        foreach ($speeds as $speed) {
          $maxSpeed += is_array($speed) ? max($speed) : $speed;
        }
        // Compute corresponding cells
        $cells = [];
        $pos = $constructor->getPosition();
        for ($i = 0; $i <= $maxSpeed; $i++) {
          $cells[$i] = $this->getCircuit()->getFreeCell($pos + $i, $constructor->getId(), false);
        }
      }

      // Can we give up ?
      $canSkipEndRace =
        !empty(Globals::getFinishedConstructors()) &&
        ($constructor->getTurn() < $this->getNbrLaps() || $constructor->getPosition() / $this->getCircuit()->getLength() < 3 / 4);


      $args['_private'][$pId] = [
        'cards' => $hand->getIds(),
        'speeds' => $speeds,
        'cells' => $cells,
        'selection' => $planification[$pId] ?? null,
        'boostingCardIds' => $boostingCardIds ?? [],
        'clutteredHand' => $clutteredHand,
        'canSkipEndRace' => $canSkipEndRace,
        'flooded' => $flooded,
      ];
    }
    if (empty($args['_private'])) {
      $args['_no_notify'] = true;
    }

    $args['nPlayersLeft'] = count($args['_private']);
    return $args;
  }

  public function actPlan($cardIds)
  {
    self::checkAction('actPlan');
    $player = Players::getCurrent();
    $constructor = Constructors::getOfPlayer($player->getId());
    $args = $this->argsPlanification()['_private'][$player->getId()];
    $newGear = count($cardIds);
    if ($newGear <= 0 || $newGear > 4) {
      throw new UserException(clienttranslate('Invalid number of cards. Should not happen.'));
    }
    $heatCost = abs($newGear - $constructor->getGear()) > 1 ? 1 : 0;
    if ($args['flooded'] && $newGear < $constructor->getGear()) {
      $heatCost++;
    }
    if ($heatCost > $constructor->getHeatsInEngine()) {
      if ($args['flooded']) {
        if ($heatCost == 1) {
          throw new UserException(clienttranslate('You dont have enough heat to pay for the change of gear of 1 (flooded space).'));
        } else {
          throw new UserException(clienttranslate('You dont have enough heat to pay for the change of gear of 2 (flooded space).'));
        }
      } else {
        throw new UserException(clienttranslate('You dont have enough heat to pay for the change of gear of 2.'));
      }
    }
    if ($args['clutteredHand']) {
      foreach ($constructor->getHand() as $card) {
        if ($card['effect'] != HEAT && !in_array($card['id'], $cardIds)) {
          throw new UserException(
            clienttranslate('Cluttered hand: you need to select all your speed cards and complete with heats.')
          );
        }
      }
    } else {
      foreach (Cards::getMany($cardIds) as $card) {
        if ($card['effect'] == HEAT) {
          throw new UserException(clienttranslate('You can\'t select an Heat card unless you have a cluttered hand.'));
        }
      }
    }

    $planification = Globals::getPlanification();
    $planification[$player->getId()] = $cardIds;
    Globals::setPlanification($planification);

    if (Globals::isDeferredRounds()) {
      $this->stEndOfDeferredPlanification();
    } else {
      Notifications::updatePlanification($player, $this->argsPlanification());
      $this->updateActivePlayersInitialSelection();
    }
  }

  public function actCancelPlan()
  {
    if (Globals::isDeferredRounds()) {
      throw new UserException('You cant cancel planification in deferred round mode. Should not happen');
    } else {
      $this->gamestate->checkPossibleAction('actCancelPlan');
    }

    $player = Players::getCurrent();
    if (is_null($player)) {
      throw new UserException('You are not part of the game. Should not happen');
    }
    $planification = Globals::getPlanification();
    unset($planification[$player->getId()]);
    Globals::setPlanification($planification);
    Notifications::updatePlanification($player, $this->argsPlanification());

    $this->updateActivePlayersInitialSelection();
  }

  public function updateActivePlayersInitialSelection()
  {
    // Compute players that still need to select their card
    // => use that instead of BGA framework feature because in some rare case a player
    //    might become inactive eventhough the selection failed (seen in Agricola and Rauha at least already)
    $planification = Globals::getPlanification();
    $skipped = Globals::getSkippedPlayers();
    $ids = [];
    foreach (Constructors::getAll() as $constructor) {
      if ($constructor->isAI() || $constructor->isFinished() || in_array($constructor->getPId(), $skipped)) {
        continue;
      }
      $ids[] = $constructor->getPId();
    }
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
    $this->initCustomTurnOrder('reveal', null, 'stReveal', 'stEndRound');
  }

  public function actGiveUp()
  {
    self::checkAction('actPlan');
    $player = Players::getCurrent();
    $constructor = Constructors::getOfPlayer($player->getId());
    $args = $this->argsPlanification()['_private'][$player->getId()];
    if (!$args['canSkipEndRace']) {
      throw new UserException('You cant skip the end of the race. Should not happen');
    }

    $constructor->giveUp();
    $cIds = Globals::getGiveUpPlayers();
    $cIds[] = $constructor->getId();
    Globals::setGiveUpPlayers($cIds);
    $this->updateActivePlayersInitialSelection();
  }

  ////////////////////////////////////////////
  //  _____    ____                      _
  // |___ /   |  _ \ _____   _____  __ _| |
  //   |_ \   | |_) / _ \ \ / / _ \/ _` | |
  //  ___) |  |  _ <  __/\ V /  __/ (_| | |
  // |____(_) |_| \_\___| \_/ \___|\__,_|_|
  ////////////////////////////////////////////

  public function stReveal()
  {
    $constructor = Constructors::getActive();
    if ($constructor->isAI()) {
      $this->stLegendTurn();
      return;
    }
    // Might happens if player give up
    if ($constructor->isFinished()) {
      $this->nextPlayerCustomOrder('reveal');
      return;
    }

    $planification = Globals::getPlanification();
    $pId = $constructor->getPId();
    $cardIds = $planification[$pId] ?? null;
    if (is_null($cardIds)) {
      throw new UserException("No planification data for player $pId. Should not happen, please report a bug");
    }
    $constructor->incStat('rounds');
    unset($planification[$pId]);
    Globals::setPlanification($planification);


    // Setup gear and reveal cards
    $newGear = count($cardIds);
    $heats = new Collection([]);
    if (abs($newGear - $constructor->getGear()) > 2) {
      throw new \BgaVisibleSystemException('You cant change gear more than 2. Should not happen');
    }
    // Check heat
    $flooded = $constructor->isInFloodedSpace();
    $heatCost = abs($newGear - $constructor->getGear()) > 1 ? 1 : 0;
    $payForFlooded = false;
    if ($flooded && $newGear < $constructor->getGear()) {
      $heatCost++;
      $payForFlooded = true;
    }
    if ($heatCost > 0) {
      $heats = $constructor->getEngine()->limit($heatCost);
      if ($heats->count() < $heatCost) {
        throw new \BgaVisibleSystemException('You dont have enough heat to pay for the change of gear. Should not happen');
      }
      Cards::move($heats->getIds(), ['discard', $constructor->getId()]);
      if ($newGear > $constructor->getGear()) {
        $constructor->incStat('heatPayedGearUp');
      } else {
        if (($heatCost - ($payForFlooded ? 1 : 0)) > 0) {
          $constructor->incStat('heatPayedGearDown');
        }
      }
    }

    $constructor->setGear($newGear);
    $constructor->incStat('roundsSpeed' . $newGear);
    if ($constructor->getNo() == 0) {
      $constructor->incStat('roundsFirst');
    }

    Cards::move($cardIds, ['inplay', $constructor->getId()]);
    $cards = Cards::getMany($cardIds);
    Notifications::reveal($constructor, $newGear, $cards, $heats, $payForFlooded);

    // Are we cluttered ??
    $clutteredHand = false;
    foreach ($cards as $card) {
      if ($card['effect'] == HEAT) {
        $clutteredHand = true;
        break;
      }
    }
    if ($clutteredHand) {
      $constructor->setGear(1);
      Notifications::clutteredHand($constructor);
      $this->stReplenish();
      return;
    }

    // Store previous position and store symbols
    Globals::setRefreshedCards([]);
    Globals::setPreviousPosition($constructor->getPosition());
    Globals::setPreviousTurn($constructor->getTurn());
    Globals::setUsedBoost(false);
    $symbols = [];
    foreach ($cards as $card) {
      foreach ($card['symbols'] as $symbol => $n) {
        if (in_array($symbol, [REFRESH, DIRECT, ACCELERATE])) {
          $symbols[$symbol][] = $card['id'];
        } else {
          $symbols[$symbol] = ($symbols[$symbol] ?? 0) + $n;
        }
      }
      if ($card['type'] == 110) {
        $constructor->incStat('stressPlayed');
      }
    }

    // Resolve + symbols
    $n = $symbols[BOOST] ?? 0;
    for ($i = 0; $i < $n; $i++) {
      list($cards, $card) = $constructor->resolveBoost();
      Notifications::resolveBoost($constructor, $cards, $card, $i + 1, $n);
    }
    Globals::setFlippedCards($n);
    unset($symbols[BOOST]);
    unset($symbols[ADJUST]);

    // Direct play
    unset($symbols[DIRECT]);
    foreach ($constructor->getHand() as $cardId => $card) {
      if (isset($card['symbols'][DIRECT])) {
        $symbols[DIRECT][] = $cardId;
      }
    }

    Globals::setSymbols($symbols);

    $this->gamestate->jumpToState(ST_CHOOSE_SPEED);
  }

  ///////////////////////////////////////
  //  _____    __  __
  // |___ /   |  \/  | _____   _____
  //   |_ \   | |\/| |/ _ \ \ / / _ \
  //  ___) |  | |  | | (_) \ V /  __/
  // |____(_) |_|  |_|\___/ \_/ \___|
  ///////////////////////////////////////

  public function argsChooseSpeed()
  {
    $constructor = Constructors::getActive();

    // Compute speed
    $speeds = [0];
    foreach ($constructor->getPlayedCards() as $card) {
      $t = [];

      $cSpeeds = $card['speed'];
      if (!is_array($cSpeeds)) {
        $cSpeeds = [$cSpeeds];
      }

      foreach ($cSpeeds as $cSpeed) {
        foreach ($speeds as $speed) {
          $t[] = $cSpeed + $speed;
        }
      }

      $speeds = $t;
    }
    $possibleSpeeds = $speeds;

    // Compute ending cells and heat to pay
    $speeds = [];
    $heatCosts = [];
    foreach ($possibleSpeeds as $speed) {
      $moveResult = $this->getCircuit()->getReachedCell($constructor, $speed, FLAG_COMPUTE_HEAT_COSTS);
      $speeds[$speed] = $moveResult['cell'];
      $heatCosts[$speed] = $moveResult['heatCost'];
    }

    return [
      'speeds' => $speeds,
      'heatCosts' => $heatCosts,
      'descSuffix' => count($speeds) == 1 ? 'SingleChoice' : '',
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
    $this->moveCar($constructor, $speed);

    $this->stAdrenaline();
  }

  public function moveCar($constructor, $n, $slipstream = false, $legendSlot = null): int
  {
    $circuit = $this->getCircuit();
    $moveResult = $circuit->getReachedCell($constructor, $n, FLAG_COMPUTE_PATHS);
    $constructor->setCarCell($moveResult['cell']);
    $constructor->incTurn($moveResult['extraTurn']);
    $distanceToCorner = $constructor->getDistanceToCorner();
    Notifications::moveCar(
      $constructor,
      $moveResult['cell'],
      $n,
      $moveResult['distance'],
      $moveResult['extraTurn'],
      $distanceToCorner,
      $moveResult['path'],
      $slipstream,
      $legendSlot
    );

    $paths = $constructor->getPaths() ?? [];
    $paths[] = $moveResult['path'];
    $constructor->setPaths($paths);
    return $moveResult['distance'];
  }

  public function getCurrentHeatCosts($constructor)
  {
    $prevPosition = Globals::getPreviousPosition();
    $prevTurn = Globals::getPreviousTurn();
    $position = $constructor->getPosition();
    $turn = $constructor->getTurn();
    $speed = $constructor->getSpeed();
    return $this->getCircuit()->getCrossedCornersHeatCosts(
      $constructor,
      $speed,
      $prevTurn,
      $prevPosition,
      $turn,
      $position
    );
  }

  public function getNextCornerInfos($constructor)
  {
    $position = $constructor->getPosition();
    $cornerPos = $this->getCircuit()->getNextCorner($position);
    $extraHeat = $this->getCircuit()->getCornerWeather($cornerPos) == \ROAD_CONDITION_MORE_HEAT;

    // Max speed modificator
    $speedLimitModifier = 0;
    foreach ($constructor->getPlayedCards() as $card) {
      $speedLimitModifier += $card['symbols'][ADJUST] ?? 0;
    }
    $rawLimit = $this->getCircuit()->getCornerMaxSpeed($cornerPos);
    $limit = $rawLimit + $speedLimitModifier;

    return ['speedLimit' => $limit, 'extraHeat' => $extraHeat];
  }

  //////////////////////////////////////////////////////////////////
  //  _  _         _       _                      _ _
  // | || |       / \   __| |_ __ ___ _ __   __ _| (_)_ __   ___
  // | || |_     / _ \ / _` | '__/ _ \ '_ \ / _` | | | '_ \ / _ \
  // |__   _|   / ___ \ (_| | | |  __/ | | | (_| | | | | | |  __/
  //    |_|(_) /_/   \_\__,_|_|  \___|_| |_|\__,_|_|_|_| |_|\___|
  //////////////////////////////////////////////////////////////////

  public function stAdrenaline()
  {
    $constructor = Constructors::getActive();
    $symbols = Globals::getSymbols();
    $roadCondition = $constructor->getRoadCondition();
    $event = Globals::getCurrentEvent();

    // Adrenaline
    $no = $constructor->getNo();
    $notFinished = array_unique(array_merge(Constructors::getTurnOrder(), Globals::getGiveUpPlayers()));
    $maxNo = count($notFinished);
    if ($event != EVENT_SUDDEN_RAIN && ($no == $maxNo - 1 || ($no == $maxNo - 2 && $maxNo >= 5))) {
      $symbols[COOLDOWN] = ($symbols[COOLDOWN] ?? 0) + 1;
      $symbols[ADRENALINE] = 1;
      Notifications::gainAdrenaline($constructor, $no == $maxNo - 1);
      $constructor->incStat('roundsAdrenaline');
    }

    // Additional cooldown from gear
    $gear = $constructor->getGear();
    if ($gear <= 2) {
      $n = $gear == 1 ? 3 : 1;
      $symbols[COOLDOWN] = ($symbols[COOLDOWN] ?? 0) + $n;
      Notifications::gainGearCooldown($constructor, $gear, $n);
    }

    // Weather might add 1 cooldown
    if ($roadCondition == ROAD_CONDITION_COOLING_BONUS) {
      $symbols[COOLDOWN] = ($symbols[COOLDOWN] ?? 0) + 1;
    }

    // Save all the symbols and proceed to React phase
    Globals::setSymbols($symbols);
    $this->gamestate->jumpToState(ST_REACT);
  }

  ///////////////////////////////////////////
  //    ____     ____                 _
  //   | ___|   |  _ \ ___  __ _  ___| |_
  //   |___ \   | |_) / _ \/ _` |/ __| __|
  //    ___) |  |  _ <  __/ (_| | (__| |_
  //   |____(_) |_| \_\___|\__,_|\___|\__|
  ///////////////////////////////////////////
  // Other file

  //////////////////////////////////////////////////////////////////
  //    __      ____  _ _           _
  //   / /_    / ___|| (_)_ __  ___| |_ _ __ ___  __ _ _ __ ___
  //  | '_ \   \___ \| | | '_ \/ __| __| '__/ _ \/ _` | '_ ` _ \
  //  | (_) |   ___) | | | |_) \__ \ |_| | |  __/ (_| | | | | | |
  //   \___(_) |____/|_|_| .__/|___/\__|_|  \___|\__,_|_| |_| |_|
  //                     |_|
  //////////////////////////////////////////////////////////////////

  public function argsSlipstream()
  {
    $event = Globals::getCurrentEvent();
    $constructor = Constructors::getActive();
    $slipstreams = [2];
    $cards = $constructor->getPlayedCards();

    // Weather might change slipstream
    $roadCondition = $constructor->getRoadCondition();
    if ($roadCondition == \ROAD_CONDITION_NO_SLIPSTREAM) {
      return ['cells' => []];
    }
    // EVENT : turbulent winds, must be in gear 3 or 4
    else if ($event == EVENT_TURBULENT_WINDS && $constructor->getGear() < 3) {
      return ['cells' => []];
    }
    // Normal case
    else {
      $map = [
        ROAD_CONDITION_INCREASE_SLIPSTREAM => 1,
        ROAD_CONDITION_SLIPSTREAM_BOOST => 2,
      ];
      $slipstreamBonus = $map[$roadCondition] ?? 0;
      $cards[] = [
        'symbols' => [SLIPSTREAM => $slipstreamBonus],
      ];
    }

    foreach ($cards as $card) {
      $n = $card['symbols'][SLIPSTREAM] ?? 0;
      if ($n == 0) {
        continue;
      }

      $t = [];
      foreach ($slipstreams as $speed) {
        $t[] = $speed;
        $t[] = $speed + $n;
      }

      $slipstreams = $t;
    }

    // Current heat costs
    list('heatCost' => $currentHeatCost, 'heatCosts' => $currentHeatCosts, 'spinOut' => $spinOut) = $this->getCurrentHeatCosts($constructor);
    // Next corner infos
    list('speedLimit' => $speedLimit, 'extraHeat' => $nextCornerExtraHeatCost) = $this->getNextCornerInfos($constructor);

    // Reached cells and heat costs
    $speeds = [];
    $heatCosts = [];
    $slipstreamWillCrossNextCorner = [];
    foreach ($slipstreams as $n) {
      $res = $this->getCircuit()->getSlipstreamResult($constructor, $n);
      if ($res !== false) {
        $speeds[$n] = $res['cell'];
        $heatCosts[$n] = $res['heatCost'];
        $slipstreamWillCrossNextCorner[$n] = count($res['heatCosts']) > count($currentHeatCosts);
      }
    }

    return [
      'speeds' => $speeds,
      'heatCosts' => $heatCosts,
      'slipstreamWillCrossNextCorner' => $slipstreamWillCrossNextCorner,

      'currentHeatCost' => $currentHeatCost,
      'currentHeatCosts' => $currentHeatCosts,
      'spinOut' => $spinOut,
      'nextCornerSpeedLimit' => $speedLimit,
      'nextCornerExtraHeatCost' => $nextCornerExtraHeatCost,
    ];
  }

  public function stSlipstream()
  {
    if (empty($this->argsSlipstream()['speeds'])) {
      $this->actSlipstream(0);
    }
  }

  public function actSlipstream($n)
  {
    self::checkAction('actSlipstream');

    $constructor = Constructors::getActive();
    Globals::setPositionBeforeSlipstream($constructor->getPosition());
    Globals::setTurnBeforeSlipstream($constructor->getTurn());

    if ($n > 0) {
      if (!array_key_exists($n, $this->argsSlipstream()['speeds'])) {
        throw new \BgaVisibleSystemException('Invalid slipstream. Should not happen');
      }

      // Compute the new cell
      $nForward = $this->moveCar($constructor, $n, true);
      $constructor->incStat('slipstreamGains', $nForward);
    }

    $this->stCheckCorner();
  }

  ////////////////////////////////////////////////////////////////////////////
  //    _____    ____ _               _
  //   |___  |  / ___| |__   ___  ___| | __   ___ ___  _ __ _ __   ___ _ __
  //      / /  | |   | '_ \ / _ \/ __| |/ /  / __/ _ \| '__| '_ \ / _ \ '__|
  //     / /_  | |___| | | |  __/ (__|   <  | (_| (_) | |  | | | |  __/ |
  //    /_/(_)  \____|_| |_|\___|\___|_|\_\  \___\___/|_|  |_| |_|\___|_|
  ////////////////////////////////////////////////////////////////////////////

  public function stCheckCorner()
  {
    // Compute corners between the two positions
    $constructor = Constructors::getActive();
    $prevPosition = Globals::getPreviousPosition();
    $prevTurn = Globals::getPreviousTurn();
    $position = $constructor->getPosition();
    $turn = $constructor->getTurn();
    // $corners = >getCornersInBetween($prevTurn, $prevPosition, $turn, $position);

    // Sponsor cards gained
    $sponsorsGained = [];
    $slipstreamedCorners = [];

    // Check if player slipstreamed through a press corner
    $slipstreamedCorners = $this->getCircuit()->getCornersInBetween(
      Globals::getTurnBeforeSlipstream(),
      Globals::getPositionBeforeSlipstream(),
      $turn,
      $position
    );
    foreach ($slipstreamedCorners as $infos) {
      $cornerPos = $infos['cornerPos'];
      if ($this->getCircuit()->isPressCorner($cornerPos)) {
        $sponsorsGained[] = 'slipstream';
        $slipstreamedCorners[] = $cornerPos;
      }
    }

    // For each corner, check speed against max speed of corner
    $spinOut = false;
    $speed = $constructor->getSpeed();
    list('heatCosts' => $corners, 'speedLimits' => $limits) = $this->getCircuit()->getCrossedCornersHeatCosts($constructor, $speed, $prevTurn, $prevPosition, $turn, $position);

    if (!empty($corners)) {
      foreach ($corners as $cornerPos => $nHeatsToPay) {
        if ($nHeatsToPay > 0) {
          $constructor->incStat('overspeedCorners');
          $roadCondition = $this->getCircuit()->getCornerWeather($cornerPos);
          $limit = $limits[$cornerPos];
          $available = $constructor->getEngine()->count();

          if ($nHeatsToPay > $available) {
            $cards = $constructor->payHeats($available);
            $cell = $this->getCircuit()->getFirstFreeCell($cornerPos - 1, $constructor->getId());
            $stresses = Cards::addStress($constructor, $constructor->getGear() <= 2 ? 1 : 2);
            $constructor->setCarCell($cell);
            $constructor->setGear(1);

            // How many cells back ?
            $newPosition = $constructor->getPosition();
            $length = $this->getCircuit()->getLength();
            $nBack = ($position - $newPosition + $length) % $length;
            if ($newPosition > $position) {
              $constructor->incTurn(-1);
              $turn--;
            }

            $constructor->incStat('spinOuts');
            $constructor->incStat('stressSpinOuts', count($stresses));

            // prettier-ignore
            Notifications::spinOut($constructor, $speed, $limit, $cornerPos, $cards, $cell, $stresses, $nBack, $turn, $roadCondition);
            $spinOut = true;
            break;
          } else {
            $cards = $constructor->payHeats($nHeatsToPay);
            Notifications::payHeatsForCorner($constructor, $cards, $speed, $limit, $cornerPos, $roadCondition);
          }
        }

        $rawLimit = $this->getCircuit()->getCornerMaxSpeed($cornerPos);
        if ($speed >= 2 + $rawLimit && $this->getCircuit()->isPressCorner($cornerPos)) {
          // At most 1 sponsor card by corner
          if (!in_array($cornerPos, $slipstreamedCorners)) {
            $sponsorsGained[] = 'exceed';
          }
        }
      }
    }

    ////// EVENTS /////
    $event = Globals::getCurrentEvent();
    // New record : must reach speed of 15
    if ($event == EVENT_NEW_RECORD && $speed >= 15) {
      $sponsorsGained[] = EVENT_NEW_RECORD;
    }
    // Inauguration: first 3 cards to finish 1st lap
    elseif ($event == EVENT_INAUGURATION && $prevTurn == 0 && $turn == 1) {
      $alreadyCrossed = 0;
      foreach (Constructors::getAll() as $constructor2) {
        if ($constructor->getId() == $constructor2->getId()) {
          continue;
        }
        if ($constructor2->getTurn() >= 1) {
          $alreadyCrossed++;
        }
      }

      if ($alreadyCrossed < 3) {
        $sponsorsGained[] = EVENT_INAUGURATION;
      }
    }
    // First live tv : must pass 3 cars
    elseif ($event == EVENT_FIRST_LIVE_TV) {
      $nCars = $this->getCircuit()->getCarsInBetween($prevTurn, $prevPosition, $turn, $position);
      if ($nCars >= 3) {
        $sponsorsGained[] = EVENT_FIRST_LIVE_TV;
      }
    }
    // TITLE SPONSOR => SPIN OUT = out of race
    elseif ($event == \EVENT_FUTURE_UNKNOWN && $spinOut) {
      $constructor->eliminate();
    }

    // Draw sponsors into hand
    if (!empty($sponsorsGained)) {
      if ($spinOut) {
        Notifications::message(
          clienttranslate('${constructor_name} cannot draw sponsor card(s) because they spinned out during their turn'),
          ['constructor' => $constructor]
        );
      } else {
        foreach ($sponsorsGained as $reason) {
          $cId = $constructor->getId();
          $card = Cards::pickOneForLocation('sponsors', "hand-$cId");
          Notifications::drawSponsor($constructor, $card, $reason);

          if ($event == EVENT_GOING_GLOBAL) {
            $card = Cards::pickOneForLocation('sponsors', "hand-$cId");
            Notifications::drawSponsor($constructor, $card, EVENT_GOING_GLOBAL);
          }
        }
      }
    }

    $this->gamestate->jumpToState(ST_DISCARD);
  }

  /////////////////////////////////////////////////////
  //    ___     ____  _                       _
  //   ( _ )   |  _ \(_)___  ___ __ _ _ __ __| |
  //   / _ \   | | | | / __|/ __/ _` | '__/ _` |
  //  | (_) |  | |_| | \__ \ (_| (_| | | | (_| |
  //   \___(_) |____/|_|___/\___\__,_|_|  \__,_|
  /////////////////////////////////////////////////////

  public function argsDiscard()
  {
    $constructor = Constructors::getActive();
    $event = Globals::getCurrentEvent();
    $prohibited = $event == EVENT_CHICANES ? [STRESS] : [HEAT, STRESS];
    $cards = $constructor->getHand()->filter(fn($card) => !in_array($card['effect'], $prohibited));

    // Tunnel Vision exp => no discard in tunnel
    if ($constructor->isInTunnelSpace()) {
      $cards = [];
    }

    // Any card to refresh ?
    $symbols = Globals::getSymbols();
    $refreshedIds = $symbols[REFRESH] ?? [];

    return [
      '_private' => [
        'active' => [
          'cardIds' => $cards->getIds(),
          'refreshedIds' => $refreshedIds,
        ],
      ],
    ];
  }

  public function stDiscard()
  {
    // Auto skip if nothing to refresh and cant discard anything
    $args = $this->argsDiscard()['_private']['active'];
    $cardIds = $args['cardIds'];
    if (empty($cardIds) && empty($args['refreshedIds'])) {
      $this->actDiscard([]);
      return;
    }

    // Autoskip if race is over (no point in discarding more card)
    $constructor = Constructors::getActive();
    if ($constructor->getTurn() >= $this->getNbrLaps()) {
      $constructor->setPaths([]);
      $this->actDiscard([]);
      return;
    }
  }

  public function actRefresh($cardId)
  {
    self::checkAction('actRefresh');
    $constructor = Constructors::getActive();
    $args = $this->argsDiscard()['_private']['active'];

    // Refresh card
    if (!in_array($cardId, $args['refreshedIds'])) {
      throw new \BgaVisibleSystemException('Invalid card to refresh. Should not happen');
    }

    $symbols = Globals::getSymbols();
    $symbols[REFRESH] = array_values(array_diff($symbols[REFRESH], [$cardId]));
    Globals::setSymbols($symbols);

    $card = Cards::getSingle($cardId);
    Cards::insertOnTop($cardId, ['deck', $constructor->getId()]);
    Notifications::refresh($constructor, $card);

    $this->gamestate->jumpToState(ST_DISCARD);
  }

  public function actDiscard($cardIds)
  {
    self::checkAction('actDiscard');
    $constructor = Constructors::getActive();
    $args = $this->argsDiscard()['_private']['active'];

    // Discard cards
    if (count($cardIds) > 0) {
      $ids = $args['cardIds'];
      if (!empty(array_diff($cardIds, $ids))) {
        throw new \BgaVisibleSystemException('Invalid cards to discard. Should not happen');
      }

      Cards::move($cardIds, ['discard', $constructor->getId()]);
      Notifications::discard($constructor, Cards::getMany($cardIds));
    }
    $constructor->incStat('extraDiscard', count($cardIds));

    $this->stReplenish();
  }

  //////////////////////////////////////////////////////////
  //   ___     ____            _            _     _
  //  / _ \   |  _ \ ___ _ __ | | ___ _ __ (_)___| |__
  // | (_) |  | |_) / _ \ '_ \| |/ _ \ '_ \| / __| '_ \
  //  \__, |  |  _ <  __/ |_) | |  __/ | | | \__ \ | | |
  //    /_(_) |_| \_\___| .__/|_|\___|_| |_|_|___/_| |_|
  //                    |_|
  //////////////////////////////////////////////////////////

  public function stReplenish()
  {
    // Discard played cards (or put them away if sponsors)
    $constructor = Constructors::getActive();
    $cardIds = [];
    $sponsorIds = [];
    foreach ($constructor->getPlayedCards() as $cId => $card) {
      if ($card['isSponsor'] ?? false) {
        $sponsorIds[] = $cId;
      } else {
        $cardIds[] = $cId;
      }
    }
    Cards::move($cardIds, ['discard', $constructor->getId()]);
    Cards::move($sponsorIds, ['discard-sponsors']);
    Notifications::clearPlayedCards($constructor, $cardIds, $sponsorIds);

    $constructor->setPaths([]);

    if ($constructor->getTurn() < $this->getNbrLaps()) {
      // Replenish
      Cards::fillHand($constructor);
    }

    $this->nextPlayerCustomOrder('reveal');
  }
}
