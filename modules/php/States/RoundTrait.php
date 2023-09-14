<?php
namespace HEAT\States;
use HEAT\Core\Globals;
use HEAT\Core\Notifications;
use HEAT\Core\Stats;
use HEAT\Helpers\Log;
use HEAT\Helpers\UserException;
use HEAT\Managers\Constructors;
use HEAT\Managers\Players;
use HEAT\Managers\Cards;

trait RoundTrait
{
  function stStartRound()
  {
    Globals::setPlanification([]);
    $pIds = Constructors::getAll()
      ->filter(function ($constructor) {
        return !$constructor->isAI() && !$constructor->isFinished();
      })
      ->map(function ($constructor) {
        return $constructor->getPId();
      })
      ->toArray();

    Globals::setLegendCardDrawn(false);
    if (empty($pIds)) {
      $this->gamestate->nextState('planification');
      $this->stEndOfPlanification();
    } else {
      $this->gamestate->setPlayersMultiactive($pIds, '', true);
      $this->gamestate->nextState('planification');
    }
  }

  function stEndRound()
  {
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
        $finished[] = $cId;
        $podium = count($finished);
        $constructor->setCarCell(-$podium);
        Notifications::finishRace($constructor, $podium);
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

      // Compute corresponding speeds
      $speeds = $hand->map(function ($card) {
        if ($card['effect'] == STRESS) {
          return [1, 2, 3, 4];
        }
        return $card['speed'];
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

      $args['_private'][$pId] = [
        'cards' => $hand->getIds(),
        'speeds' => $speeds,
        'cells' => $cells,
        'selection' => $planification[$pId] ?? null,
      ];
    }

    return $args;
  }

  public function actPlan($cardIds)
  {
    self::checkAction('actPlan');
    $player = Players::getCurrent();
    $constructor = Constructors::getOfPlayer($player->getId());
    $newGear = count($cardIds);
    if (abs($newGear - $constructor->getGear()) > 1) {
      if ($constructor->hasNoHeat()) {
        throw new UserException(clienttranslate('You dont have enough heat to pay for the change of gear of 2.'));
      }
    }

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
    $ids = [];
    foreach (Constructors::getAll() as $constructor) {
      if ($constructor->isAI() || $constructor->isFinished()) {
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
    $planification = Globals::getPlanification();
    $cardIds = $planification[$constructor->getPId()];

    // Setup gear and reveal cards
    $newGear = count($cardIds);
    $heat = null;
    if (abs($newGear - $constructor->getGear()) > 2) {
      throw new \BgaVisibleSystemException('You cant change gear more than 2. Should not happen');
    }
    // Check heat
    if (abs($newGear - $constructor->getGear()) > 1) {
      $heat = $constructor->getEngine()->first();
      if (is_null($heat)) {
        throw new \BgaVisibleSystemException('You dont have enough heat to pay for the change of gear of 2. Should not happen');
      }
      Cards::move($heat['id'], ['discard', $constructor->getId()]);
    }

    $constructor->setGear($newGear);
    Cards::move($cardIds, ['inplay', $constructor->getId()]);
    $cards = Cards::getMany($cardIds);
    Notifications::reveal($constructor, $newGear, $cards, $heat);

    // Store previous position and store symbols
    Globals::setRefreshedCards([]);
    Globals::setPreviousPosition($constructor->getPosition());
    Globals::setPreviousTurn($constructor->getTurn());
    $symbols = [];
    foreach ($cards as $card) {
      foreach ($card['symbols'] as $symbol => $n) {
        if (in_array($symbol, [REFRESH, DIRECT, ACCELERATE])) {
          $symbols[$symbol][] = $card['id'];
        } else {
          $symbols[$symbol] = ($symbols[$symbol] ?? 0) + $n;
        }
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

    // Compute ending cells
    $speeds = [];
    foreach ($possibleSpeeds as $speed) {
      list($newCell, , ,) = $this->getCircuit()->getReachedCell($constructor, $speed);
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
    $this->moveCar($constructor, $speed);

    $this->stAdrenaline();
  }

  public function moveCar($constructor, $n, $slipstream = false)
  {
    list($newCell, $nSpacesForward, $extraTurns, $path) = $this->getCircuit()->getReachedCell($constructor, $n);
    $constructor->setCarCell($newCell);
    $constructor->incTurn($extraTurns);
    Notifications::moveCar($constructor, $newCell, $n, $nSpacesForward, $extraTurns, $path, $slipstream);
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

    // Adrenaline
    $no = $constructor->getNo();
    $nbr = Constructors::count();
    $maxNo = count(Constructors::getTurnOrder());
    if ($no == $maxNo - 1 || ($no == $maxNo - 2 && $nbr >= 5)) {
      $symbols[COOLDOWN] = ($symbols[COOLDOWN] ?? 0) + 1;
      $symbols[ADRENALINE] = 1;
      Notifications::gainAdrenaline($constructor, $no == $nbr - 1);
    }

    // Additional cooldown from gear
    $gear = $constructor->getGear();
    if ($gear <= 2) {
      $n = $gear == 1 ? 3 : 1;
      $symbols[COOLDOWN] = ($symbols[COOLDOWN] ?? 0) + $n;
      Notifications::gainGearCooldown($constructor, $gear, $n);
    }

    // Add the boost symbol
    if ($roadCondition == ROAD_CONDITION_FREE_BOOST) {
      $symbols[BOOST] = 1;
    } else {
      $symbols[HEATED_BOOST] = 1;
    }

    // Weather might add 1 cooldown
    if ($roadCondition == ROAD_CONDITION_COOLING_BONUS) {
      $symbols[COOLDOWN] = ($symbols[COOLDOWN] ?? 0) + 1;
    }
    // Weather might disable cooldown
    if ($roadCondition == ROAD_CONDITION_NO_COOLDOWN) {
      unset($symbols[COOLDOWN]);
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

  public function argsReact()
  {
    $constructor = Constructors::getActive();
    $symbols = Globals::getSymbols();
    // Remove symbols that do not apply at this step
    $notReactSymbols = [SLIPSTREAM];
    foreach ($notReactSymbols as $symbol) {
      unset($symbols[$symbol]);
    }

    // Compute which ones are actually usable
    $doableSymbols = [];
    foreach ($symbols as $symbol => $n) {
      if ($constructor->canUseSymbol($symbol)) {
        $doableSymbols[] = $symbol;
      }
    }

    $canPass = $this->canPassReact($symbols);

    return [
      'symbols' => $symbols,
      'doable' => $doableSymbols,
      'canPass' => $canPass,
      'descSuffix' => $canPass ? '' : 'Must',
      'flippedCards' => Globals::getFlippedCards(),
    ];
  }

  public function canPassReact($symbols)
  {
    // Mandatory symbols
    $mandatorySymbols = [HEAT, SCRAP];
    $canPass = empty(array_intersect($mandatorySymbols, array_keys($symbols)));
    return $canPass;
  }

  public function actReact($symbol, $arg)
  {
    self::checkAction('actReact');
    $constructor = Constructors::getActive();
    $symbols = Globals::getSymbols();
    $n = $symbols[$symbol] ?? null;
    if (is_null($n)) {
      throw new \BgaVisibleSystemException('Invalid symbol. Should not happen');
    }

    // Update remaining symbols
    if (in_array($symbol, [REFRESH, DIRECT, ACCELERATE])) {
      $symbols[$symbol] = array_diff($symbols[$symbol], [$arg]);
    } else {
      unset($symbols[$symbol]);
    }
    Globals::setSymbols($symbols);
    /////// Resolve effect ///////
    // COOLDOWN
    if ($symbol == COOLDOWN) {
      $heats = $constructor->getHeatsInHand()->limit($n);
      Cards::move($heats->getIds(), ['engine', $constructor->getId()]);
      Notifications::cooldown($constructor, $heats);
    }
    // ADRENALINE
    elseif ($symbol == ADRENALINE) {
      // Increase speed
      $constructor->incSpeed(1);
      Notifications::adrenaline($constructor);
      // Move car 1 cell (if possible)
      $this->moveCar($constructor, 1);
    }
    // HEATED BOOST
    elseif ($symbol == HEATED_BOOST || $symbol == BOOST) {
      if ($symbol == HEATED_BOOST) {
        if ($constructor->hasNoHeat()) {
          throw new UserException(clienttranslate('You dont have enough heat to pay for the boost.'));
        }
        $heats = $constructor->payHeats(1);
      } else {
        $heats = null;
      }
      list($cards, $card) = $constructor->resolveBoost();
      Globals::incFlippedCards();
      Notifications::heatedBoost($constructor, $heats, $cards, $card);
      // Increase speed and move the card
      $speed = $card['speed'];
      $constructor->incSpeed($speed);
      $this->moveCar($constructor, $speed);
    }
    // REDUCE STRESS
    elseif ($symbol == REDUCE) {
      $cards = $constructor->getStressesInHand()->limit($arg);
      Cards::move($cards->getIds(), ['discard', $constructor->getId()]);
      Notifications::reduceStress($constructor, $cards);
    }
    // PAY FOR HEAT
    elseif ($symbol == HEAT) {
      $heats = $constructor->payHeats($n);
      Notifications::payHeats($constructor, $heats);
    }
    // SCRAP
    elseif ($symbol == SCRAP) {
      $cards = $constructor->scrapCards($n);
      Notifications::scrapCards($constructor, $cards);
    }
    // REFRESH
    elseif ($symbol == REFRESH) {
      if (!$this->canPassReact($symbols)) {
        throw new \BgaVisibleSystemException('You cant use refresh with pending mandatory reactions. Should not happen');
      }
      $cardId = $arg;
      $card = Cards::getSingle($cardId);
      Cards::insertOnTop($cardId, ['deck', $constructor->getId()]);
      Notifications::refresh($constructor, $card);

      // Remove any other symbols
      $symbols = [
        REFRESH => $symbols[REFRESH],
      ];
      Globals::setSymbols($symbols);

      // Keep in memory this card. Useful for slipstream
      $refreshedCards = Globals::getRefreshedCards();
      $refreshedCards[] = $card;
      Globals::setRefreshedCards($refreshedCards);
    }
    // ACCELERATE
    elseif ($symbol == ACCELERATE) {
      $cardId = $arg;
      $card = Cards::getSingle($cardId);
      $n = Globals::getFlippedCards();
      $constructor->incSpeed($n);
      Notifications::accelerate($constructor, $card, $n);
      // Move car
      $this->moveCar($constructor, $n);
    }
    // SALVAGE
    elseif ($symbol == SALVAGE) {
      Globals::setSalvage($n);
      $this->gamestate->jumpToState(ST_SALVAGE);
      return;
    }
    // DIRECT
    elseif ($symbol == DIRECT) {
      $cardId = $arg;
      $card = Cards::getSingle($cardId);
      Cards::move($cardId, ['inplay', $constructor->getId()]);
      $speed = $card['speed'];
      $constructor->incSpeed($speed);
      Notifications::directPlay($constructor, $card, $speed);

      if ($speed > 0) {
        $this->moveCar($constructor, $speed);
      }

      $symbols = Globals::getSymbols();
      foreach ($card['symbols'] as $symbol => $n) {
        if (in_array($symbol, [REFRESH, DIRECT, ACCELERATE])) {
          if ($symbol !== DIRECT) {
            // no DIRECT here, to not add played DIRECT back on the list
            $symbols[$symbol][] = $card['id'];
          }
        } else {
          $symbols[$symbol] = ($symbols[$symbol] ?? 0) + $n;
        }
      }
      Globals::setSymbols($symbols);
    }

    // Loop on same state to resolve other pending symbols
    $this->gamestate->jumpToState(ST_REACT);
  }

  public function stReact()
  {
    $symbols = Globals::getSymbols();
    foreach ($symbols as $symbol => $n) {
      if (in_array($symbol, [REFRESH, DIRECT, ACCELERATE])) {
        if (!empty($n)) {
          return;
        }
      } else {
        if ($n > 0) {
          return;
        }
      }
    }

    $this->stReactDone();
  }

  public function actPassReact()
  {
    self::checkAction('actPassReact');
    if (!$this->argsReact()['canPass']) {
      throw new \BgaVisibleSystemException('Cant pass react with mandatory symbols left. Should not happen');
    }

    $this->stReactDone();
  }

  public function stReactDone()
  {
    $this->gamestate->jumpToState(ST_SLIPSTREAM);
  }

  ///////////////////////////////
  /// SALVAGE
  ///////////////////////////////
  public function argsSalvage()
  {
    // TODO : remove max
    $n = max(2, Globals::getSalvage());
    $constructor = Constructors::getActive();
    return [
      'n' => $n,
      'cardIds' => $constructor->getDiscard()->getIds(),
      '_private' => [
        $constructor->getPId() => [
          'cards' => $constructor->getDiscard(),
        ],
      ],
    ];
  }

  public function actSalvage($cardIds)
  {
    self::checkAction('actSalvage');
    $args = $this->argsSalvage();
    if (count($cardIds) > $args['n']) {
      throw new \BgaVisibleSystemException('Too much cards. Should not happen');
    }
    foreach ($cardIds as $cardId) {
      if (!in_array($cardId, $args['cardIds'])) {
        throw new \BgaVisibleSystemException('Cant salvage this card. Should not happen');
      }
    }

    $constructor = Constructors::getActive();
    $cId = $constructor->getId();
    if (!empty($cardIds)) {
      Cards::move($cardIds, "deck-$cId");
      Cards::shuffle("deck-$cId");
      $cards = Cards::getMany($cardIds);
      Notifications::salvageCards($constructor, $cards);
    }
    $this->gamestate->jumpToState(ST_REACT);
  }

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
    $constructor = Constructors::getActive();
    $slipstreams = [2];
    $cards = $constructor->getPlayedCards();

    // Weather might change slipstream
    $roadCondition = $constructor->getRoadCondition();
    if ($roadCondition == \ROAD_CONDITION_NO_SLIPSTREAM) {
      return ['cells' => []];
    } else {
      $map = [
        ROAD_CONDITION_INCREASE_SLIPSTREAM => 1,
        ROAD_CONDITION_SLIPSTREAM_BOOST => 2,
      ];
      $slipstreamBonus = $map[$roadCondition] ?? 0;
      $cards[] = [
        'symbols' => [SLIPSTREAM => $slipstreamBonus],
      ];
    }

    // Any refreshed cards ?
    $refreshedCards = Globals::getRefreshedCards();
    if (!empty($refreshedCards)) {
      $cards = array_merge($cards, $refreshedCards);
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

    // TODO : bonuses for optional slipstream increase
    // TODO : weather module optional slipstream increase

    $cells = [];
    foreach ($slipstreams as $n) {
      $cell = $this->getCircuit()->getSlipstreamResult($constructor, $n);
      if ($cell !== false) {
        $cells[$n] = $cell;
      }
    }

    return [
      'cells' => $cells,
    ];
  }

  public function stSlipstream()
  {
    if (empty($this->argsSlipstream()['cells'])) {
      $this->actSlipstream(0);
    }
  }

  public function actSlipstream($n)
  {
    self::checkAction('actSlipstream');

    $constructor = Constructors::getActive();
    Globals::setPositionBeforeSlipstream($constructor->getPosition());

    if ($n > 0) {
      if (!array_key_exists($n, $this->argsSlipstream()['cells'])) {
        throw new \BgaVisibleSystemException('Invalid slipstream. Should not happen');
      }

      // Compute the new cell
      $this->moveCar($constructor, $n, true);
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
    $corners = $this->getCircuit()->getCornersInBetween($prevTurn, $prevPosition, $turn, $position);

    // Max speed modificator
    $speedLimitModifier = 0;
    foreach ($constructor->getPlayedCards() as $card) {
      $speedLimitModifier += $card['symbols'][ADJUST] ?? 0;
    }

    // Sponsor cards gained
    $sponsorsGained = [];

    // Check if player slipstreamed through a press corner
    $slipstreamedCorners = $this->getCircuit()->getCornersInBetween(
      Globals::getTurnBeforeSlipstream(),
      Globals::getPositionBeforeSlipstream(),
      $turn,
      $position
    );
    foreach ($slipstreamedCorners as $infos) {
      list($cornerPos, $cornerTurn) = $infos;
      if ($this->getCircuit()->isPressCorner($cornerPos)) {
        $sponsorsGained[] = 'slipstream';
      }
    }

    // For each corner, check speed against max speed of corner
    $spinOut = false;
    if (!empty($corners)) {
      $speed = $constructor->getSpeed();
      foreach ($corners as $infos) {
        list($cornerPos, $cornerTurn) = $infos;
        $limit = $this->getCircuit()->getCornerMaxSpeed($cornerPos);
        $limit += $speedLimitModifier;
        $delta = $speed - $limit;
        // Have we overspeed ?
        if ($delta > 0) {
          // Road condition can increase number of heat to pay
          $roadCondition = $this->getCircuit()->getRoadCondition($cornerPos);
          if ($roadCondition == \ROAD_CONDITION_MORE_HEAT) {
            $delta++;
          }

          // Are we spinning out ??
          $available = $constructor->getEngine()->count();
          if ($delta > $available) {
            $cards = $constructor->payHeats($available);
            $cell = $this->getCircuit()->getFirstFreeCell($cornerPos - 1, $constructor->getId());
            $stresses = Cards::addStress($constructor, $constructor->getGear() <= 2 ? 1 : 2);
            $constructor->setCarCell($cell);
            $constructor->setGear(1);
            $constructor->setTurn($cornerTurn);

            // How many cells back ?
            $newPosition = $constructor->getPosition();
            $length = $this->getCircuit()->getLength();
            $nBack = ($position - $newPosition + $length) % $length;
            Notifications::spinOut($constructor, $speed, $limit, $cornerPos, $cards, $cell, $stresses, $nBack, $cornerTurn);
            $spinOut = true;
            break;
          } else {
            $cards = $constructor->payHeats($delta);
            Notifications::payHeatsForCorner($constructor, $cards, $speed, $limit, $cornerPos);
            if ($delta >= 2 && $this->getCircuit()->isPressCorner($cornerPos)) {
              $sponsorsGained[] = 'exceed';
            }
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
      foreach (Constructor::getAll() as $constructor2) {
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
    $cards = $constructor->getHand()->filter(function ($card) {
      return !in_array($card['effect'], [HEAT, STRESS]);
    });

    return [
      '_private' => [
        'active' => [
          'cardIds' => $cards->getIds(),
        ],
      ],
    ];
  }

  public function stDiscard()
  {
    $cardIds = $this->argsDiscard()['_private']['active']['cardIds'];
    if (empty($cardIds)) {
      $this->actDiscard([]);
    }

    $constructor = Constructors::getActive();
    if ($constructor->getTurn() >= $this->getNbrLaps()) {
      $this->actDiscard([]);
    }
  }

  public function actDiscard($cardIds)
  {
    self::checkAction('actDiscard');
    if (count($cardIds) > 0) {
      $constructor = Constructors::getActive();
      $ids = $this->argsDiscard()['_private']['active']['cardIds'];
      if (!empty(array_diff($cardIds, $ids))) {
        throw new \BgaVisibleSystemException('Invalid cards to discard. Should not happen');
      }

      Cards::move($cardIds, ['discard', $constructor->getId()]);
      Notifications::discard($constructor, Cards::getMany($cardIds));
    }

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
    $constructor = Constructors::getActive();
    if ($constructor->getTurn() >= $this->getNbrLaps()) {
      $this->nextPlayerCustomOrder('reveal');
      return;
    }

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

    // Replenish
    Cards::fillHand($constructor);

    $this->nextPlayerCustomOrder('reveal');
  }
}
