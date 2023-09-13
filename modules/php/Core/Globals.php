<?php
namespace HEAT\Core;

use HEAT\Core\Game;
use HEAT\Helpers\Utils;

/*
 * Globals
 */
class Globals extends \HEAT\Helpers\DB_Manager
{
  protected static $initialized = false;
  protected static $variables = [
    'engine' => 'obj', // DO NOT MODIFY, USED IN ENGINE MODULE
    'engineChoices' => 'int', // DO NOT MODIFY, USED IN ENGINE MODULE
    'callbackEngineResolved' => 'obj', // DO NOT MODIFY, USED IN ENGINE MODULE
    'anytimeRecursion' => 'int', // DO NOT MODIFY, USED IN ENGINE MODULE
    'customTurnOrders' => 'obj', // DO NOT MODIFY, USED FOR CUSTOM TURN ORDER FEATURE

    'turnOrder' => 'obj', // store the current turn order
    'activeConstructor' => 'int', // store the id of active company
    'finishedConstructors' => 'obj', // how many cards are finished

    'planification' => 'obj',
    'previousPosition' => 'int',
    'positionBeforeSlipstream' => 'int',
    'turnBeforeSlipstream' => 'int',
    'previousTurn' => 'int',
    'symbols' => 'obj',
    'scores' => 'obj',
    'flippedCards' => 'int',
    'salvage' => 'int',
    'refreshedCards' => 'obj',

    'legend' => 'bool',
    'legendCards' => 'obj',
    'legendCard' => 'int',
    'legendCardDrawn' => 'bool',

    // Game options
    'circuit' => 'str',
    'circuitDatas' => 'obj',
    'countConstructors' => 'int', // Useful when companies DB is not filled up yet
    'nbrLaps' => 'int',
    'garageModuleMode' => 'int',
    'draftRound' => 'int',
    'weatherModule' => 'bool',
    'weather' => 'obj',

    'championship' => 'bool',
    'championshipDatas' => 'obj',
  ];

  protected static $table = 'global_variables';
  protected static $primary = 'name';
  protected static function cast($row)
  {
    $val = json_decode(\stripslashes($row['value']), true);
    return self::$variables[$row['name']] == 'int' ? ((int) $val) : $val;
  }

  /*
   * Fetch all existings variables from DB
   */
  protected static $data = [];
  public static function fetch()
  {
    // Turn of LOG to avoid infinite loop (Globals::isLogging() calling itself for fetching)
    $tmp = self::$log;
    self::$log = false;

    foreach (
      self::DB()
        ->select(['value', 'name'])
        ->get(false)
      as $name => $variable
    ) {
      if (\array_key_exists($name, self::$variables)) {
        self::$data[$name] = $variable;
      }
    }
    self::$initialized = true;
    self::$log = $tmp;
  }

  /*
   * Create and store a global variable declared in this file but not present in DB yet
   *  (only happens when adding globals while a game is running)
   */
  public static function create($name)
  {
    if (!\array_key_exists($name, self::$variables)) {
      return;
    }

    $default = [
      'int' => 0,
      'obj' => [],
      'bool' => false,
      'str' => '',
    ];
    $val = $default[self::$variables[$name]];
    self::DB()->insert(
      [
        'name' => $name,
        'value' => \json_encode($val),
      ],
      true
    );
    self::$data[$name] = $val;
  }

  public static function isBreak()
  {
    return !is_null(self::getBreakPlayer()) && self::getBreakPlayer() != -1;
  }

  /*
   * Magic method that intercept not defined static method and do the appropriate stuff
   */
  public static function __callStatic($method, $args)
  {
    if (!self::$initialized) {
      self::fetch();
    }

    if (preg_match('/^([gs]et|inc|is)([A-Z])(.*)$/', $method, $match)) {
      // Sanity check : does the name correspond to a declared variable ?
      $name = mb_strtolower($match[2]) . $match[3];
      if (!\array_key_exists($name, self::$variables)) {
        throw new \InvalidArgumentException("Property {$name} doesn't exist");
      }

      // Create in DB if don't exist yet
      if (!\array_key_exists($name, self::$data)) {
        self::create($name);
      }

      if ($match[1] == 'get') {
        // Basic getters
        return self::$data[$name];
      } elseif ($match[1] == 'is') {
        // Boolean getter
        if (self::$variables[$name] != 'bool') {
          throw new \InvalidArgumentException("Property {$name} is not of type bool");
        }
        return (bool) self::$data[$name];
      } elseif ($match[1] == 'set') {
        // Setters in DB and update cache
        $value = $args[0];
        if (self::$variables[$name] == 'int') {
          $value = (int) $value;
        }
        if (self::$variables[$name] == 'bool') {
          $value = (bool) $value;
        }

        self::$data[$name] = $value;
        self::DB()->update(['value' => \addslashes(\json_encode($value))], $name);
        return $value;
      } elseif ($match[1] == 'inc') {
        if (self::$variables[$name] != 'int') {
          throw new \InvalidArgumentException("Trying to increase {$name} which is not an int");
        }

        $getter = 'get' . $match[2] . $match[3];
        $setter = 'set' . $match[2] . $match[3];
        return self::$setter(self::$getter() + (empty($args) ? 1 : $args[0]));
      }
    }
    throw new \feException(print_r(debug_print_backtrace()));
    return undefined;
  }

  /*
   * Setup new game
   */
  public static function setupNewGame($players, $options)
  {
    $nLegends = $options[\HEAT\OPTION_LEGEND] ?? 0;
    self::setCountConstructors(count($players) + $nLegends);
    self::setLegend($nLegends > 0);
    self::setNbrLaps($options[\HEAT\OPTION_NBR_LAPS] ?? 0);
    self::setGarageModuleMode($options[\HEAT\OPTION_GARAGE_CHOICE] ?? \HEAT\OPTION_GARAGE_RANDOM);
    self::setWeatherModule(($options[\HEAT\OPTION_WEATHER_MODULE] ?? \HEAT\OPTION_DISABLED) == \HEAT\OPTION_WEATHER_ENABLED);

    self::setChampionship($options[\HEAT\OPTION_SETUP] == \HEAT\OPTION_SETUP_CHAMPIONSHIP);
    if (self::isChampionship()) {
      $championship = $options[\HEAT\OPTION_CHAMPIONSHIP];
      // Pre set seasons
      if ($championship != \HEAT\OPTION_CHAMPIONSHIP_CUSTOM) {
        $datas = CHAMPIONSHIP_SEASONS[$championship];
        $datas['index'] = 0;
        self::setChampionshipDatas($datas);
      }
      // Random championship
      else {
        $datas = ['name' => 'custom', 'circuits' => [], 'index' => 0];
        $circuits = ['usa', 'italia', 'gb', 'france'];
        $events = array_keys(EVENTS);
        shuffle($circuits);
        shuffle($events);
        foreach ($circuits as $i => $circuit) {
          $datas['circuits'][] = [
            'circuit' => $circuit,
            'event' => $events[$i],
          ];
        }
        self::setChampionshipDatas($datas);
      }
    }
    // Single circuit
    else {
      $circuits = [
        \HEAT\OPTION_CIRCUIT_USA => 'usa',
        \HEAT\OPTION_CIRCUIT_ITALIA => 'italia',
        \HEAT\OPTION_CIRCUIT_GB => 'gb',
        \HEAT\OPTION_CIRCUIT_FRANCE => 'france',

        \HEAT\OPTION_CIRCUIT_CUSTOM => 'custom',
      ];
      $circuit = $circuits[$options[\HEAT\OPTION_CIRCUIT]];
      self::setCircuit($circuit);
      if ($circuit != 'custom') {
        self::loadCircuitDatas();
      }
    }
  }

  public static function getWeatherCard()
  {
    $weather = Globals::getWeather();
    if (!empty($weather)) {
      return $weather['card'];
    } else {
      return null;
    }
  }

  public static function loadCircuitDatas()
  {
    $names = [
      'usa' => 'USA',
      'italia' => 'Italia',
      'gb' => 'GB',
      'france' => 'France',
    ];
    $fileName = __DIR__ . '/../Circuits/' . $names[Globals::getCircuit()] . '.php';
    include_once $fileName;
    Globals::setCircuitDatas($circuitDatas);
  }

  public static function getNDraftRounds()
  {
    return self::isChampionship() ? 1 : 3;
  }

  public static function getCurrentRace()
  {
    if (!Globals::isChampionship()) {
      return null;
    }
    $datas = Globals::getChampionshipDatas();
    $race = $datas['circuits'][$datas['index']];
    return $race;
  }

  public static function getCurrentEvent()
  {
    if (!Globals::isChampionship()) {
      return null;
    }
    $race = Globals::getCurrentRace();
    return $race['event'];
  }
}
