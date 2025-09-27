<?php

namespace Bga\Games\Heat\States;

use Bga\Games\Heat\Core\Globals;
use Bga\Games\Heat\Core\Notifications;
use Bga\Games\Heat\Core\Stats;
use Bga\Games\Heat\Helpers\Log;
use Bga\Games\Heat\Helpers\Utils;
use Bga\Games\Heat\Helpers\UserException;
use Bga\Games\Heat\Managers\Constructors;
use Bga\Games\Heat\Managers\Players;
use Bga\Games\Heat\Managers\Cards;

use \Bga\GameFramework\Actions\Types\JsonParam;
use Bga\Games\Heat\Models\Constructor;

///////////////////////////////////////////
//    ____     ____                 _
//   | ___|   |  _ \ ___  __ _  ___| |_
//   |___ \   | |_) / _ \/ _` |/ __| __|
//    ___) |  |  _ <  __/ (_| | (__| |_
//   |____(_) |_| \_\___|\__,_|\___|\__|
///////////////////////////////////////////
trait ReactTrait
{
  /**
   * canUseSymbol: given a constructor and a symbol, return whether the constructor can use the symbol or not
   *  for some symbols, it returns the maximum number of that symbol he can use
   */
  public function canUseSymbol(Constructor $constructor, string $symbol, array $symbolInfos): bool|int
  {
    // Cooldown => must have something to cooldown in the hand
    if ($symbol == \COOLDOWN) {
      $roadCondition = $constructor->getRoadCondition();
      if ($roadCondition == ROAD_CONDITION_NO_COOLDOWN) {
        return false;
      }

      return $constructor->getHeatsInHand()->count();
    }
    // Reduce stress => must have stress cards in hand
    elseif ($symbol == REDUCE) {
      return $constructor->getStressesInHand()->count();
    }
    // Heated boost => must be able to pay for it
    elseif ($symbol == HEATED_BOOST && $symbolInfos['heated']) {
      return $constructor->getEngine()->count() > 0;
    }
    // Heat
    elseif ($symbol == HEAT) {
      return $constructor->getEngine()->count();
    }

    return true;
  }


  public function argsReact()
  {
    $constructor = Constructors::getActive();
    $roadCondition = $constructor->getRoadCondition();
    $symbols = Globals::getCardSymbols();

    // Current heat costs
    list('heatCost' => $currentHeatCost, 'heatCosts' => $currentHeatCosts, 'spinOut' => $spinOut) = $this->getCurrentHeatCosts($constructor);
    // Next corner infos
    list('speedLimit' => $speedLimit, 'extraHeat' => $nextCornerExtraHeatCost) = $this->getNextCornerInfos($constructor);

    // Remove symbols that do not apply at this step
    $notReactSymbols = [SLIPSTREAM, REFRESH];
    foreach ($notReactSymbols as $symbol) {
      unset($symbols[$symbol]);
    }

    // Disable cooldown if no heat in hand
    if ($constructor->getHeatsInHand()->count() == 0) {
      unset($symbols[COOLDOWN]);
    }

    // Boost bonus
    if (!$symbols[HEATED_BOOST]['entries'][HEATED_BOOST]['used']) {
      // Add the boost symbol
      $symbols[HEATED_BOOST]['heated'] = ($roadCondition != ROAD_CONDITION_FREE_BOOST);

      // Get some infos
      $boostInfos = [];
      for ($i = 1; $i <= 4; $i++) {
        $boostResult = $this->getCircuit()->getReachedCell($constructor, $i, FLAG_COMPUTE_HEAT_COSTS);
        $boostInfos[$i] = $boostResult['heatCosts'];
      }
      $symbols[HEATED_BOOST]['heatCosts'] = $boostInfos;
    }

    // Adrenaline extra info
    if (isset($symbols[ADRENALINE])) {
      list('heatCosts' => $heatCosts, 'distance' => $nSpacesForward) = $this->getCircuit()->getReachedCell($constructor, 1, FLAG_COMPUTE_HEAT_COSTS);
      if ($nSpacesForward == 0) {
        $symbols[ADRENALINE]['doable'] = false;
      }
      $symbols[ADRENALINE]['willCrossNextCorner'] = count($heatCosts) > count($currentHeatCosts);
    }

    // Direct play extra infos
    if (isset($symbols[DIRECT])) {
      $directPlayCosts = [];
      foreach ($symbols[DIRECT]['entries'] ?? [] as $cardId => $infos) {
        $card = Cards::getSingle($cardId);
        $speed = $card['speed'];
        list('heatCosts' => $heatCosts) = $this->getCircuit()->getReachedCell($constructor, $speed, true, true);

        $directPlayCosts[$cardId] = $heatCosts;
      }
      $symbols[DIRECT]['heatCosts'] = $directPlayCosts;
    }

    ////////////////////////////////////////////////
    // Add some informations to symbols
    ////////////////////////////////////

    // Compute which ones are actually usable
    foreach ($symbols as $symbol => &$symbolInfos) {
      $symbolInfos['doable'] = $this->canUseSymbol($constructor, $symbol, $symbolInfos);

      // Disable some symbols on some cards
      if (!in_array($symbol, [HEAT, COOLDOWN, DIRECT, BOOST, ADRENALINE, SUPER_COOL])) {
        foreach ($symbolInfos['entries'] as $cardId => &$infos) {
          if (!isset($symbols[HEAT][$cardId])) continue;
          $infos['doable'] = $symbols[HEAT][$cardId]['used'] ?? false;
        }
      }
    }

    // Used ?
    foreach ($symbols as $symbol => &$symbolInfos) {
      $used = true;
      foreach ($symbolInfos['entries'] as $cardId => $infos) {
        if (!($infos['used'] ?? false)) {
          $used = false;
        }
      }
      $symbolInfos['used'] = $used;
    }

    // Mandatory / Coalescable / UpTo
    $canPass = true;
    $mandatorySymbols = [HEAT, SCRAP];
    $coalescableSymbols = [COOLDOWN, HEAT, DRAFT, SUPER_COOL, REDUCE];
    $upToSymbols = [COOLDOWN, DRAFT, REDUCE, SUPER_COOL];

    foreach ($symbols as $symbol => &$symbolInfos) {
      $symbolInfos['mandatory'] = in_array($symbol, $mandatorySymbols);
      $symbolsInfos['coalescable'] = in_array($symbol, $coalescableSymbols);
      $symbolsInfos['upTo'] = in_array($symbol, $upToSymbols);

      if ($symbolInfos['mandatory']) {
        $canPass = $canPass && $symbolInfos['used'];
      }
    }
    ////////////////////////////////////////////////

    return [
      'symbols' => $symbols,
      'canPass' => $canPass,
      'descSuffix' => $canPass ? '' : 'Must',
      'flippedCards' => Globals::getFlippedCards(),

      'symbols' => $symbols,
      'currentHeatCost' => $currentHeatCost,
      'heatCosts' => $currentHeatCosts,
      'spinOut' => $spinOut,
      'nextCornerSpeedLimit' => $speedLimit,
      'nextCornerExtraHeatCost' => $nextCornerExtraHeatCost,
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

  public function actReact($symbol, $cardIds, $n = null)
  {
    self::checkAction('actReact');
    $constructor = Constructors::getActive();
    $symbols = Globals::getCardSymbols();
    $symbol = null;
    $args = $this->argsReact();
    $n = $args['symbols'][$symbol] ?? null;
    if (is_null($n)) {
      throw new \BgaVisibleSystemException('Invalid symbol. Should not happen');
    }
    die("TODO");

    // Update remaining symbols
    if (in_array($symbol, [DIRECT, ACCELERATE])) {
      if (!in_array($arg, $symbols[$symbol])) {
        throw new \BgaVisibleSystemException('Invalid card. Should not happen');
      }
      $symbols[$symbol] = array_values(array_diff($symbols[$symbol], [$arg]));
    } else {
      if ($arg != '') {
        $m = (int) $arg;
        if ($m < 0 || $m > $n) {
          throw new \BgaVisibleSystemException('Invalid arg. Should not happen');
        }
        $n = $m;
        $symbols[$symbol] -= $n;
        if ($symbols[$symbol] <= 0) {
          unset($symbols[$symbol]);
        }
      } else {
        unset($symbols[$symbol]);
      }
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
      $oldRoadCondition = $constructor->getRoadCondition();
      $nForward = $this->moveCar($constructor, 1);
      $constructor->incStat('adrenalineGains', $nForward);

      // Weather might add 1 cooldown
      $roadCondition = $constructor->getRoadCondition();
      if ($roadCondition != $oldRoadCondition && $roadCondition == ROAD_CONDITION_COOLING_BONUS) {
        $symbols = Globals::getSymbols();
        $symbols[COOLDOWN] = ($symbols[COOLDOWN] ?? 0) + 1;
        Globals::setSymbols($symbols);
      }
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

      // Weather might add 1 cooldown
      $roadCondition = $constructor->getRoadCondition();
      if ($roadCondition != $oldRoadCondition && $roadCondition == ROAD_CONDITION_COOLING_BONUS) {
        $symbols = Globals::getSymbols();
        $symbols[COOLDOWN] = ($symbols[COOLDOWN] ?? 0) + 1;
        Globals::setSymbols($symbols);
      }
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
      $oldRoadCondition = $constructor->getRoadCondition();
      $cardId = $arg;
      $card = Cards::getSingle($cardId);
      $n = Globals::getFlippedCards();
      $constructor->incSpeed($n);
      Notifications::accelerate($constructor, $card, $n);
      // Move car
      $this->moveCar($constructor, $n);

      // Weather might add 1 cooldown
      $roadCondition = $constructor->getRoadCondition();
      if ($roadCondition != $oldRoadCondition && $roadCondition == ROAD_CONDITION_COOLING_BONUS) {
        $symbols = Globals::getSymbols();
        $symbols[COOLDOWN] = ($symbols[COOLDOWN] ?? 0) + 1;
        Globals::setSymbols($symbols);
      }
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
    // SUPER COOL
    elseif ($symbol == SUPER_COOL) {
      if ($constructor->getDiscard()->empty()) {
        Notifications::message(clienttranslate('${constructor_name} can\'t super cool any card because their discard is empty'), [
          'constructor' => $constructor,
        ]);
      } else {
        Globals::setSuperCool($n);
        $this->gamestate->jumpToState(ST_SUPER_COOL);
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

      // Weather might add 1 cooldown
      $roadCondition = $constructor->getRoadCondition();
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

  public function actSalvage(#[JsonParam()] array $cardIds)
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
  /// SUPER COOL
  ///////////////////////////////
  public function argsSuperCool()
  {
    $n = Globals::getSuperCool();
    $constructor = Constructors::getActive();
    $discard = $constructor->getDiscard();
    $heatCards = $discard->filter(fn($card) => $card['effect'] == HEAT);
    return [
      'n' => $n,
      '_private' => [
        $constructor->getPId() => [
          'cards' => $discard,
          'max' => count($heatCards),
        ],
      ],
    ];
  }

  public function actSuperCool(int $n)
  {
    self::checkAction('actSuperCool');
    $args = $this->argsSuperCool();
    if ($n > $args['n']) {
      throw new \BgaVisibleSystemException('Too much cards. Should not happen');
    }

    $constructor = Constructors::getActive();
    $cId = $constructor->getId();
    if ($n > 0) {
      $discard = $constructor->getDiscard();
      $heatCards = $discard->filter(fn($card) => $card['effect'] == HEAT);
      $cards = $heatCards->limit($n);
      $cardIds = $cards->getIds();
      Cards::move($cardIds, "engine-$cId");
      Notifications::superCoolCards($constructor, $cards);
    } else {
      Notifications::superCoolCards($constructor, []);
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

  public function actPayHeats(#[JsonParam()] array $cardIds)
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
