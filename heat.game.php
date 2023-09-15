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

$swdNamespaceAutoload = function ($class) {
  $classParts = explode('\\', $class);
  if ($classParts[0] == 'HEAT') {
    array_shift($classParts);
    $file = dirname(__FILE__) . '/modules/php/' . implode(DIRECTORY_SEPARATOR, $classParts) . '.php';
    if (file_exists($file)) {
      require_once $file;
    } else {
      var_dump('Cannot find file : ' . $file);
    }
  }
};
spl_autoload_register($swdNamespaceAutoload, true, true);

require_once APP_GAMEMODULE_PATH . 'module/table/table.game.php';

use HEAT\Managers\Cards;
use HEAT\Managers\Players;
use HEAT\Managers\Constructors;
use HEAT\Managers\LegendCards;
use HEAT\Helpers\Log;
use HEAT\Core\Globals;
use HEAT\Core\Preferences;
use HEAT\Core\Stats;

class Heat extends Table
{
  use HEAT\DebugTrait;
  use HEAT\States\SetupTrait;
  use HEAT\States\RaceTrait;
  use HEAT\States\RoundTrait;
  use HEAT\States\LegendTrait;

  public static $instance = null;
  function __construct()
  {
    parent::__construct();
    self::$instance = $this;
    self::initGameStateLabels([
      'logging' => 10,
    ]);
    Stats::checkExistence();
  }

  public static function get()
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
  public function getAllDatas()
  {
    $pId = self::getCurrentPId();
    return [
      'prefs' => Preferences::getUiData($pId),
      'players' => Players::getUiData($pId),
      'constructors' => Constructors::getUiData($pId),
      // 'cards' => Cards::getUiData(),
      'circuit' => Globals::getCircuit(),
      'circuitDatas' => $this->getCircuit()->getUiData(),
      'nbrLaps' => $this->getNbrLaps(),
      'weather' => Globals::getWeather(),

      'isLegend' => Globals::isLegend(),
      'legendCard' => LegendCards::getCurrentCard(),
      'championship' => Globals::isChampionship() ? Globals::getChampionshipDatas() : null,

      'scores' => Globals::getScores(),
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
      $raceNumber = count($datas['circuits']);
    } else {
      $raceIndex = 0;
      $raceNumber = 1;
    }

    $totalProgress = ($raceIndex * 100) / $raceNumber;
    $inRaceProgresses = Constructors::getAll()
      ->map(function ($constructor) {
        return $constructor->getRaceProgress();
      })
      ->toArray();
    $inRaceProgress = array_sum($inRaceProgresses) / count($inRaceProgresses);

    return 100 * ($totalProgress + $inRaceProgress / $raceNumber);
  }

  function actChangePreference($pref, $value)
  {
    Preferences::set($this->getCurrentPId(), $pref, $value);
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
      throw new BgaVisibleSystemException('Asking for the next player of a custom turn order not initialized : ' . $key);
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
      throw new BgaVisibleSystemException('Asking for ending a custom turn order not initialized : ' . $key);
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
      throw new BgaVisibleSystemException('Failing to jumpToOrCall  : ' . $mixed);
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
  public function zombieTurn($state, $activePlayer)
  {
    $pId = (int) $activePlayer;
    $skipped = Globals::getSkippedPlayers();
    if (!in_array($pId, $skipped)) {
      $skipped[] = $pId;
      Globals::setSkippedPlayers($skipped);
      $constructor = Constructors::getOfPlayer($pId);
      $constructor->eliminate();
    }

    $stateName = $state['name'];
    if ($state['type'] == 'activeplayer') {
      if (in_array($state['name'], ['chooseSpeed', 'react', 'salvage', 'slipstream', 'discard'])) {
        $this->nextPlayerCustomOrder('reveal');
      } elseif ($state['name'] == 'chooseUpgrade') {
        $this->nextPlayerCustomOrder('draft');
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
    // if ($from_version <= 2107011810) {
    //   $sql = 'ALTER TABLE `DBPREFIX_player` ADD `new_score` INT(10) NOT NULL DEFAULT 0';
    //   self::applyDbUpgradeToAllDB($sql);
    // }
  }

  /////////////////////////////////////////////////////////////
  // Exposing protected methods, please use at your own risk //
  /////////////////////////////////////////////////////////////

  // Exposing protected method getCurrentPlayerId
  public static function getCurrentPId()
  {
    return self::getCurrentPlayerId();
  }

  // Exposing protected method translation
  public static function translate($text)
  {
    return self::_($text);
  }
}
