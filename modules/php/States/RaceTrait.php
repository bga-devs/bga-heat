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
    if ($round <= 3) {
      $this->gamestate->nextState('draft');
    } else {
      foreach (Constructors::getAll() as $cId => $constructor) {
        if (!$constructor->isAI()) {
          Cards::move($constructor->getHand()->getIds(), "deck-$cId");
        }
      }

      Notifications::reformingDeckWithUpgrades();
      $this->gamestate->nextState('start');
    }
  }
}
