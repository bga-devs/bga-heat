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

    ksort($positions);
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
    if (abs($newGear - $constructor->getGear()) > 1) {
      die('TODO : pay a heat for change of two gears');
    }
    $constructor->setGear($newGear);
    Cards::move($cardIds, ['inplay', $constructor->getId()]);
    $cards = Cards::getMany($cardIds);
    Notifications::reveal($constructor, $newGear, $cards, $heat);

    // Store previous position and store symbols
    Globals::setPreviousPosition($constructor->getPosition());
    $symbols = [];
    foreach ($cards as $card) {
      foreach ($card['symbols'] as $symbol => $n) {
        $symbols[$symbol] = ($symbols[$symbol] ?? 0) + $n;
      }
    }
    Globals::setSymbols($symbols);

    // Resolve + symbols
    if (($symbols[PLUS] ?? 0) > 0) {
      die('TODO: handle + symbols');
    }

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
    Notifications::moveCar($constructor, $newCell, $speed, $nSpacesForward, $extraTurns);

    $this->stAdrenaline();
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
    $symbols[BOOST] = 1;

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
    $symbols = Globals::getSymbols();
    return [
      'symbols' => $symbols,
      'canPass' => true,
    ];
  }

  public function actReact()
  {
    self::checkAction('actReact');
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
    return [];
  }

  public function stSlipstream()
  {
    $this->actSlipstream(false);
  }

  public function actSlipstream($move)
  {
    self::checkAction('actSlipstream');
    if ($move) {
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
    if (count($cardIds) > 1) {
      $ids = $this->argsDiscard()['_private']['active']['cardIds'];
      if (!empty(array_diff($cardIds, $ids))) {
        throw new \BgaVisibleSystemException('Invalid cards to discard. Should not happen');
      }

      Cards::move($cardIds, ['discard', $constructor->getId()]);
      Notifications::discard($constructor, $cardIds);
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
    $nCards = $constructor->getHand()->count();
    $nToDraw = 7 - $nCards;
    $cards = Cards::draw($constructor->getId(), $nToDraw);
    Notifications::draw($constructor, $cards);

    $this->nextPlayerCustomOrder('reveal');
  }
}
