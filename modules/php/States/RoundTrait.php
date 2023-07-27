<?php
namespace HEAT\States;
use HEAT\Core\Globals;
use HEAT\Core\Notifications;
use HEAT\Core\Stats;
use HEAT\Helpers\Log;
use HEAT\Managers\Constructors;
use HEAT\Managers\Players;
use HEAT\Managers\Cards;

trait RoundTrait
{
  function stStartRound()
  {
    Globals::setPlanification([]);
    $this->gamestate->setAllPlayersMultiactive();
    $this->gamestate->nextState('planification');
  }

  function stEndRound()
  {
    // Compute new order
    $positions = [];
    $length = $this->getCircuit()->getLength();
    foreach (Constructors::getAll() as $constructor) {
      $position = $constructor->getPosition();
      $line = $constructor->getLine();
      $raceLine = $this->getCircuit()->getRaceLine($position);
      $uid = ($length * $constructor->getTurn() + $position) * 2 + ($line == $raceLine ? 1 : 0);
      $positions[$uid] = $constructor->getId();
    }

    krsort($positions);
    $order = array_values($positions);
    Globals::setTurnOrder($order);
    $constructors = [];
    foreach ($order as $i => $cId) {
      $constructor = Constructors::get($cId);
      $constructor->setNo($i);
      $constructors[] = $constructor;
    }
    Notifications::updateTurnOrder($constructors);

    // TODO : check crossing end

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
    Globals::setPreviousPosition($constructor->getPosition());
    Globals::setPreviousTurn($constructor->getTurn());
    $symbols = [];
    foreach ($cards as $card) {
      foreach ($card['symbols'] as $symbol => $n) {
        $symbols[$symbol] = ($symbols[$symbol] ?? 0) + $n;
      }
    }

    // Resolve + symbols
    $n = $symbols[BOOST] ?? 0;
    for ($i = 0; $i < $n; $i++) {
      list($cards, $card) = $constructor->resolveBoost();
      Notifications::resolveBoost($constructor, $cards, $card, $i + 1, $n);
    }

    unset($symbols[BOOST]);
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
    $speed = 0;
    foreach ($constructor->getPlayedCards() as $card) {
      if (is_array($card['speed'])) {
        die('TODO: multiple speed');
      }
      $speed += $card['speed'];
    }
    $possibleSpeeds = [$speed];

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

    // Adrenaline
    $no = $constructor->getNo();
    $nbr = Constructors::count();
    if ($no == $nbr - 1 || ($no == $nbr - 2 && $nbr >= 5)) {
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
    $symbols[HEATED_BOOST] = 1;

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
    $doableSymbols = [];
    foreach ($symbols as $symbol => $n) {
      if ($constructor->canUseSymbol($symbol)) {
        $doableSymbols[] = $symbol;
      }
    }

    return [
      'symbols' => $symbols,
      'doable' => $doableSymbols,
      'canPass' => true,
    ];
  }

  public function actReact($symbol)
  {
    self::checkAction('actReact');
    $constructor = Constructors::getActive();
    $symbols = Globals::getSymbols();
    $n = $symbols[$symbol] ?? null;
    if (is_null($n)) {
      throw new \BgaVisibleSystemException('Invalid symbol. Should not happen');
    }

    // Update remaining symbols
    unset($symbols[$symbol]);
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
    elseif ($symbol == HEATED_BOOST) {
      $heats = $constructor->payHeats(1);
      list($cards, $card) = $constructor->resolveBoost();
      Notifications::heatedBoost($constructor, $heats, $cards, $card);
      // Increase speed and move the card
      $speed = $card['speed'];
      $constructor->incSpeed($speed);
      $this->moveCar($constructor, $speed);
    }

    // Loop on same state to resolve other pending symbols
    $this->gamestate->jumpToState(ST_REACT);
  }

  public function actPassReact()
  {
    self::checkAction('actPassReact');
    $this->stReactDone();
  }

  public function stReactDone()
  {
    $this->gamestate->jumpToState(ST_SLIPSTREAM);
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
    if ($n > 0) {
      if (!array_key_exists($n, $this->argsSlipstream()['cells'])) {
        throw new \BgaVisibleSystemException('Invalid slipstream. Should not happen');
      }

      // Compute the new cell
      $constructor = Constructors::getActive();
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

    // For each corner, check speed against max speed of corner
    if (!empty($corners)) {
      $speed = $constructor->getSpeed();
      foreach ($corners as $corner) {
        list($position, $limit) = $corner;
        // TODO : weather can modify limit as well as some upgrade cards
        $delta = $speed - $limit;
        // Have we overspeed ?
        if ($delta > 0) {
          // Are we spinning out ??
          if ($delta > $constructor->getEngine()->count()) {
            die('TODO: spinning out !');
            break;
          } else {
            $cards = $constructor->payHeats($delta);
            Notifications::payHeatsForCorner($constructor, $cards, $speed, $limit);
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
    // Discard played cards
    $constructor = Constructors::getActive();
    $cardIds = $constructor->getPlayedCards()->getIds();
    Cards::move($cardIds, ['discard', $constructor->getId()]);
    Notifications::clearPlayedCards($constructor, $cardIds);

    // Replenish
    Cards::fillHand($constructor);

    $this->nextPlayerCustomOrder('reveal');
  }
}
