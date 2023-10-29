<?php
namespace HEAT\States;
use HEAT\Core\Globals;
use HEAT\Core\Notifications;
use HEAT\Core\Stats;
use HEAT\Helpers\Log;
use HEAT\Helpers\Utils;
use HEAT\Helpers\UserException;
use HEAT\Managers\Constructors;
use HEAT\Managers\Players;
use HEAT\Managers\Cards;

///////////////////////////////////////////
//    ____     ____                 _
//   | ___|   |  _ \ ___  __ _  ___| |_
//   |___ \   | |_) / _ \/ _` |/ __| __|
//    ___) |  |  _ <  __/ (_| | (__| |_
//   |____(_) |_| \_\___|\__,_|\___|\__|
///////////////////////////////////////////
trait ReactTrait
{
  public function argsReact()
  {
    $constructor = Constructors::getActive();
    $roadCondition = $constructor->getRoadCondition();
    $symbols = Globals::getSymbols();
    // Remove symbols that do not apply at this step
    $notReactSymbols = [SLIPSTREAM, REFRESH];
    foreach ($notReactSymbols as $symbol) {
      unset($symbols[$symbol]);
    }

    // Boost bonus
    $boostInfos = [];
    if (!Globals::isUsedBoost()) {
      // Add the boost symbol
      if ($roadCondition == ROAD_CONDITION_FREE_BOOST) {
        $symbols[BOOST] = 1;
      } else {
        $symbols[HEATED_BOOST] = 1;
      }

      // Get some infos
      for ($i = 1; $i <= 4; $i++) {
        list(, , , , , , $boostHeatCosts) = $this->getCircuit()->getReachedCell($constructor, $i, true, true);
        $boostInfos[$i] = $boostHeatCosts;
      }
    }

    // Compute which ones are actually usable
    $doableSymbols = [];
    foreach ($symbols as $symbol => $n) {
      if ($constructor->canUseSymbol($symbol, $n)) {
        $doableSymbols[] = $symbol;
      }
    }

    // Check if heats need to be payed > heats in reserve
    if (($symbols[HEAT] ?? 0) > $constructor->getEngine()->count()) {
      $doableSymbols = array_values(array_intersect($doableSymbols, [COOLDOWN, DIRECT, BOOST, ADRENALINE]));
    }

    // Current heat costs
    list($currentHeatCost, $currentHeatCosts, $spinOut) = $this->getCurrentHeatCosts($constructor);
    // Next corner infos
    list($speedLimit, $nextCornerExtraHeatCost) = $this->getNextCornerInfos($constructor);

    // Adrenaline extra info
    $adrenalineWillCrossNextCorner = false;
    if (in_array(ADRENALINE, $doableSymbols)) {
      list(, $nSpacesForward, , , , , $heatCosts) = $this->getCircuit()->getReachedCell($constructor, 1, true, true);
      if ($nSpacesForward == 0) {
        Utils::filter($doableSymbols, fn($symbol) => $symbol != ADRENALINE);
      }
      $adrenalineWillCrossNextCorner = count($heatCosts) > count($currentHeatCosts);
    }

    $canPass = $this->canPassReact($symbols);

    return [
      'symbols' => $symbols,
      'doable' => $doableSymbols,
      'canPass' => $canPass,
      'descSuffix' => $canPass ? '' : 'Must',
      'flippedCards' => Globals::getFlippedCards(),

      'adrenalineWillCrossNextCorner' => $adrenalineWillCrossNextCorner,
      'currentHeatCost' => $currentHeatCost,
      'heatCosts' => $currentHeatCosts,
      'spinOut' => $spinOut,
      'nextCornerSpeedLimit' => $speedLimit,
      'nextCornerExtraHeatCost' => $nextCornerExtraHeatCost,
      'boostInfos' => $boostInfos,
      'crossedFinishLine' => $constructor->getTurn() >= $this->getCircuit()->getNbrLaps(),
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
    $args = $this->argsReact();
    $n = $args['symbols'][$symbol] ?? null;
    if (is_null($n)) {
      throw new \BgaVisibleSystemException('Invalid symbol. Should not happen');
    }

    // Update remaining symbols
    if (in_array($symbol, [DIRECT, ACCELERATE])) {
      $symbols[$symbol] = array_values(array_diff($symbols[$symbol], [$arg]));
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
      $nForward = $this->moveCar($constructor, 1);
      $constructor->incStat('adrenalineGains', $nForward);
    }
    // HEATED BOOST
    elseif ($symbol == HEATED_BOOST || $symbol == BOOST) {
      $oldRoadCondition = $constructor->getRoadCondition();
      Globals::setUsedBoost(true);
      $constructor->incStat('boost');
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

      $symbols = Globals::getSymbols();
      $roadCondition = $constructor->getRoadCondition();
      if ($roadCondition == ROAD_CONDITION_NO_COOLDOWN) {
        unset($symbols[COOLDOWN]);
      }

      // Weather might add 1 cooldown
      if ($roadCondition != $oldRoadCondition && $roadCondition == ROAD_CONDITION_COOLING_BONUS) {
        $symbols[COOLDOWN] = ($symbols[COOLDOWN] ?? 0) + 1;
      }
      Globals::setSymbols($symbols);
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
      if ($constructor->getDiscard()->empty()) {
        Notifications::message(clienttranslate('${constructor_name} can\'t salvage any card because their discard is empty'), [
          'constructor' => $constructor,
        ]);
      } else {
        Globals::setSalvage($n);
        $this->gamestate->jumpToState(ST_SALVAGE);
        return;
      }
    }
    // DIRECT
    elseif ($symbol == DIRECT) {
      $oldRoadCondition = $constructor->getRoadCondition();
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

      $roadCondition = $constructor->getRoadCondition();
      if ($roadCondition == ROAD_CONDITION_NO_COOLDOWN) {
        unset($symbols[COOLDOWN]);
      }

      // Weather might add 1 cooldown
      if ($roadCondition != $oldRoadCondition && $roadCondition == ROAD_CONDITION_COOLING_BONUS) {
        $symbols[COOLDOWN] = ($symbols[COOLDOWN] ?? 0) + 1;
      }

      Globals::setSymbols($symbols);
    }

    // Loop on same state to resolve other pending symbols
    $this->gamestate->jumpToState(ST_REACT);
  }

  public function stReact()
  {
    $symbols = $this->argsReact()['symbols'];
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

  ///////////////////////////////
  /// NOT ENOUGH HEAT TO PAY
  ///////////////////////////////

  public function actCryCauseNotEnoughHeatToPay()
  {
    $constructor = Constructors::getActive();
    $prevPosition = Globals::getPreviousPosition();
    $prevTurn = Globals::getPreviousTurn();
    $cell = $this->getCircuit()->getFreeCell($prevPosition);
    $constructor->setCarCell($cell);
    $constructor->setTurn($prevTurn);
    $constructor->setSpeed(-1);
    $constructor->setPaths([]);

    Notifications::cryCauseNotEnoughHeatToPay($constructor, $cell, $prevTurn, $constructor->getDistanceToCorner());

    $this->gamestate->jumpToState(ST_PAY_HEATS);
  }

  public function argsPayHeats()
  {
    $constructor = Constructors::getActive();
    $cards = $constructor->getPlayedCards();
    $payingCards = [];
    foreach ($cards as $cardId => $card) {
      $cost = $card['symbols'][HEAT] ?? 0;
      if ($cost > 0) {
        $payingCards[$cardId] = $cost;
      }
    }

    // Compute the max number of cards we can pay for
    asort($payingCards);
    $n = 0;
    $nEngine = $constructor->getEngine()->count();
    $total = 0;
    foreach ($payingCards as $cost) {
      if ($total + $cost <= $nEngine) {
        $total += $cost;
        $n++;
      }
    }

    return [
      'payingCards' => $payingCards,
      'heatInReserve' => $nEngine,
      'maxPayableCards' => $n,
    ];
  }

  public function stPayHeats()
  {
    $args = $this->argsPayHeats();
    if ($args['maxPayableCards'] == 0) {
      $this->actPayHeats([]);
    }
  }

  public function actPayHeats($cardIds)
  {
    self::checkAction('actPayHeats');
    $args = $this->argsPayHeats();
    if (count($cardIds) != $args['maxPayableCards']) {
      throw new \BgaVisibleSystemException('Not enough card. Should not happen');
    }

    $total = 0;
    foreach ($cardIds as $cardId) {
      $total += $args['payingCards'][$cardId];
    }
    if ($total > $args['heatInReserve']) {
      throw new \BgaVisibleSystemException('You cant pay for all these cards. Should not happen');
    }

    $constructor = Constructors::getActive();
    // Pay for them
    if (count($cardIds) > 0) {
      $heats = $constructor->payHeats($total);
      $payedCards = Cards::getMany($cardIds);
      Notifications::payHeats($constructor, $heats, $payedCards);
    }

    // Discard the other cards
    $otherCardIds = array_diff(array_keys($args['payingCards']), $cardIds);
    Cards::move($otherCardIds, ['discard', $constructor->getId()]);
    Notifications::discardCantPay($constructor, Cards::getMany($otherCardIds));

    // Resolve stresses
    $n = count($otherCardIds);
    for ($i = 0; $i < $n; $i++) {
      list($cards, $card) = $constructor->resolveBoost();
      Notifications::resolveBoost($constructor, $cards, $card, $i + 1, $n);
    }

    // Compute symbols
    $symbols = [];
    foreach ($constructor->getPlayedCards() as $card) {
      foreach ($card['symbols'] as $symbol => $n) {
        if (in_array($symbol, [REFRESH, DIRECT, ACCELERATE])) {
          $symbols[$symbol][] = $card['id'];
        } else {
          $symbols[$symbol] = ($symbols[$symbol] ?? 0) + $n;
        }
      }
    }
    $previousSymbols = Globals::getSymbols();
    if (isset($previousSymbols[ADRENALINE])) {
      $symbols[ADRENALINE] = $previousSymbols[ADRENALINE];
    }
    unset($symbols[COOLDOWN]);
    unset($symbols[BOOST]);
    unset($symbols[ADJUST]);
    unset($symbols[DIRECT]);
    foreach ($constructor->getHand() as $cardId => $card) {
      if (isset($card['symbols'][DIRECT])) {
        $symbols[DIRECT][] = $cardId;
      }
    }
    unset($symbols[HEAT]);
    Globals::setSymbols($symbols);

    // Move car
    $speed = 0;
    foreach ($constructor->getPlayedCards() as $card) {
      $speed += is_array($card['speed']) ? min($card['speed']) : $card['speed'];
    }
    $constructor->setSpeed($speed);
    $this->moveCar($constructor, $speed);

    $this->gamestate->jumpToState(ST_REACT);
  }
}
