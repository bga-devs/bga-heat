<?php

/**
 *------
 * BGA framework: © Gregory Isabelli <gisabelli@boardgamearena.com> & Emmanuel Colin <ecolin@boardgamearena.com>
 * Heat implementation : © Timothée Pecatte <tim.pecatte@gmail.com>, Guy Baudin <guy.thoun@gmail.com>
 *
 * This code has been produced on the BGA studio platform for use on http://boardgamearena.com.
 * See http://en.boardgamearena.com/#!doc/Studio for more information.
 * -----
 *
 * federation.game.php
 *
 * This is the main file for your game logic.
 *
 * In this PHP file, you are going to defines the rules of the game.
 *
 */

declare(strict_types=1);

namespace Bga\Games\Heat;

require_once APP_GAMEMODULE_PATH . 'module/table/table.game.php';

use Bga\GameFramework\Table;
use Bga\Games\Heat\Managers\Players;
use Bga\Games\Heat\Managers\Constructors;
use Bga\Games\Heat\Managers\LegendCards;
use Bga\Games\Heat\Core\Globals;
use Bga\Games\Heat\Core\Notifications;
use Bga\Games\Heat\Core\Preferences;
use Bga\Games\Heat\Core\Stats;
use Bga\Games\Heat\Helpers\Log;
use Bga\Games\Heat\States\DeferredRoundTrait;
use Bga\Games\Heat\States\LegendTrait;
use Bga\Games\Heat\States\OldReactTrait;
use Bga\Games\Heat\States\RaceTrait;
use Bga\Games\Heat\States\ReactTrait;
use Bga\Games\Heat\States\RoundTrait;
use Bga\Games\Heat\States\SetupTrait;

class Game extends Table
{
  use DebugTrait;
  use SetupTrait;
  use RaceTrait;
  use RoundTrait;
  use OldReactTrait;
  use ReactTrait;
  use LegendTrait;
  use DeferredRoundTrait;

  public static ?Game $instance = null;
  function __construct()
  {
    parent::__construct();
    self::$instance = $this;
    self::initGameStateLabels([
      'logging' => 10,
    ]);
    Stats::checkExistence();
    Globals::fetch();

    // EXPERIMENTAL to avoid deadlocks. This locks the global table early in the game constructor.
    $this->bSelectGlobalsForUpdate = true;
  }

  public static function get(): ?Game
  {
    return self::$instance;
  }

  protected function getGameName()
  {
    return 'heat';
  }

  /*
   * getAllDatas:
   */
  public function getAllDatas(): array
  {
    $pId = self::getCurrentPId();
    return [
      'prefs' => Preferences::getUiData($pId),
      'players' => Players::getUiData($pId),
      'constructors' => Constructors::getUiData($pId),
      'circuit' => Globals::getCircuit(),
      'circuitDatas' => $this->getCircuit()->getUiData(),
      'nbrLaps' => $this->getNbrLaps(),
      'weather' => Globals::getWeather(),
      'progress' => $this->getRaceProgress(),

      'isLegend' => Globals::isLegend(),
      'legendCard' => LegendCards::getCurrentCard(),
      'championship' => Globals::isChampionship() ? Globals::getChampionshipDatas() : null,

      'scores' => Globals::getScores(),

      'isDeferredRounds' => Globals::isDeferredRounds(),
      'isDeferred' => $this->shouldUsedDeferredDB(),
    ];
  }

  /*
   * getGameProgression:
   */
  function getGameProgression()
  {
    if (Globals::isChampionship()) {
      $datas = Globals::getChampionshipDatas();
      $raceIndex = $datas['index'];
      $raceNumber = max(1, count($datas['circuits']));
    } else {
      $raceIndex = 0;
      $raceNumber = 1;
    }

    $totalProgress = $raceIndex / $raceNumber;
    $inRaceProgress = $this->getRaceProgress();
    return 100 * ($totalProgress + $inRaceProgress / $raceNumber);
  }

  function getRaceProgress()
  {
    $inRaceProgresses = Constructors::getAll()
      ->map(function ($constructor) {
        return $constructor->getRaceProgress();
      })
      ->toArray();
    $inRaceProgress = array_sum($inRaceProgresses) / count($inRaceProgresses);
    return $inRaceProgress;
  }

  function actChangePreference($pref, $value)
  {
    Preferences::set($this->getCurrentPId(), $pref, $value);
  }

  function addNewUndoableStep()
  {
    $stepId = Log::step();
    Notifications::newUndoableStep(Players::getCurrent(), $stepId);
  }

  ///////////////////////////////////////////////
  ///////////////////////////////////////////////
  ////////////   Custom Turn Order   ////////////
  ///////////////////////////////////////////////
  ///////////////////////////////////////////////
  public function initCustomTurnOrder($key, $order, $callback, $endCallback, $loop = false, $autoNext = true, $args = [])
  {
    $turnOrders = Globals::getCustomTurnOrders();
    $turnOrders[$key] = [
      'order' => $order ?? Constructors::getTurnOrder(),
      'index' => -1,
      'callback' => $callback,
      'args' => $args, // Useful mostly for auto card listeners
      'endCallback' => $endCallback,
      'loop' => $loop,
    ];
    Globals::setCustomTurnOrders($turnOrders);

    if ($autoNext) {
      $this->nextPlayerCustomOrder($key);
    }
  }

  public function initCustomDefaultTurnOrder($key, $callback, $endCallback, $loop = false, $autoNext = true)
  {
    $this->initCustomTurnOrder($key, null, $callback, $endCallback, $loop, $autoNext);
  }

  public function nextPlayerCustomOrder($key)
  {
    $turnOrders = Globals::getCustomTurnOrders();
    if (!isset($turnOrders[$key])) {
      throw new \BgaVisibleSystemException('Asking for the next player of a custom turn order not initialized : ' . $key);
    }

    // Increase index and save
    $o = $turnOrders[$key];
    $i = $o['index'] + 1;
    if ($i == count($o['order']) && $o['loop']) {
      $i = 0;
    }
    $turnOrders[$key]['index'] = $i;
    Globals::setCustomTurnOrders($turnOrders);

    if ($i < count($o['order'])) {
      $this->gamestate->jumpToState(ST_GENERIC_NEXT_PLAYER);
      $cId = $o['order'][$i];
      $skippedPlayers = Globals::getSkippedPlayers();
      $constructor = Constructors::get($cId);
      if (!$constructor->isAI() && in_array($constructor->getPId(), $skippedPlayers)) {
        $this->nextPlayerCustomOrder($key);
      } else {
        Constructors::changeActive($cId);
        $this->jumpToOrCall($o['callback'], $o['args']);
      }
    } else {
      $this->endCustomOrder($key);
    }
  }

  public function endCustomOrder($key)
  {
    $turnOrders = Globals::getCustomTurnOrders();
    if (!isset($turnOrders[$key])) {
      throw new \BgaVisibleSystemException('Asking for ending a custom turn order not initialized : ' . $key);
    }

    $o = $turnOrders[$key];
    $turnOrders[$key]['index'] = count($o['order']);
    Globals::setCustomTurnOrders($turnOrders);
    $callback = $o['endCallback'];
    $this->jumpToOrCall($callback);
  }

  public function jumpToOrCall($mixed, $args = [])
  {
    if (is_int($mixed) && array_key_exists($mixed, $this->gamestate->states)) {
      $this->gamestate->jumpToState($mixed);
    } elseif (method_exists($this, $mixed)) {
      $method = $mixed;
      $this->$method($args);
    } else {
      throw new \BgaVisibleSystemException('Failing to jumpToOrCall  : ' . $mixed);
    }
  }

  ////////////////////////////////////
  ////////////   Zombie   ////////////
  ////////////////////////////////////
  /*
   * zombieTurn:
   *   This method is called each time it is the turn of a player who has quit the game (= "zombie" player).
   *   You can do whatever you want in order to make sure the turn of this player ends appropriately
   */
  public function zombieTurn($state, $activePlayer): void
  {
    $pId = (int) $activePlayer;
    $skipped = Globals::getSkippedPlayers();
    if (!in_array($pId, $skipped)) {
      $skipped[] = $pId;
      Globals::setSkippedPlayers($skipped);
      $constructor = Constructors::getOfPlayer($pId);
      $constructor->eliminate();
    }

    if ($state['type'] == 'activeplayer') {
      if (in_array($state['name'], ['chooseSpeed', 'react', 'salvage', 'slipstream', 'discard'])) {
        $this->nextPlayerCustomOrder('reveal');
      } elseif ($state['name'] == 'chooseUpgrade') {
        /*
        if we want the zombie players to take a random card
        
        $args = $this->argsChooseUpgrade();
        $cardsIds = array_keys((array)$args['market']);
        $cardId = $cardsIds[bga_rand(0, count($cardsIds) - 1)];
        $card = $args['market'][$cardId];
    
        $constructor = Constructors::getActive();
        $cId = $constructor->getId();
        Cards::move($cardId, "inplay-${cId}");
        Notifications::chooseUpgrade($constructor, $card);*/

        $this->nextPlayerCustomOrder('draft');
      } elseif ($state['name'] == 'swapUpgrade') {
        $this->stFinishChampionshipDraft();
      } else {
        $this->gamestate->nextState('zombiePass');
      }
    } elseif ($state['type'] == 'multipleactiveplayer') {
      if ($state['name'] == 'planification') {
        $this->updateActivePlayersInitialSelection();
      } else {
        // Make sure player is in a non blocking status for role turn
        $this->gamestate->setPlayerNonMultiactive($pId, 'zombiePass');
      }
    }
  }

  /////////////////////////////////////
  //////////   DB upgrade   ///////////
  /////////////////////////////////////
  // You don't have to care about this until your game has been published on BGA.
  // Once your game is on BGA, this method is called everytime the system detects a game running with your old Database scheme.
  // In this case, if you change your Database scheme, you just have to apply the needed changes in order to
  //   update the game database and allow the game to continue to run with your new version.
  /////////////////////////////////////
  /*
   * upgradeTableDb
   *  - int $from_version : current version of this game database, in numerical form.
   *      For example, if the game was running with a release of your game named "140430-1345", $from_version is equal to 1404301345
   */
  public function upgradeTableDb($from_version)
  {
    if ($from_version <= 2309242157) {
      $sql = 'ALTER TABLE `DBPREFIX_constructors` ADD `paths` JSON';
      self::applyDbUpgradeToAllDB($sql);
    }
  }

  /////////////////////////////////////////////////////////////
  // Exposing protected methods, please use at your own risk //
  /////////////////////////////////////////////////////////////

  // Exposing protected method getCurrentPlayerId
  public function getCurrentPId()
  {
    return $this->getCurrentPlayerId();
  }

  // Exposing protected method translation
  public function translate($text)
  {
    return $this->_($text);
  }
}
