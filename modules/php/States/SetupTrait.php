<?php
namespace HEAT\States;
use HEAT\Core\Globals;
use HEAT\Core\Notifications;
use HEAT\Core\Engine;
use HEAT\Core\Stats;
use HEAT\Core\Preferences;
use HEAT\Managers\Players;
use HEAT\Managers\Cards;
use HEAT\Managers\LegendCards;
use HEAT\Managers\Constructors;
use HEAT\Managers\Actions;
use HEAT\Helpers\Utils;
use HEAT\Helpers\Log;

trait SetupTrait
{
  /*
   * setupNewGame:
   */
  protected function setupNewGame($players, $options = [])
  {
    // First game : USA with 1 lap
    if ($options[\HEAT\OPTION_SETUP] == \HEAT\OPTION_SETUP_FIRST_GAME) {
      $options[\HEAT\OPTION_CIRCUIT] = \HEAT\OPTION_CIRCUIT_USA;
      $options[\HEAT\OPTION_NBR_LAPS] = 1;
      $options[\HEAT\OPTION_GARAGE_MODULE] = \HEAT\OPTION_DISABLED;
      $options[\HEAT\OPTION_WEATHER_MODULE] = \HEAT\OPTION_DISABLED;
    }
    // Beginner: default number of laps + no garage + no weather
    elseif ($options[\HEAT\OPTION_SETUP] == \HEAT\OPTION_SETUP_BEGINNER) {
      $options[\HEAT\OPTION_NBR_LAPS] = 0;
      $options[\HEAT\OPTION_GARAGE_MODULE] = \HEAT\OPTION_DISABLED;
      $options[\HEAT\OPTION_WEATHER_MODULE] = \HEAT\OPTION_DISABLED;
    }
    // Championship
    elseif ($options[\HEAT\OPTION_SETUP] == \HEAT\OPTION_SETUP_CHAMPIONSHIP) {
      if ($this->getBgaEnvironment() != 'studio') {
        throw new \BgaVisibleSystemException('WIP. Not available on prod');
      }

      $options[\HEAT\OPTION_NBR_LAPS] = 0;
      if (($options[\HEAT\OPTION_GARAGE_MODULE] ?? \HEAT\OPTION_DISABLED) == \HEAT\OPTION_DISABLED) {
        $options[\HEAT\OPTION_GARAGE_MODULE] = \HEAT\OPTION_GARAGE_MIXED;
      }
      $options[\HEAT\OPTION_GARAGE_CHOICE] = \HEAT\OPTION_GARAGE_DRAFT;
      $options[\HEAT\OPTION_WEATHER_MODULE] = \HEAT\OPTION_WEATHER_ENABLED;
    }

    Globals::setupNewGame($players, $options);
    Players::setupNewGame($players, $options);
    // Preferences::setupNewGame($players, $this->player_preferences);

    // Setup constructors
    $gameInfos = self::getGameinfos();
    $colors = $gameInfos['player_colors'];
    $nos = [];
    for ($i = 0; $i < Constructors::count(); $i++) {
      $nos[] = $i;
    }
    shuffle($nos);

    $i = 1;
    $constructors = [];
    foreach (Players::getAll() as $pId => $player) {
      $no = array_shift($nos);
      $cId = array_search($player->getColor(), $colors);
      $constructors[$no] = $cId;
      Constructors::assignConstructor($player, $cId, $no);
      $i++;
    }
    $this->reloadPlayersBasicInfos();

    // Handle Legends
    $nAutoma = 0;
    for (; $i <= Constructors::count(); $i++) {
      $no = array_shift($nos);
      $cId = min(array_diff(CONSTRUCTORS, $constructors));
      $constructors[$no] = $cId;
      $fakePId = ($nAutoma + 1) * -5;
      Constructors::assignConstructorAutoma($fakePId, $cId, $no);
      $nAutoma++;
    }

    Globals::setTurnOrder($constructors);
    Cards::setupNewGame($options);
    LegendCards::setupNewGame();

    $this->setGameStateInitialValue('logging', true);
    $this->activeNextPlayer();
  }

  public function stSetupBranch()
  {
    if (Globals::getCircuit() == 'custom') {
      if ($this->getBgaEnvironment() != 'studio') {
        throw new \BgaVisibleSystemException('WIP. Not available on prod');
      }
      $this->gamestate->setAllPlayersMultiactive();
      $this->gamestate->nextState('custom');
    } else {
      $this->gamestate->nextState('done');
    }
  }

  public function actUploadCircuit($circuit)
  {
    var_dump($circuit);
    die('WELL RECEIVED, THANK YOU!');
  }
}
