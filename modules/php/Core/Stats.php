<?php

namespace Bga\Games\Heat\Core;

use Bga\Games\Heat\Managers\Players;
use Bga\Games\Heat\Game;

/*
 * Statistics
 */

class Stats extends \Bga\Games\Heat\Helpers\CachedDB_Manager
{
  protected static $table = 'stats';
  protected static $primary = 'stats_id';
  protected static $datas = null;
  protected static function cast($row)
  {
    return [
      'id' => $row['stats_id'],
      'type' => $row['stats_type'],
      'pId' => $row['stats_player_id'],
      'value' => $row['stats_value'],
    ];
  }

  /*
   * Create and store a stat declared but not present in DB yet
   *  (only happens when adding stats while a game is running)
   */
  public static function checkExistence()
  {
    $default = [
      'int' => 0,
      'float' => 0,
      'bool' => false,
      'str' => '',
    ];

    // Fetch existing stats, all stats
    $stats = self::getStatTypes();
    $existingStats = self::getAll()
      ->map(function ($stat) {
        return $stat['type'] . ',' . ($stat['pId'] == null ? 'table' : 'player');
      })
      ->toArray();

    $values = [];
    // Deal with table stats first
    foreach ($stats['table'] as $stat) {
      if ($stat['id'] < 10) {
        continue;
      }
      if (!in_array($stat['id'] . ',table', $existingStats)) {
        $values[] = [
          'stats_type' => $stat['id'],
          'stats_player_id' => null,
          'stats_value' => $default[$stat['type']],
        ];
      }
    }

    // Deal with player stats
    $playerIds = Players::getAll()->getIds();
    foreach ($stats['player'] as $stat) {
      if ($stat['id'] < 10) {
        continue;
      }
      if (!in_array($stat['id'] . ',player', $existingStats)) {
        foreach ($playerIds as $i => $pId) {
          $value = $default[$stat['type']];
          $values[] = [
            'stats_type' => $stat['id'],
            'stats_player_id' => $pId,
            'stats_value' => $value,
          ];
        }
      }
    }

    // Insert if needed
    if (!empty($values)) {
      self::DB()
        ->multipleInsert(['stats_type', 'stats_player_id', 'stats_value'])
        ->values($values);
      self::invalidate();
    }
  }

  protected static function getValue($id, $pId)
  {
    return self::getAll()
      ->filter(function ($stat) use ($id, $pId) {
        return $stat['type'] == $id &&
          ((is_null($pId) && is_null($stat['pId'])) || (!is_null($pId) && $stat['pId'] == (is_int($pId) ? $pId : $pId->getId())));
      })
      ->first()['value'];
  }

  protected static function getFilteredQuery($id, $pId)
  {
    $query = self::DB()->where('stats_type', $id);
    if (is_null($pId)) {
      $query = $query->whereNull('stats_player_id');
    } else {
      $query = $query->where('stats_player_id', is_int($pId) ? $pId : $pId->getId());
    }
    return $query;
  }

  /*
   * Magic method that intercept not defined static method and do the appropriate stuff
   */
  public static function __callStatic($method, $args)
  {
    if (preg_match('/^([gs]et|inc)([A-Z])(.*)$/', $method, $match)) {
      $stats = self::getStatTypes();

      // Sanity check : does the name correspond to a declared variable ?
      $name = mb_strtolower($match[2]) . $match[3];
      $isTableStat = \array_key_exists($name, $stats['table']);
      $isPlayerStat = \array_key_exists($name, $stats['player']);
      if (!$isTableStat && !$isPlayerStat) {
        throw new \InvalidArgumentException("Statistic {$name} doesn't exist");
      }

      if ($match[1] == 'get') {
        // Basic getters
        $id = null;
        $pId = null;
        if ($isTableStat) {
          $id = $stats['table'][$name]['id'];
        } else {
          if (empty($args)) {
            throw new \InvalidArgumentException("You need to specify the player for the stat {$name}");
          }
          $id = $stats['player'][$name]['id'];
          $pId = $args[0];
        }

        return self::getValue($id, $pId);
      } elseif ($match[1] == 'set') {
        // Setters in DB and update cache
        $id = null;
        $pId = null;
        $value = null;

        if ($isTableStat) {
          $id = $stats['table'][$name]['id'];
          $value = $args[0];
        } else {
          if (count($args) < 2) {
            throw new \InvalidArgumentException("You need to specify the player for the stat {$name}");
          }
          $id = $stats['player'][$name]['id'];
          $pId = $args[0];
          $value = $args[1];
        }

        self::getFilteredQuery($id, $pId)
          ->update(['stats_value' => $value])
          ->run();
        self::invalidate();
        return $value;
      } elseif ($match[1] == 'inc') {
        $id = null;
        $pId = null;
        $value = null;

        if ($isTableStat) {
          $id = $stats['table'][$name]['id'];
          $value = $args[0] ?? 1;
        } else {
          if (count($args) < 1) {
            throw new \InvalidArgumentException("You need to specify the player for the stat {$name}");
          }
          $id = $stats['player'][$name]['id'];
          $pId = $args[0];
          $value = $args[1] ?? 1;
        }

        self::getFilteredQuery($id, $pId)
          ->inc(['stats_value' => $value])
          ->run();
        self::invalidate();
        return $value;
      }
    }
    return null;
  }


  public static function getStatTypes(): array
  {
    require_once dirname(__FILE__) . "/../constants.inc.php";

    return [
      'table' => [],

      'player' => [
        'position' => [
          'id' => STAT_POSITION,
          'name' => totranslate('Position at race start'),
          'type' => 'float',
        ],
        'endPosition' => [
          'id' => STAT_POSITION_END,
          'name' => totranslate('Position at race end'),
          'type' => 'float',
        ],
        'time' => [
          'id' => STAT_CIRCUIT_TIME,
          'name' => totranslate('Finish time'),
          'type' => 'float',
        ],
        'rounds' => [
          'id' => STAT_ROUNDS,
          'name' => totranslate('Rounds played'),
          'type' => 'float',
        ],
        'roundsFirst' => [
          'id' => STAT_ROUNDS_FIRST,
          'name' => totranslate('Rounds played in first position '),
          'type' => 'float',
        ],
        'roundsSpeed1' => [
          'id' => STAT_ROUNDS_1,
          'name' => totranslate('Rounds played in gear 1'),
          'type' => 'float',
        ],
        'roundsSpeed2' => [
          'id' => STAT_ROUNDS_2,
          'name' => totranslate('Rounds played in gear 2'),
          'type' => 'float',
        ],
        'roundsSpeed3' => [
          'id' => STAT_ROUNDS_3,
          'name' => totranslate('Rounds played in gear 3'),
          'type' => 'float',
        ],
        'roundsSpeed4' => [
          'id' => STAT_ROUNDS_4,
          'name' => totranslate('Rounds played in gear 4'),
          'type' => 'float',
        ],

        'roundsAdrenaline' => [
          'id' => STAT_ROUNDS_ADRENALINE,
          'name' => totranslate('Rounds with adrenaline'),
          'type' => 'float',
        ],
        'adrenalineGains' => [
          'id' => STAT_ADRENALINE_GAIN,
          'name' => totranslate('Extra-spaces gained from adrenaline'),
          'type' => 'float',
        ],

        'spinOuts' => [
          'id' => STAT_SPINOUT,
          'name' => totranslate('Spin-outs'),
          'type' => 'float',
        ],
        'stressSpinOuts' => [
          'id' => STAT_SPINOUT_STRESS,
          'name' => totranslate('Stress card gained due to spin-outs'),
          'type' => 'float',
        ],

        'heatLeft' => [
          'id' => STAT_HEAT_LEFT,
          'name' => totranslate('Heat left in engine at game\'s end'),
          'type' => 'float',
        ],
        'heatPayed' => [
          'id' => STAT_HEAT_PAYED,
          'name' => totranslate('Heat paid'),
          'type' => 'float',
        ],
        'heatPayedGearUp' => [
          'id' => STAT_HEAT_PAYED_GEAR_UP,
          'name' => totranslate('Heat paid for increasing gear by 2'),
          'type' => 'float',
        ],
        'heatPayedGearDown' => [
          'id' => STAT_HEAT_PAYED_GEAR_DOWN,
          'name' => totranslate('Heat paid for decreasing gear by 2'),
          'type' => 'float',
        ],
        'boost' => [
          'id' => STAT_BOOST,
          'name' => totranslate('Boosts performed'),
          'type' => 'float',
        ],
        'overspeedCorners' => [
          'id' => STAT_OVERSPEED_CORNERS,
          'name' => totranslate('Overspeed corners'),
          'type' => 'float',
        ],

        'slipstreamGains' => [
          'id' => STAT_SLIPSTREAM_GAINS,
          'name' => totranslate('Extra-spaces gained from slipstream'),
          'type' => 'float',
        ],

        'extraDiscard' => [
          'id' => STAT_EXTRA_DISCARD,
          'name' => totranslate('Cards discarded from hand in phase 9'),
          'type' => 'float',
        ],
        'stressPlayed' => [
          'id' => STAT_STRESS_PLAYED,
          'name' => totranslate('Stress cards played'),
          'type' => 'float',
        ],
      ],
    ];
  }
}
