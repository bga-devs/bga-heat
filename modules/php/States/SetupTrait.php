<?php

namespace Bga\Games\Heat\States;

use Bga\Games\Heat\Core\Globals;
use Bga\Games\Heat\Core\Notifications;
use Bga\Games\Heat\Core\Engine;
use Bga\Games\Heat\Core\Stats;
use Bga\Games\Heat\Core\Preferences;
use Bga\Games\Heat\Managers\Players;
use Bga\Games\Heat\Managers\Cards;
use Bga\Games\Heat\Managers\LegendCards;
use Bga\Games\Heat\Managers\Constructors;
use Bga\Games\Heat\Managers\Actions;
use Bga\Games\Heat\Helpers\Utils;
use Bga\Games\Heat\Helpers\Log;
use Bga\Games\Heat\Models\Constructor;

use \Bga\GameFramework\Actions\Types\JsonParam;

trait SetupTrait
{
  /*
   * setupNewGame:
   */
  protected function setupNewGame($players, $options = [])
  {
    // First game : USA with 1 lap
    if ($options[\Bga\Games\Heat\OPTION_SETUP] == \Bga\Games\Heat\OPTION_SETUP_FIRST_GAME) {
      $options[\Bga\Games\Heat\OPTION_CIRCUIT] = \Bga\Games\Heat\OPTION_CIRCUIT_USA;
      $options[\Bga\Games\Heat\OPTION_NBR_LAPS] = 1;
      $options[\Bga\Games\Heat\OPTION_GARAGE_MODULE] = \Bga\Games\Heat\OPTION_DISABLED;
      $options[\Bga\Games\Heat\OPTION_GARAGE_CHOICE] = \Bga\Games\Heat\OPTION_DISABLED;
      $options[\Bga\Games\Heat\OPTION_WEATHER_MODULE] = \Bga\Games\Heat\OPTION_DISABLED;
      $options[\Bga\Games\Heat\OPTION_LEGEND_PRO] = 0;
    }
    // Beginner: default number of laps + no garage + no weather
    elseif ($options[\Bga\Games\Heat\OPTION_SETUP] == \Bga\Games\Heat\OPTION_SETUP_BEGINNER) {
      $options[\Bga\Games\Heat\OPTION_NBR_LAPS] = 0;
      $options[\Bga\Games\Heat\OPTION_GARAGE_MODULE] = \Bga\Games\Heat\OPTION_DISABLED;
      $options[\Bga\Games\Heat\OPTION_GARAGE_CHOICE] = \Bga\Games\Heat\OPTION_DISABLED;
      $options[\Bga\Games\Heat\OPTION_WEATHER_MODULE] = \Bga\Games\Heat\OPTION_DISABLED;
      $options[\Bga\Games\Heat\OPTION_LEGEND_PRO] = 0;
    }
    // Championship
    elseif ($options[\Bga\Games\Heat\OPTION_SETUP] == \Bga\Games\Heat\OPTION_SETUP_CHAMPIONSHIP) {
      $options[\Bga\Games\Heat\OPTION_NBR_LAPS] = 0;
      $options[\Bga\Games\Heat\OPTION_GARAGE_MODULE] = \Bga\Games\Heat\OPTION_GARAGE_MIXED;
      $options[\Bga\Games\Heat\OPTION_GARAGE_MODULE] = $options[\Bga\Games\Heat\OPTION_GARAGE_MODULE_CHAMPIONSHIP];
      $options[\Bga\Games\Heat\OPTION_GARAGE_CHOICE] = \Bga\Games\Heat\OPTION_GARAGE_DRAFT;
      $options[\Bga\Games\Heat\OPTION_WEATHER_MODULE] = \Bga\Games\Heat\OPTION_WEATHER_ENABLED;
    }

    Globals::setupNewGame($players, $options);
    Players::setupNewGame($players, $options);
    Stats::checkExistence();
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
    $players = Players::getAll();
    foreach ($players as $pId => $player) {
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
    ksort($constructors);
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

  function getSpecificColorPairings(): array
  {
    return [
      '000000' /* Black */ => '12151a',
      '0000ff' /* Blue */ => '376bbe',
      '008000' /* Green */ => '26a54e',
      'ff0000' /* Red */ => 'e52927',
      '7b7b7b' /* Gray */ => '979797',
      'ffa500' /* Yellow */ => 'face0d',
      'f07f16' /* Orange */ => 'f37321',
      '982fff' /* Purple */ => '811b8f',
    ];
  }

  //////////////////////////////////////////
  //  _   _       _                 _
  // | | | |_ __ | | ___   __ _  __| |
  // | | | | '_ \| |/ _ \ / _` |/ _` |
  // | |_| | |_) | | (_) | (_| | (_| |
  //  \___/| .__/|_|\___/ \__,_|\__,_|
  //       |_|
  //////////////////////////////////////////

  public function actUploadCircuit(#[JsonParam()] $circuit)
  {
    // Filter datas
    $f = [];

    $fields = [
      'id' => 'ID',
      'name' => 'Name',
      'jpgUrl' => 'JPG',
      'heatCards' => 'Heat Cards',
      'stressCards' => 'Stress Cards',
      'nbrLaps' => 'Number of laps',
      'weatherCardPos' => 'Weather card position',
      'podium' => 'Podium position',
      'startingCells' => 'Starting cells',
      'corners' => 'Corners',
      'cells' => 'Cells',
    ];
    foreach ($fields as $field => $name) {
      if (!isset($circuit[$field])) {
        throw new \BgaVisibleSystemException("No $name field. Invalid circuit file.");
      }
      $f[$field] = $circuit[$field];

      if (in_array($field, ['heatCards', 'stressCards', 'nbrLaps'])) {
        $f[$field] = (int) $f[$field];
      }
    }

    // Weather card pos
    if (!isset($f['weatherCardPos']['x']) || !isset($f['weatherCardPos']['x'])) {
      throw new \BgaVisibleSystemException('Wrong Weather Card position format. Invalid circuit file.');
    }
    $f['weatherCardPos'] = [
      'x' => (int) $f['weatherCardPos']['x'],
      'y' => (int) $f['weatherCardPos']['y'],
    ];

    // Podium
    if (!isset($f['podium']['x']) || !isset($f['podium']['x'])) {
      throw new \BgaVisibleSystemException('Wrong Podium position format. Invalid circuit file.');
    }
    $f['podium'] = [
      'x' => (int) $f['podium']['x'],
      'y' => (int) $f['podium']['y'],
    ];

    // Starting cells
    if (!is_array($f['startingCells']) || count($f['startingCells']) != 8) {
      throw new \BgaVisibleSystemException('Wrong Starting cells format. Invalid circuit file.');
    }
    foreach ($f['startingCells'] as $i => $c) {
      $f['startingCells'][$i] = (int) $c;
    }

    // Corners
    foreach ($f['corners'] as $i => $corner) {
      $g = [];
      foreach (['position', 'speed', 'x', 'y', 'lane', 'legend', 'tentX', 'tentY', 'sectorTentX', 'sectorTentY'] as $field) {
        if (!isset($corner[$field])) {
          throw new \BgaVisibleSystemException("Missing $field in some corner. Invalid circuit file.");
        }
        $g[$field] = (int) $corner[$field];
      }
      $f['corners'][$i] = $g;
    }

    // Cells
    $cells = [];
    foreach ($f['cells'] as $cellId => $cell) {
      $cellId = (int) $cellId;
      $g = [];
      foreach (['position', 'lane', 'x', 'y', 'a'] as $field) {
        if (!isset($cell[$field])) {
          throw new \BgaVisibleSystemException("Missing $field in some corner. Invalid circuit file.");
        }
        $g[$field] = (int) $cell[$field];
      }
      $cells[$cellId] = $g;
    }
    $f['cells'] = $cells;

    Globals::setCircuitDatas($f);
    Notifications::loadCircuit($f);
    $this->circuit = null;
    $this->gamestate->nextState('done');
  }
}
