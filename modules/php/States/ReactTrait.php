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
   *  - bool doable: can we use it?
   *  - ?int max : how much can we use it at most
   *  - ?int min: how much do we have to use it if we want to use it
   */
  public function getPossibleUseOfSymbol(Constructor $constructor, string $symbol, array $symbolInfos): array
  {
    // Cooldown => must have something to cooldown in the hand
    if ($symbol == \COOLDOWN) {
      $roadCondition = $constructor->getRoadCondition();
      if ($roadCondition == ROAD_CONDITION_NO_COOLDOWN) {
        return ['doable' => false];
      }

      $n = $constructor->getHeatsInHand()->count();
      return ['doable' => $n > 0, 'max' => $n];
    }
    // Reduce stress => must have stress cards in hand
    elseif ($symbol == REDUCE) {
      $n = $constructor->getStressesInHand()->count();
      return ['doable' => $n > 0, 'max' => $n];
    }
    // Heated boost => must be able to pay for it
    elseif ($symbol == HEATED_BOOST && ($symbolInfos['heated'] ?? false)) {
      return ['doable' => $constructor->getEngine()->count() > 0];
    }
    // Heat
    elseif ($symbol == HEAT) {
      $n = $constructor->getEngine()->count();
      return ['doable' => $n > 0, 'max' => $n];
    }
    // Draft
    elseif ($symbol == DRAFT) {
      $n = $constructor->getDraftableDistance();
      return ['doable' => $n > 0, 'max' => $n, 'min' => $n];
    }

    return ['doable' => true];
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
    $notReactSymbols = [SLIPSTREAM, REFRESH, ADJUST];
    foreach ($notReactSymbols as $symbol) {
      unset($symbols[$symbol]);
    }

    // Disable cooldown if no heat in hand
    if ($constructor->getHeatsInHand()->count() == 0) {
      unset($symbols[COOLDOWN]);
    }

    ///////////////////////////
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

    ///////////////////////////
    // Adrenaline extra info
    if (isset($symbols[ADRENALINE])) {
      list('heatCosts' => $heatCosts, 'distance' => $nSpacesForward) = $this->getCircuit()->getReachedCell($constructor, 1, FLAG_COMPUTE_HEAT_COSTS);
      if ($nSpacesForward == 0) {
        $symbols[ADRENALINE]['doable'] = false;
      }
      $symbols[ADRENALINE]['willCrossNextCorner'] = count($heatCosts) > count($currentHeatCosts);
    }

    ///////////////////////////
    // Direct play extra infos
    foreach ($constructor->getHand() as $cardId => $card) {
      if (!isset($card['symbols'][DIRECT])) continue;

      $symbols[DIRECT]['entries'][$cardId] = ['used' => false];
    }
    if (isset($symbols[DIRECT])) {
      $directPlayCosts = [];
      foreach ($symbols[DIRECT]['entries'] ?? [] as $cardId => $infos) {
        $card = Cards::getSingle($cardId);
        $speed = $card['speed'];
        list('heatCosts' => $heatCosts) = $this->getCircuit()->getReachedCell($constructor, $speed, FLAG_COMPUTE_HEAT_COSTS);

        $directPlayCosts[$cardId] = $heatCosts;
      }
      $symbols[DIRECT]['heatCosts'] = $directPlayCosts;
    }

    ///////////////////////////
    // Accelerate extra infos
    if (isset($symbols[ACCELERATE])) {
      $symbols[ACCELERATE]['flippedCards'] = Globals::getFlippedCards();
    }

    ////////////////////////////////////////////////
    // Add some informations to symbols
    ////////////////////////////////////

    // Mandatory / Coalescable / UpTo
    $canPass = true;
    $mandatorySymbols = [HEAT, SCRAP];
    $coalescableSymbols = [HEAT, SCRAP, COOLDOWN, DRAFT, REDUCE, SUPER_COOL];
    $irreversibleSymbols = [SCRAP, BOOST, HEATED_BOOST];
    $upToSymbols = [COOLDOWN, DRAFT, REDUCE, SUPER_COOL];

    foreach ($symbols as $symbol => &$symbolInfos) {
      $symbolInfos['mandatory'] = in_array($symbol, $mandatorySymbols);
      $symbolInfos['coalescable'] = in_array($symbol, $coalescableSymbols);
      $symbolInfos['irreversible'] = in_array($symbol, $irreversibleSymbols);
      $symbolInfos['upTo'] = in_array($symbol, $upToSymbols);

      if ($symbolInfos['mandatory']) {
        $canPass = $canPass && $symbolInfos['used'];
      }
    }
    unset($symbolInfos);

    // Compute which ones are actually usable
    foreach ($symbols as $symbol => &$symbolInfos) {
      // Add information about doable, min,max doable
      $possibleUse = $this->getPossibleUseOfSymbol($constructor, $symbol, $symbolInfos);
      $symbolInfos = array_merge($symbolInfos, $possibleUse);

      if (isset($symbolInfos['max']) || isset($symbolInfos['min'])) {
        $values = array_map(fn($entry) => $entry['n'] ?? 0, $symbolInfos['entries']);
        $totalN = array_sum($values);

        if (isset($symbolInfos['min'])) {
          $symbolInfos['doable'] = $symbolInfos['doable'] && $symbolInfos['min'] <= $totalN;
        }
        if (isset($symbolInfos['max'])) {
          $symbolInfos['doable'] = $symbolInfos['doable'] && (($symbolInfos['upTo'] ?? false) || min($values) <= $symbolInfos['max']);
        }
      }

      // Disable some symbols on some cards
      if (!in_array($symbol, [HEAT, COOLDOWN, DIRECT, HEATED_BOOST, ADRENALINE, SUPER_COOL, DRAFT])) {
        foreach ($symbolInfos['entries'] as $cardId => &$infos) {
          if (!isset($symbols[HEAT][$cardId])) continue;
          $infos['doable'] = $symbols[HEAT][$cardId]['used'] ?? false;
        }
        unset($infos);
      }

      // Some symbol entries are linked to corner => check if constructor is within that sector
      foreach ($symbolInfos['entries'] as $cardId => &$infos) {
        if (!isset($infos['cornerPos'])) continue;

        $infos['doable'] = $constructor->getSector() == $infos['cornerPos'];
      }
      unset($infos);
    }
    unset($symbolInfos);

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
    unset($symbolInfos);
    ////////////////////////////////////////////////

    return [
      'undoableSteps' => Log::getUndoableSteps(),
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

  /**
   * actReact :
   *  - the symbol we are resolving
   *  - the list of string entries that we are using, mostly cardIds
   *  - (optional) value we are actually wanting to use (needed for "upTo" symbols)
   */
  public function actReact(string $symbol, #[JsonParam] $entries, ?int $n = null)
  {
    $this->addNewUndoableStep();
    $constructor = Constructors::getActive();
    $symbols = Globals::getCardSymbols();

    // Sanity checks
    $args = $this->argsReact();
    $symbolInfos = $args['symbols'][$symbol] ?? null;
    if (is_null($symbolInfos)) {
      throw new \BgaVisibleSystemException('Invalid symbol. Should not happen');
    }
    if (!$symbolInfos['doable']) {
      throw new \BgaVisibleSystemException('Not doable symbol. Should not happen');
    }
    if (empty($entries)) {
      throw new \BgaVisibleSystemException('No entry picked for that symbol. Should not happen');
    }
    $totalN = 0;
    foreach ($entries as $entry) {
      $entryInfos = $symbolInfos['entries'][$entry] ?? null;
      if (!isset($entryInfos)) {
        throw new \BgaVisibleSystemException('Invalid entry for that symbol. Should not happen');
      }
      if ($entryInfos['used'] ?? false) {
        throw new \BgaVisibleSystemException('Already used entry for that symbol. Should not happen');
      }
      if (!($entryInfos['doable'] ?? true)) {
        throw new \BgaVisibleSystemException('Non doable entry for that symbol. Should not happen');
      }

      $totalN += $entryInfos['n'] ?? 0;
    }
    if ($symbolInfos['coalescable']) {
      if (is_null($n)) {
        throw new \BgaVisibleSystemException('No total value picked for a coalescable symbol. Should not happen');
      }
      if ($totalN < $n || ($totalN != $n && !$symbolInfos['upTo'])) {
        throw new \BgaVisibleSystemException('Invalid total value picked for a coalescable symbol. Should not happen');
      }
      if (isset($symbolInfos['max']) && $n > $symbolInfos['max']) {
        throw new \BgaVisibleSystemException('Too large total value picked for that coalescable symbol. Should not happen');
      }
      if (isset($symbolInfos['min']) && $n < $symbolInfos['min']) {
        throw new \BgaVisibleSystemException('Too small total value picked for that coalescable symbol. Should not happen');
      }
    } else {
      if (count($entries) > 1) {
        throw new \BgaVisibleSystemException('Multiple entries picked for a non-coalescable entry. Should not happen');
      }
    }


    // Update remaining symbols
    foreach ($entries as $entry) {
      $symbols[$symbol]['entries'][$entry]['used'] = true;
    }
    Globals::setCardSymbols($symbols);

    //////////////////////////////
    /////// Resolve effect ///////
    //////////////////////////////
    // Checkpoint in case of irreversible symbol
    if ($symbolInfos['irreversible']) {
      Log::checkpoint();
    }

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
    elseif ($symbol == HEATED_BOOST) {
      $constructor->incStat('boost');
      if ($symbolInfos['heated']) {
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
      $cards = $constructor->getStressesInHand()->limit($n);
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
      $cardId = $entries[0];
      $card = Cards::getSingle($cardId);
      $n = Globals::getFlippedCards();
      $constructor->incSpeed($n);
      Notifications::accelerate($constructor, $card, $n);
      // Move car
      $this->moveCar($constructor, $n);
    }
    // DRAFT
    elseif ($symbol == DRAFT) {
      $this->moveCar($constructor, $n, false, null, true);
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
      $cardId = $entries[0];
      $card = Cards::getSingle($cardId);
      Cards::move($cardId, ['inplay', $constructor->getId()]);
      $speed = $card['speed'];
      $constructor->incSpeed($speed);
      Notifications::directPlay($constructor, $card, $speed);

      if ($speed > 0) {
        $this->moveCar($constructor, $speed);
        $symbols[SPEED]['entries'][$cardId] = [
          'values' => [$speed],
          'used' => true,
        ];
      }

      // Add new symbols !
      foreach ($card['symbols'] as $symbol => $n) {
        $data = ['used' => $symbol === DIRECT]; // Mark the "DIRECT" symbol as used
        if (!in_array($symbol, CARD_SYMBOLS)) {
          $data['n'] = $n;
        }
        $symbols[$symbol]['entries'][$cardId] = $data;
      }

      Globals::setCardSymbols($symbols);
    }

    // Loop on same state to resolve other pending symbols
    $this->gamestate->jumpToState(ST_REACT);
  }

  public function stReact()
  {
    // TODO : autopass

    // $symbols = $this->argsReact()['symbols'];
    // foreach ($symbols as $symbol => $n) {
    //   if (in_array($symbol, [REFRESH, DIRECT, ACCELERATE])) {
    //     if (!empty($n)) {
    //       return;
    //     }
    //   } else {
    //     if ($n > 0) {
    //       return;
    //     }
    //   }
    // }

    // $this->stReactDone();
  }

  public function actPassReact()
  {
    $this->addNewUndoableStep();
    self::checkAction('actPassReact');
    if (!$this->argsReact()['canPass']) {
      throw new \BgaVisibleSystemException('Cant pass react with mandatory symbols left. Should not happen');
    }

    $constructor = Constructors::getActive();
    Notifications::message(clienttranslate('${constructor_name} ends their React phase'), ['constructor' => $constructor]);

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
    $this->addNewUndoableStep();
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
    $this->addNewUndoableStep();
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
