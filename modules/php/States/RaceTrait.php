<?php

namespace Bga\Games\Heat\States;

use \Bga\GameFramework\Actions\CheckAction;

use Bga\Games\Heat\Core\Globals;
use Bga\Games\Heat\Core\Notifications;
use Bga\Games\Heat\Managers\Constructors;
use Bga\Games\Heat\Managers\Players;
use Bga\Games\Heat\Managers\Cards;
use Bga\Games\Heat\Helpers\UserException;

trait RaceTrait
{
  public function stSetupRace(): void
  {
    // Championship
    if (Globals::isChampionship()) {
      $datas = Globals::getChampionshipDatas();
      $race = $datas['circuits'][$datas['index']];

      Globals::setCircuit($race['circuit']);
      // Custom circuit
      if (isset($race['circuitDatas'])) {
        Globals::setCircuitDatas($race['circuitDatas']);
      }
      // Standard one
      else {
        Globals::loadCircuitDatas();
      }
      $this->circuit = null; // Prevent caching
    }

    // Place cars on starting positions
    $circuit = $this->getCircuit();
    $cells = $circuit->getStartingCells();
    $positions = [];
    $constructors = [];
    foreach (Constructors::getTurnOrder() as $i => $cId) {
      $cell = $cells[$i];
      $constructor = Constructors::get($cId);
      $constructor->setCarCell($cell);
      $constructor->setTurn(-1);
      // $constructor->setTurn($this->getNbrLaps());
      $constructor->setGear(1);
      $constructor->setSpeed(-1);
      $constructor->setPaths([]);
      $constructor->incStat('position', $i + 1);
      $positions[$cId] = $cell;
      $constructors[] = $constructor;
    }

    if (Globals::isChampionship()) {
      Notifications::newChampionshipRace($datas, $this->getCircuit());
    }
    Notifications::startRace($constructors, $positions);
    Cards::clean();

    if (!Globals::isChampionship()) {
      $this->setWeatherAndSetupCards();
    } else {
      Globals::setWeather([]);
    }

    Globals::setFinishedConstructors([]);
    Globals::setSkippedPlayers([]);
    Globals::setGiveUpPlayers([]);
    Globals::setMulligans([]);
    Globals::setRound(0);
    if (in_array(Globals::getGarageModuleMode(), [\Bga\Games\Heat\OPTION_GARAGE_DRAFT, \Bga\Games\Heat\OPTION_GARAGE_SNAKE_DRAFT])) {
      Globals::setDraftRound(1);
      $this->gamestate->nextState('draft');
    } else {
      $this->gamestate->nextState('start');
    }
  }

  public function setWeatherAndSetupCards(): void
  {
    // Weather
    if (Globals::isWeatherModule()) {
      $circuit = $this->getCircuit();

      // Draw a card
      $weatherCard = bga_rand(0, 5);
      // Draw tokens
      $tokens = [0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 5, 5];
      shuffle($tokens);
      $cornerTokens = [];
      foreach ($circuit->getCorners() as $cornerPos => $maxSpeed) {
        if (!$circuit->isChicane($cornerPos)) {
          $cornerTokens[$cornerPos] = array_shift($tokens);
        }
      }
      // Simulate duplicated tokens for chicane, 
      //  but remove sector token from the first corner to make sure sector in between the two corners has nothing on it
      foreach ($circuit->getCorners() as $cornerPos => $maxSpeed) {
        if ($circuit->isChicane($cornerPos)) {
          $mainCornerPos = $circuit->getChicaneMainCorner($cornerPos);
          $cornerTokens[$cornerPos] = $cornerTokens[$mainCornerPos];
          if (in_array($cornerTokens[$cornerPos], [ROAD_CONDITION_WEATHER, ROAD_CONDITION_FREE_BOOST, ROAD_CONDITION_INCREASE_SLIPSTREAM])) {
            $cornerTokens[$mainCornerPos] = null;
          }
        }
      }
      Globals::setWeather([
        'card' => $weatherCard,
        'tokens' => $cornerTokens,
      ]);

      Notifications::setWeather(Globals::getWeather());
    }

    // Draw heat and stress cards
    Cards::setupRace();
  }

  public function stStartRace(): void
  {
    if (Globals::isChampionship()) {
      $this->setWeatherAndSetupCards();
    }

    // Shuffle deck and draw cards
    foreach (Constructors::getAll() as $cId => $constructor) {
      if ($constructor->isAI()) {
        continue;
      }

      Cards::shuffle("deck-$cId");
      Cards::fillHand($constructor);
    }

    $this->gamestate->nextState('startRound');
  }

  public function stFinishRace(): void
  {
    $scores = Globals::getScores();
    $score = [];

    // Compute podium points depending on events
    $podium = [9, 6, 4, 3, 2, 1];
    $event = Globals::getCurrentEvent();
    if ($event == EVENT_STRIKE) {
      $podium[0] += 2;
    } elseif ($event == EVENT_CORRUPTION) {
      $podium[0]++;
      $podium[1]++;
      $podium[2]++;
    }

    // Award points
    $nLaps = $this->getNbrLaps();
    $skippedPlayers = Globals::getSkippedPlayers();
    foreach (Constructors::getAll() as $cId => $constructor) {
      $podiumPos = -$constructor->getCarCell() - 1;
      $constructor->incStat('endPosition', $podiumPos + 1);
      $constructor->incStat('heatLeft', $constructor->getEngine()->count());

      $score[$cId] = $podium[$podiumPos] ?? 0;
      $eliminated = $constructor->getTurn() < $nLaps;
      if ($eliminated || (!$constructor->isAI() && in_array($constructor->getPId(), $skippedPlayers))) {
        $score[$cId] = 0;
      }
      $constructor->incScore($score[$cId]);
      $constructor->setScoreAux($score[$cId]);
    }

    // Compute new turn order (only useful for championship)
    $constructors = Constructors::getAll()->toAssoc();
    uasort($constructors, function ($c1, $c2) use ($score) {
      return $c2->getScore() - $c1->getScore() ?: $score[$c2->getId()] - $score[$c1->getId()];
    });
    $order = array_keys($constructors);
    Globals::setTurnOrder($order);
    $i = 0;
    foreach ($constructors as $cId => $constructor) {
      $constructor->setNo($i++);
    }

    // Notify
    $circuitId = $this->getCircuit()->getId();
    $scores[] = $score;
    Globals::setScores($scores);
    Notifications::endOfRace($scores, $order);

    if (Globals::isChampionship()) {
      $datas = Globals::getChampionshipDatas();
      // End of championship
      if ($datas['index'] + 1 == count($datas['circuits'])) {
        $this->gamestate->jumpToState(ST_PRE_END_OF_GAME);
      }
      // Make sure eveyone can see results before moving to next race
      else {
        $this->gamestate->setAllPlayersMultiactive();
        $this->gamestate->jumpToState(ST_CONFIRM_END_OF_RACE);
      }
    }
    // Normal race => end of game
    else {
      $this->gamestate->jumpToState(ST_PRE_END_OF_GAME);
    }
  }

  public function actConfirmResults(): void
  {
    self::checkAction('actConfirmResults');
    $pId = $this->getCurrentPId();
    $this->gamestate->setPlayerNonMultiactive($pId, 'done');
  }

  public function stProceedToNextRace(): void
  {
    $datas = Globals::getChampionshipDatas();
    $datas['index'] = $datas['index'] + 1;
    Globals::setChampionshipDatas($datas);
    $this->gamestate->jumpToState(ST_SETUP_RACE);
  }

  public function stPreEndOfGame(): void
  {
    if (Players::count() == 1) {
      $player = null;
      $playerScore = null;
      $maxScore = 0;
      foreach (Constructors::getAll() as $cId => $constructor) {
        $maxScore = max($maxScore, $constructor->getScore());
        if (!$constructor->isAI()) {
          $player = Players::get($constructor->getPId());
          $playerScore = $constructor->getScore();
        }
      }

      // If the real player is not #1, set score to 0
      if ($maxScore != $playerScore) {
        $player->setScore(0);
      }
    }

    $this->gamestate->nextState();
  }

  public function actQuitGame(): void
  {
    $pId = (int) $this->getCurrentPId();
    $constructor = Constructors::getOfPlayer($pId);
    if (!$constructor->canLeave()) {
      throw new \BgaVisibleSystemException('You cant leave the game. Should not happen');
    }
    $constructor->setSpeed(-1);
    $constructor->setPaths([]);
    $this->eliminatePlayer($pId);
  }

  ////////////////////////////////////////////////////////////////////
  //    ____                              ____             __ _
  //   / ___| __ _ _ __ __ _  __ _  ___  |  _ \ _ __ __ _ / _| |_
  //  | |  _ / _` | '__/ _` |/ _` |/ _ \ | | | | '__/ _` | |_| __|
  //  | |_| | (_| | | | (_| | (_| |  __/ | |_| | | | (_| |  _| |_
  //   \____|\__,_|_|  \__,_|\__, |\___| |____/|_|  \__,_|_|  \__|
  //                         |___/
  ////////////////////////////////////////////////////////////////////
  public function stPrepareGarageDraft(): void
  {
    Globals::setDeferredRoundsActive(false);

    $round = Globals::getDraftRound();
    $cards = Cards::drawMarket();
    $upgrades = null;

    if (Globals::isChampionship()) {
      $upgrades = [];
      foreach (Constructors::getAll() as $cId => $constructor) {
        foreach ($constructor->getDeck() as $cardId => $card) {
          if (($card['isUpgrade'] ?? false) || ($card['isSponsor'] ?? false)) {
            $upgrades[] = $card;
            Cards::move($cardId, ['inplay', $constructor->getId()]);
          }
        }
      }
    }
    Notifications::newMarket($round, $cards, $upgrades);

    $order = [];
    foreach (Constructors::getAll() as $cId => $constructor) {
      if (!Constructors::get($cId)->isAI()) {
        $order[$constructor->getNo()] = $cId;
      }
    }

    if ($round == 2) {
      ksort($order);
    } else {
      krsort($order);
    }
    $cIds = array_values($order);

    // Snake draft => snake order
    if (Globals::isSnakeDraft()) {
      $cIds = array_merge($cIds, array_reverse($cIds));
    }

    $this->initCustomTurnOrder('draft', $cIds, ST_DRAFT_GARAGE, 'stEndDraftRound');
  }

  public function argsChooseUpgrade(): array
  {
    // TMP : TODO REMOVE
    Globals::setDeferredRoundsActive(false);

    $data = [
      'market' => Cards::getInLocation('market'),
      'round' => Globals::getDraftRound(),
      'nRounds' => Globals::getNDraftRounds(),
    ];

    // TMP WORKAROUND => TODO REMOVE
    if ($data['market']->empty()) {
      $data['market'] = Cards::drawMarket();
    }

    return $data;
  }

  public function actChooseUpgrade(int $cardId): void
  {
    self::checkAction('actChooseUpgrade');
    $args = $this->argsChooseUpgrade();
    if (!array_key_exists($cardId, $args['market']->toAssoc())) {
      throw new \BgaVisibleSystemException('You cant select that update. Should not happen');
    }
    $card = $args['market'][$cardId];

    $constructor = Constructors::getActive();
    $cId = $constructor->getId();
    Cards::move($cardId, "inplay-$cId");
    Notifications::chooseUpgrade($constructor, $card);

    $this->nextPlayerCustomOrder('draft');
  }

  public function stEndDraftRound(): void
  {
    if (Globals::isChampionship()) {
      $turnOrder = Globals::getCustomTurnOrders()['draft'];
      $this->gamestate->jumpToState(ST_GENERIC_NEXT_PLAYER);
      Constructors::changeActive($turnOrder['order'][0]);
      $this->gamestate->jumpToState(ST_DRAFT_GARAGE_SWAP);
      return;
    }

    $round = Globals::getDraftRound();
    $cardIds = Cards::getInLocation('market')->getIds();
    Cards::move($cardIds, 'box');
    Notifications::endDraftRound($round, $cardIds);

    // Another round ??
    $round += 1;
    Globals::setDraftRound($round);
    if ($round <= Globals::getNDraftRounds()) {
      $this->gamestate->jumpToState(ST_PREPARE_GARAGE_DRAFT);
    } else {
      // Snake draft ? => go to discard card state
      if (Globals::isSnakeDraft()) {
        Globals::setSnakeDiscard([]);
        $pIds = Constructors::getAll()->map(fn($constructor) => $constructor->getPId())->toArray();
        $this->gamestate->jumpToState(ST_GENERIC_NEXT_PLAYER);
        $this->gamestate->setPlayersMultiactive($pIds, '', true);
        $this->gamestate->jumpToState(ST_DRAFT_GARAGE_SNAKE_DISCARD);
      }
      // Otherwise, draft is over
      else {
        $this->stFinishDraft();
      }
    }
  }

  public function stFinishDraft(): void
  {
    foreach (Constructors::getAll() as $cId => $constructor) {
      if (!$constructor->isAI()) {
        Cards::move($constructor->getPlayedCards()->getIds(), "deck-$cId");
      }
    }

    Notifications::reformingDeckWithUpgrades();
    if (Globals::isChampionship()) {
      $this->gamestate->jumpToState(ST_DRAW_SPONSORS);
    } else {
      $this->gamestate->jumpToState(ST_START_RACE);
    }
  }

  // CHAMPIONSHIP : swap
  public function argsSwapUpgrade(): array
  {
    // TMP : TODO REMOVE
    Globals::setDeferredRoundsActive(false);

    $constructor = Constructors::getActive();
    return [
      'market' => Cards::getInLocation('market'),
      'owned' => $constructor->getPlayedCards()->filter(fn($card) => $card['effect'] != SPONSOR),
    ];
  }

  public function actSwapUpgrade(int $marketCardId, int $ownedCardId): void
  {
    $cardId1 = $marketCardId;
    $cardId2 = $ownedCardId;
    self::checkAction('actSwapUpgrade');
    $args = $this->argsSwapUpgrade();
    if (!array_key_exists($cardId1, $args['market']->toAssoc())) {
      throw new \BgaVisibleSystemException('You cant select that update. Not in market. Should not happen');
    }
    if (!in_array($cardId2, $args['owned']->getIds())) {
      throw new \BgaVisibleSystemException('You cant select that update. Not owned. Should not happen');
    }
    $constructor = Constructors::getActive();
    $cId = $constructor->getId();
    Cards::move($cardId1, "inPlay-$cId");
    Cards::move($cardId2, 'market');
    $card1 = Cards::get($cardId1);
    $card2 = Cards::get($cardId2);
    Notifications::swapUpgrade($constructor, $card1, $card2);

    $this->stFinishChampionshipDraft();
  }

  public function actPassSwapUpgrade(): void
  {
    self::checkAction('actPassSwapUpgrade');
    $this->stFinishChampionshipDraft();
  }

  public function stFinishChampionshipDraft(): void
  {
    // Clear market
    $cardIds = Cards::getInLocation('market')->getIds();
    Cards::move($cardIds, 'box');
    Notifications::endDraftRound(1, $cardIds);
    $this->stFinishDraft();
  }

  // CHAMPIONSHIP : draw sponsors
  public function stDrawSponsors(): void
  {
    Cards::shuffle('sponsors');
    $event = Globals::getCurrentEvent();
    $allEvents = Globals::getPossibleEvents();
    $n = $allEvents[$event]['sponsors'];
    if ($n > 0) {
      foreach (Constructors::getAll() as $cId => $constructor) {
        if ($constructor->isAI()) {
          continue;
        }

        $cards = Cards::pickForLocation($n, 'sponsors', "hand-$cId");
        Notifications::draw($constructor, $cards, true);
      }
    }

    $this->gamestate->jumpToState(ST_START_RACE);
  }


  // SNAKE DRAFT DISCARD
  public function argsSnakeDiscard(): array
  {
    $discards = Globals::getSnakeDiscard();
    $args = ['_private' => []];
    foreach (Constructors::getAll() as $constructor) {
      if ($constructor->isAI()) {
        continue;
      }

      $pId = $constructor->getPId();
      $args['_private'][$pId] = [
        'cards' => $constructor->getPlayedCards()->getIds(),
        'choice' => $discards[$pId] ?? null,
      ];
    }

    return $args;
  }

  public function actSnakeDiscard(int $cardId): void
  {
    self::checkAction('actSnakeDiscard');
    $player = Players::getCurrent();
    $args = $this->argsSnakeDiscard()['_private'][$player->getId()];
    if (!in_array($cardId, $args['cards'])) {
      throw new UserException(clienttranslate('You can\'t select that card.'));
    }

    $discard = Globals::getSnakeDiscard();
    $discard[$player->getId()] = $cardId;
    Globals::setSnakeDiscard($discard);
    Notifications::updateSnakeDiscard($player, $this->argsSnakeDiscard());

    $this->updateActivePlayersSnakeDiscard();
  }

  #[CheckAction(false)]
  public function actCancelSnakeDiscard(): void
  {
    $this->gamestate->checkPossibleAction('actCancelSnakeDiscard');

    $player = Players::getCurrent();
    $discard = Globals::getSnakeDiscard();
    unset($discard[$player->getId()]);
    Globals::setSnakeDiscard($discard);
    Notifications::updateSnakeDiscard($player, $this->argsSnakeDiscard());

    $this->updateActivePlayersSnakeDiscard();
  }

  public function updateActivePlayersSnakeDiscard(): void
  {
    // Compute players that still need to select their card
    // => use that instead of BGA framework feature because in some rare case a player
    //    might become inactive eventhough the selection failed (seen in Agricola and Rauha at least already)
    $discard = Globals::getSnakeDiscard();
    $skipped = Globals::getSkippedPlayers();
    $ids = [];
    foreach (Constructors::getAll() as $constructor) {
      if ($constructor->isAI() || in_array($constructor->getPId(), $skipped)) {
        continue;
      }
      $ids[] = $constructor->getPId();
    }
    $ids = array_diff($ids, array_keys($discard));

    // At least one player need to make a choice
    if (!empty($ids)) {
      $this->gamestate->setPlayersMultiactive($ids, 'done', true);
    }
    // Everyone is done => discard cards and proceed
    else {
      $this->stEndOfSnakeDraft();
    }
  }

  public function stEndOfSnakeDraft(): void
  {
    $discard = Globals::getSnakeDiscard();
    foreach ($discard as $pId => $cardId) {
      $constructor = Constructors::getOfPlayer($pId);
      Cards::move($cardId, 'box');
      $card = Cards::get($cardId);
      Notifications::snakeDiscard($constructor, $card);
    }

    $this->stFinishDraft();
  }
}
