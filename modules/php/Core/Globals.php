<?php

namespace Bga\Games\Heat\Core;

use Bga\Games\Heat\Game;
use Bga\Games\Heat\Managers\Constructors;
use Bga\Games\Heat\Managers\Cards;

/*
 * Globals
 */

class Globals extends \Bga\Games\Heat\Helpers\DB_Manager
{
  protected static $initialized = false;
  // Variables that should be stored on both table for deferredRounds feature
  protected static $syncVariables = [
    'round',
    'customTurnOrders',
    'turnOrder',
    'activeConstructor',
    'finishedConstructors',
    'planification',
    'planificationRevealed',
    'pendingNotifications',

    'legendCards',
    'legendCard',
    'legendCardDrawn',
  ];
  protected static $variables = [
    'customTurnOrders' => 'obj', // DO NOT MODIFY, USED FOR CUSTOM TURN ORDER FEATURE

    'turnOrder' => 'obj', // store the current turn order
    'activeConstructor' => 'int', // store the id of active company
    'finishedConstructors' => 'obj', // how many cards are finished

    'round' => 'int',
    'snakeDiscard' => 'obj',
    'planification' => 'obj',
    'planificationRevealed' => 'obj',
    'previousPosition' => 'int',
    'positionBeforeSlipstream' => 'int',
    'turnBeforeSlipstream' => 'int',
    'previousTurn' => 'int',
    'symbols' => 'obj', // Old, kept for legacy
    'cardSymbols' => 'obj',
    'scores' => 'obj',
    'flippedCards' => 'int',
    'salvage' => 'int',
    'superCool' => 'int',
    'refreshedCards' => 'obj',
    'usedBoost' => 'bool',

    'skippedPlayers' => 'obj',
    'giveUpPlayers' => 'obj',

    'legend' => 'bool',
    'legendCards' => 'obj',
    'legendCard' => 'int',
    'legendCardDrawn' => 'bool',
    'legendPro' => 'int',
    'aggressiveLegends' => 'int',

    // Game options
    'circuit' => 'str',
    'circuitDatas' => 'obj',
    'countConstructors' => 'int', // Useful when companies DB is not filled up yet
    'nbrLaps' => 'int',
    'garageModuleMode' => 'int',
    'draftRound' => 'int',
    'weatherModule' => 'bool',
    'weather' => 'obj',
    'heavyRain' => 'bool',
    'tunnelVision' => 'bool',
    'championship' => 'bool',
    'championshipDatas' => 'obj',

    'deferredRounds' => 'bool', // Enhanced TB-mode 
    'deferredRoundsActive' => 'bool',
    'pendingNotifications' => 'obj',
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
  public static function fetch($checkDeferred = true)
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
    if ($checkDeferred) {
      self::checkDeferredIfNeeded();
    }
  }

  private static $recursionPrevention = 0;
  public static function checkDeferredIfNeeded($shouldUseDeferred = null)
  {
    self::$recursionPrevention++;
    if (self::$recursionPrevention > 10) {
      die("Too much recursion in Globals, please report as a bug");
    }

    $shouldUseDeferred = $shouldUseDeferred ?? Game::get()->shouldUsedDeferredDB();
    // Switch to deferred
    if (static::$table == 'global_variables' && $shouldUseDeferred) {
      // Update globals
      static::$table = 'global_variables2';
      self::fetch(false);
      // Update constructors
      Constructors::$table = 'constructors2';
      Constructors::invalidate();
      // Update cards
      Cards::$table = 'cards2';
    }
    // Switch to undeferred
    if (static::$table == 'global_variables2' && !$shouldUseDeferred) {
      // Update globals
      static::$table = 'global_variables';
      self::fetch(false);
      // Update constructors
      Constructors::$table = 'constructors';
      Constructors::invalidate();
      // Update cards
      Cards::$table = 'cards';
    }
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

    // Ensure customTurnOrders are always written into both database
    if (in_array($name, static::$syncVariables)) {
      $otherTable = static::$table == 'global_variables2' ? 'global_variables' : 'global_variables2';
      self::DB($otherTable)->insert(
        [
          'name' => $name,
          'value' => \json_encode($val),
        ],
        true
      );
    }
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

        // Ensure customTurnOrders are always written into both database
        if (in_array($name, static::$syncVariables)) {
          $otherTable = static::$table == 'global_variables2' ? 'global_variables' : 'global_variables2';
          self::DB($otherTable)->update(['value' => \addslashes(\json_encode($value))], $name);
        }

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
    return null;
  }

  /*
   * Setup new game
   */
  public static function setupNewGame($players, $options)
  {
    $legendFill = $options[\Bga\Games\Heat\OPTION_LEGEND] ?? 0;
    $nLegends = $legendFill == 0 ? 0 : max(0, $legendFill - count($players));
    self::setCountConstructors(count($players) + $nLegends);
    self::setLegend($nLegends > 0);
    self::setLegendPro($options[\Bga\Games\Heat\OPTION_LEGEND_PRO] ?? 0);
    self::setAggressiveLegends($options[\Bga\Games\Heat\OPTION_AGGRESSIVE_LEGENDS] ?? 0);
    self::setNbrLaps($options[\Bga\Games\Heat\OPTION_NBR_LAPS] ?? 0);
    self::setGarageModuleMode($options[\Bga\Games\Heat\OPTION_GARAGE_CHOICE] ?? \Bga\Games\Heat\OPTION_GARAGE_RANDOM);
    self::setWeatherModule(($options[\Bga\Games\Heat\OPTION_WEATHER_MODULE] ?? \Bga\Games\Heat\OPTION_DISABLED) == \Bga\Games\Heat\OPTION_WEATHER_ENABLED);
    self::setHeavyRain(($options[\Bga\Games\Heat\OPTION_EXPANSION_HEAVY_RAIN] ?? \Bga\Games\Heat\OPTION_EXPANSION_DISABLED) == \Bga\Games\Heat\OPTION_EXPANSION_ENABLED);
    self::setTunnelVision(($options[\Bga\Games\Heat\OPTION_EXPANSION_TUNNEL_VISION] ?? \Bga\Games\Heat\OPTION_EXPANSION_DISABLED) == \Bga\Games\Heat\OPTION_EXPANSION_ENABLED);
    self::setDeferredRounds(($options[\Bga\Games\Heat\OPTION_TB_MODE] ?? \Bga\Games\Heat\OPTION_TB_STANDARD) == \Bga\Games\Heat\OPTION_TB_ENHANCED);

    self::setChampionship($options[\Bga\Games\Heat\OPTION_SETUP] == \Bga\Games\Heat\OPTION_SETUP_CHAMPIONSHIP);
    if (self::isChampionship()) {
      $championship = $options[\Bga\Games\Heat\OPTION_CHAMPIONSHIP];
      // Pre set seasons
      if (!in_array($championship, [\Bga\Games\Heat\OPTION_CHAMPIONSHIP_CUSTOM, \Bga\Games\Heat\OPTION_CHAMPIONSHIP_RANDOM])) {
        // Fallback for incompatible gameoptions
        if ($championship == \Bga\Games\Heat\OPTION_CHAMPIONSHIP_SEASON_64) Globals::setHeavyRain(true);
        if ($championship == \Bga\Games\Heat\OPTION_CHAMPIONSHIP_SEASON_65) Globals::setTunnelVision(true);

        $datas = CHAMPIONSHIP_SEASONS[$championship];
        $datas['index'] = 0;
        foreach ($datas['circuits'] as &$race) {
          $race['name'] = self::getCircuitName($race['circuit']);
        }
        self::setChampionshipDatas($datas);
      }
      // Random championship
      elseif ($championship == \Bga\Games\Heat\OPTION_CHAMPIONSHIP_RANDOM) {
        $datas = ['name' => clienttranslate('Custom'), 'circuits' => [], 'index' => 0];
        $circuits = array_values(self::getPossibleCircuits());
        $events = array_keys(self::getPossibleEvents());
        shuffle($circuits);
        shuffle($events);
        foreach ($circuits as $i => $circuit) {
          if (count($datas['circuits']) == 4) break;

          $datas['circuits'][] = [
            'name' => self::getCircuitName($circuit),
            'circuit' => $circuit,
            'event' => $events[$i],
          ];
        }
        self::setChampionshipDatas($datas);
      }
    }
    // Single circuit
    else {
      $opt = $options[\Bga\Games\Heat\OPTION_CIRCUIT];
      // Fallback for incompatible gameoptions
      if (in_array($opt, [\Bga\Games\Heat\OPTION_CIRCUIT_JAPAN, \Bga\Games\Heat\OPTION_CIRCUIT_MEXICO])) Globals::setHeavyRain(true);
      if (in_array($opt, [\Bga\Games\Heat\OPTION_CIRCUIT_NEDERLAND, \Bga\Games\Heat\OPTION_CIRCUIT_ESPANA])) Globals::setTunnelVision(true);

      $circuits = self::getPossibleCircuits();
      shuffle($circuits);

      $map = [
        \Bga\Games\Heat\OPTION_CIRCUIT_USA => 'usa',
        \Bga\Games\Heat\OPTION_CIRCUIT_ITALIA => 'italia',
        \Bga\Games\Heat\OPTION_CIRCUIT_GB => 'gb',
        \Bga\Games\Heat\OPTION_CIRCUIT_FRANCE => 'france',
        \Bga\Games\Heat\OPTION_CIRCUIT_JAPAN => 'japan',
        \Bga\Games\Heat\OPTION_CIRCUIT_MEXICO => 'mexico',
        \Bga\Games\Heat\OPTION_CIRCUIT_NEDERLAND => 'nederland',
        \Bga\Games\Heat\OPTION_CIRCUIT_ESPANA => 'espana',

        \Bga\Games\Heat\OPTION_CIRCUIT_RANDOM => $circuits[0],
        \Bga\Games\Heat\OPTION_CIRCUIT_CUSTOM => 'custom',
      ];
      $circuit = $map[$opt];
      self::setCircuit($circuit);
      if ($circuit != 'custom') {
        self::loadCircuitDatas();
      }
    }
  }

  public static function getPossibleCircuits(): array
  {
    $circuits = CIRCUITS;
    if (self::isHeavyRain()) {
      $circuits = array_merge($circuits, CIRCUITS_EXP_HV);
    }
    if (self::isTunnelVision()) {
      $circuits = array_merge($circuits, CIRCUITS_EXP_TV);
    }
    return $circuits;
  }


  public static function getPossibleEvents(): array
  {
    $circuits = EVENTS;
    if (self::isHeavyRain()) {
      $circuits = array_merge($circuits, EVENTS_EXP_HV);
    }
    if (self::isTunnelVision()) {
      $circuits = array_merge($circuits, EVENTS_EXP_TV);
    }
    return $circuits;
  }

  public static function isSnakeDraft()
  {
    return self::getGarageModuleMode() == \Bga\Games\Heat\OPTION_GARAGE_SNAKE_DRAFT;
  }

  public static function getCircuitName($circuitId)
  {
    $map = [
      'usa' => clienttranslate('USA'),
      'gb' => clienttranslate('Great Britain'),
      'france' => clienttranslate('France'),
      'italia' => clienttranslate('Italia'),
      'japan' => clienttranslate('Japan'),
      'mexico' => clienttranslate('Mexico'),
      'nederland' => clienttranslate('Nederland'),
      'espana' => clienttranslate('España'),
    ];
    return $map[$circuitId];
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
      'japan' => 'Japan',
      'mexico' => 'Mexico',
      'nederland' => 'Nederland',
      'espana' => 'Espana',
    ];
    $fileName = __DIR__ . '/../Circuits/' . $names[Globals::getCircuit()] . '.php';
    include_once $fileName;
    Globals::setCircuitDatas($circuitDatas);
  }

  public static function getNDraftRounds()
  {
    if (self::isChampionship()) {
      return 1;
    }

    if (self::isSnakeDraft()) {
      return 2;
    } else {
      return 3;
    }
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
