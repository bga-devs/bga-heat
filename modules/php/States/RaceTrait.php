<?php
namespace HEAT\States;
use HEAT\Core\Globals;
use HEAT\Core\Notifications;
use HEAT\Core\Stats;
use HEAT\Helpers\Log;
use HEAT\Helpers\Utils;
use HEAT\Managers\Constructors;
use HEAT\Managers\Players;
use HEAT\Managers\Cards;

trait RaceTrait
{
  function stSetupRace()
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

      // Turn order
      if ($datas['index'] > 0) {
        // TODO
        die('TODO: turn order for championship not first race');
      }

      Notifications::newChampionshipRace($datas, $this->getCircuit()->getName());
    }

    // Place cars on starting positions
    $circuit = $this->getCircuit();
    $cells = $circuit->getStartingCells();
    foreach (Constructors::getTurnOrder() as $i => $cId) {
      $constructor = Constructors::get($cId);
      $constructor->setCarCell($cells[$i]);
      $constructor->setTurn(-1);
      $constructor->setGear(1);
      $constructor->setSpeed(null);
    }

    // Weather
    if (Globals::isWeatherModule()) {
      // Draw a card
      $weatherCard = bga_rand(0, 5);
      // Draw tokens
      $tokens = [0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 5, 5];
      shuffle($tokens);
      $cornerTokens = [];
      foreach ($this->getCircuit()->getCorners() as $cornerPos => $infos) {
        $cornerTokens[$cornerPos] = array_shift($tokens);
      }
      Globals::setWeather([
        'card' => $weatherCard,
        'tokens' => $cornerTokens,
      ]);
    }

    // Draw heat and stress cards
    Cards::setupRace();

    Globals::setFinishedConstructors([]);
    if (Globals::getGarageModuleMode() == \HEAT\OPTION_GARAGE_DRAFT) {
      Globals::setDraftRound(1);
      $this->gamestate->nextState('draft');
    } else {
      $this->gamestate->nextState('start');
    }
  }

  function stStartRace()
  {
    foreach (Constructors::getAll() as $cId => $constructor) {
      if ($constructor->isAI()) {
        continue;
      }

      $weatherCard = Globals::getWeatherCard();
      // Move 3 heat to deck
      if ($weatherCard == WEATHER_RAIN) {
        $heats = $constructor->getEngine()->limit(3);
        Cards::move($heats->getIds(), "deck-$cId");
        Notifications::weatherHeats($constructor, $heats, clienttranslate('deck'));
      }
      // Move 3 heat to discard
      elseif ($weatherCard == WEATHER_SUN) {
        $heats = $constructor->getEngine()->limit(3);
        Cards::move($heats->getIds(), "discard-$cId");
        Notifications::weatherHeats($constructor, $heats, clienttranslate('discard'));
      }

      Cards::shuffle("deck-$cId");
      Cards::fillHand($constructor);
    }

    $this->gamestate->nextState('startRound');
  }

  function stFinishRace()
  {
    $scores = Globals::getScores();
    $score = [];
    $podium = [9, 6, 4, 3, 2, 1];
    foreach (Constructors::getAll() as $cId => $constructor) {
      $podiumPos = -$constructor->getCarCell() - 1;
      $score[$cId] = $podium[$podiumPos] ?? 0;
      $constructor->incScore($score[$cId]);
    }

    $circuitId = $this->getCircuit()->getId();
    $scores[$circuitId] = $score;
    Globals::setScores($scores);
    Notifications::endOfRace($scores);

    if (false) {
      // TOURNAMENT
    } else {
      $this->gamestate->jumpToState(ST_PRE_END_OF_GAME);
    }
  }

  function stPreEndOfGame()
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

  ///////////////////////////////////
  //   ____ _                _ _
  //  / ___(_)_ __ ___ _   _(_) |_
  // | |   | | '__/ __| | | | | __|
  // | |___| | | | (__| |_| | | |_
  //  \____|_|_|  \___|\__,_|_|\__|
  ///////////////////////////////////

  function getCircuit()
  {
    if (!isset($this->circuit)) {
      $circuitDatas = Globals::getCircuitDatas();
      $this->circuit = new \HEAT\Models\Circuit($circuitDatas);
    }

    return $this->circuit;
  }

  function getNbrLaps()
  {
    $circuit = $this->getCircuit();
    return is_null($circuit) ? 0 : $circuit->getNbrLaps();
  }

  function getHandSizeLimit()
  {
    // TODO : handle events
    return 7;
  }

  ////////////////////////////////////////////////////////////////////
  //    ____                              ____             __ _
  //   / ___| __ _ _ __ __ _  __ _  ___  |  _ \ _ __ __ _ / _| |_
  //  | |  _ / _` | '__/ _` |/ _` |/ _ \ | | | | '__/ _` | |_| __|
  //  | |_| | (_| | | | (_| | (_| |  __/ | |_| | | | (_| |  _| |_
  //   \____|\__,_|_|  \__,_|\__, |\___| |____/|_|  \__,_|_|  \__|
  //                         |___/
  ////////////////////////////////////////////////////////////////////
  function stPrepareGarageDraft()
  {
    $round = Globals::getDraftRound();
    $cards = Cards::drawMarket();
    Notifications::newMarket($round, $cards);

    $turnOrder = Constructors::getTurnOrder();
    Utils::filter($turnOrder, function ($cId) {
      return !Constructors::get($cId)->isAI();
    });

    if ($round != 2) {
      $turnOrder = array_reverse($turnOrder);
    }

    $this->initCustomTurnOrder('draft', $turnOrder, ST_DRAFT_GARAGE, 'stEndDraftRound');
  }

  function argsChooseUpgrade()
  {
    return [
      'market' => Cards::getInLocation('market'),
      'round' => Globals::getDraftRound(),
      'nRounds' => Globals::getNDraftRounds(),
    ];
  }

  function actChooseUpgrade($cardId)
  {
    self::checkAction('actChooseUpgrade');
    $args = $this->argsChooseUpgrade();
    if (!array_key_exists($cardId, $args['market'])) {
      throw new \BgaVisibleSystemException('You cant select that update. Should not happen');
    }
    $card = $args['market'][$cardId];

    $constructor = Constructors::getActive();
    $cId = $constructor->getId();
    Cards::move($cardId, "hand-${cId}");
    Notifications::chooseUpgrade($constructor, $card);

    $this->nextPlayerCustomOrder('draft');
  }

  function stEndDraftRound()
  {
    $round = Globals::getDraftRound();
    $cardIds = Cards::getInLocation('market')->getIds();
    Cards::move($cardIds, 'box');
    Notifications::endDraftRound($round, $cardIds);

    // Another round ??
    $round += 1;
    Globals::setDraftRound($round);
    if ($round <= Globals::getNDraftRounds()) {
      $this->gamestate->nextState('draft');
    } else {
      if (Globals::isChampionship()) {
        die('TODO: let last player choose if he wants to switch or not');
      } else {
        $this->stFinishDraft();
      }
    }
  }

  function stFinishDraft()
  {
    foreach (Constructors::getAll() as $cId => $constructor) {
      if (!$constructor->isAI()) {
        Cards::move($constructor->getHand()->getIds(), "deck-$cId");
      }
    }

    Notifications::reformingDeckWithUpgrades();
    $this->gamestate->nextState('start');
  }
}
