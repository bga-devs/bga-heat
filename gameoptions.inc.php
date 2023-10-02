<?php

/**
 *------
 * BGA framework: © Gregory Isabelli <gisabelli@boardgamearena.com> & Emmanuel Colin <ecolin@boardgamearena.com>
 * HeatChampionship implementation : © Timothée Pecatte <tim.pecatte@gmail.com>, Guy Baudin <guy.thoun@gmail.com>
 *
 * This code has been produced on the BGA studio platform for use on http://boardgamearena.com.
 * See http://en.boardgamearena.com/#!doc/Studio for more information.
 * -----
 *
 * gameoptions.inc.php
 *
 * HeatChampionship game options description
 *
 * In this file, you can define your game options (= game variants).
 *
 * Note: If your game has no variant, you don't have to modify this file.
 *
 * Note²: All options defined in this file should have a corresponding "game state labels"
 *        with the same ID (see "initGameStateLabels" in heatchampionship.game.php)
 *
 * !! It is not a good idea to modify this file when a game is running !!
 *
 */

namespace HEAT;

require_once 'modules/php/gameoptions.inc.php';

$game_options = [
  OPTION_TB_MODE => [
    'name' => totranslate('Turn-based mode'),
    'default' => OPTION_TB_STANDARD,
    'values' => [
      OPTION_TB_STANDARD => [
        'name' => clienttranslate('Standard'),
        'description' => clienttranslate('Everyone is awaken for planification, then every player in turn order is awaken to move their car'),
      ],
      OPTION_TB_ENHANCED => [
        'name' => clienttranslate('Enhanced'),
        'description' => clienttranslate('Every player is only awaken once, and all previous players\' actions are hidden until they confirm their planification'),
        'alpha' => true,
      ],
    ],
    'displaycondition' => [
      [
        'type' => 'otheroptionisnot',
        'id' => 200,
        'value' => [0, 1, 2],
      ],
    ]
  ],

  OPTION_SETUP => [
    'name' => totranslate('Mode'),
    'default' => OPTION_SETUP_BEGINNER,
    'values' => [
      OPTION_SETUP_FIRST_GAME => [
        'name' => clienttranslate('First game'),
        'description' => clienttranslate('A single lap of USA circuit without any module'),
        'tmdisplay' => clienttranslate('[First game]'),
      ],
      OPTION_SETUP_BEGINNER => [
        'name' => clienttranslate('Beginner'),
        'description' => clienttranslate('No additional module'),
        'tmdisplay' => clienttranslate('[Beginner]'),
      ],
      OPTION_SETUP_STANDARD => [
        'name' => clienttranslate('Standard'),
        'description' => clienttranslate('Customize the race by choosing the circuit and additional modules'),
      ],
      OPTION_SETUP_CHAMPIONSHIP => [
        'name' => clienttranslate('Championship'),
        'tmdisplay' => clienttranslate('[Championship]'),
        'nobeginner' => true,
      ],
    ],
  ],

  OPTION_HEAVY_RAIN_EXPANSION => [
    'name' => totranslate('Expansion'),
    'level' => "major",
    'values' => [
      OPTION_EXPANSION_DISABLED => [
        'name' => clienttranslate('Base game only'),
      ],
      OPTION_EXPANSION_ENABLED => [
        'name' => clienttranslate('Heavy Rain'),
        'tmdisplay' => clienttranslate('((Heavy Rain))'),
        'nobeginner' => true,
      ],
    ],
    'displaycondition' => [
      [
        'type' => 'otheroptionisnot',
        'id' => OPTION_SETUP,
        'value' => [OPTION_SETUP_FIRST_GAME],
      ],
    ],
  ],


  OPTION_LEGEND => [
    'name' => totranslate('Legends'),
    'values' => [
      0 => [
        'name' => clienttranslate('No legend'),
        'description' => clienttranslate('Only human players'),
      ],
      2 => [
        'name' => clienttranslate('Fill to 2 cars'),
        'tmdisplay' => clienttranslate('[legends: fill to 2]'),
        'description' => clienttranslate('Add legends up to 2 cars in total'),
      ],
      3 => [
        'name' => clienttranslate('Fill to 3 cars'),
        'tmdisplay' => clienttranslate('[legends: fill to 3]'),
        'description' => clienttranslate('Add legends up to 3 cars in total'),
      ],
      4 => [
        'name' => clienttranslate('Fill to 4 cars'),
        'tmdisplay' => clienttranslate('[legends: fill to 4]'),
        'description' => clienttranslate('Add legends up to 4 cars in total'),
      ],
      5 => [
        'name' => clienttranslate('Fill to 5 cars'),
        'tmdisplay' => clienttranslate('[legends: fill to 5]'),
        'description' => clienttranslate('Add legends up to 5 cars in total'),
      ],
      6 => [
        'name' => clienttranslate('Fill to 6 cars'),
        'tmdisplay' => clienttranslate('[legends: fill to 6]'),
        'description' => clienttranslate('Add legends up to 6 cars in total'),
      ],
      7 => [
        'name' => clienttranslate('Fill to 7 cars'),
        'tmdisplay' => clienttranslate('[legends: fill to 7]'),
        'description' => clienttranslate('Add legends up to 7 cars in total'),
      ],
    ],
    'default' => 6,
    // 'displaycondition' => [
    //   [
    //     'type' => 'otheroptionisnot',
    //     'id' => OPTION_SETUP,
    //     'value' => [OPTION_SETUP_FIRST_GAME, OPTION_SETUP_BEGINNER],
    //   ],
    // ],
    'startcondition' => [
      0 => [
        [
          'type' => 'minplayers',
          'value' => 2,
          'message' => clienttranslate('You can\'t play solo without a legend'),
        ],
      ],
    ],
  ],

  OPTION_LEGEND_PRO => [
    'name' => totranslate('Pro Legends (faster legends)'),
    'values' => [
      0 => [
        'name' => clienttranslate('Disabled'),
      ],
      1 => [
        'name' => clienttranslate('+1'),
        'description' => clienttranslate(
          'Top speed of legend cars is increased by 1. (The value shown on the Legend Cards will be the increased value)'
        ),
        'tmdisplay' => clienttranslate('[Legend:+1]'),
      ],
      2 => [
        'name' => clienttranslate('+2'),
        'description' => clienttranslate(
          'Top speed of legend cars is increased by 2. (The value shown on the Legend Cards will be the increased value)'
        ),
        'tmdisplay' => clienttranslate('[Legend:+2]'),
      ],
      3 => [
        'name' => clienttranslate('+3'),
        'description' => clienttranslate(
          'Top speed of legend cars is increased by 3. (The value shown on the Legend Cards will be the increased value)'
        ),
        'tmdisplay' => clienttranslate('[Legend:+3]'),
      ],
      4 => [
        'name' => clienttranslate('+4'),
        'description' => clienttranslate(
          'Top speed of legend cars is increased by 4. (The value shown on the Legend Cards will be the increased value)'
        ),
        'tmdisplay' => clienttranslate('[Legend:+4]'),
      ],
      5 => [
        'name' => clienttranslate('+5'),
        'description' => clienttranslate(
          'Top speed of legend cars is increased by 5. (The value shown on the Legend Cards will be the increased value)'
        ),
        'tmdisplay' => clienttranslate('[Legend:+5]'),
      ],
      6 => [
        'name' => clienttranslate('+6'),
        'description' => clienttranslate(
          'Top speed of legend cars is increased by 6. (The value shown on the Legend Cards will be the increased value)'
        ),
        'tmdisplay' => clienttranslate('[Legend:+6]'),
      ],
    ],
    'displaycondition' => [
      [
        'type' => 'otheroptionisnot',
        'id' => OPTION_LEGEND,
        'value' => [0],
      ],
      [
        'type' => 'otheroptionisnot',
        'id' => OPTION_SETUP,
        'value' => [OPTION_SETUP_FIRST_GAME, OPTION_SETUP_BEGINNER],
      ],
    ],
  ],

  OPTION_AGGRESSIVE_LEGENDS => [
    'name' => totranslate('Aggressive Legends'),
    'values' => [
      0 => [
        'name' => clienttranslate('Disabled'),
      ],
      1 => [
        'name' => clienttranslate('Enabled'),
        'description' => clienttranslate(
          'If a Legend starts its turn on a space with a chevron above the diamond on the track, it can cross one extra Corner Line this Round.'
        ),
        'tmdisplay' => clienttranslate('[Aggressive Legends]'),
      ],
    ],
    'displaycondition' => [
      [
        'type' => 'otheroptionisnot',
        'id' => OPTION_LEGEND,
        'value' => [0],
      ],
      [
        'type' => 'otheroptionisnot',
        'id' => OPTION_SETUP,
        'value' => [OPTION_SETUP_FIRST_GAME, OPTION_SETUP_BEGINNER],
      ],
    ],
  ],

  OPTION_CIRCUIT => [
    'name' => totranslate('Circuit'),
    'values' => [
      OPTION_CIRCUIT_USA => [
        'name' => clienttranslate('USA'),
        'tmdisplay' => clienttranslate('[USA]'),
      ],
      OPTION_CIRCUIT_ITALIA => [
        'name' => clienttranslate('Italia'),
        'tmdisplay' => clienttranslate('[Italia]'),
      ],
      OPTION_CIRCUIT_GB => [
        'name' => clienttranslate('Great Britain'),
        'tmdisplay' => clienttranslate('[GB]'),
      ],
      OPTION_CIRCUIT_FRANCE => [
        'name' => clienttranslate('France'),
        'tmdisplay' => clienttranslate('[France]'),
      ],
      OPTION_CIRCUIT_RANDOM => [
        'name' => clienttranslate('Random'),
        'tmdisplay' => clienttranslate('[Random circuit]'),
        'description' => clienttranslate('Random circuit among USA, Italia, Great Britain and France'),
      ],
      //   OPTION_CIRCUIT_CUSTOM => [
      //     'name' => ('Custom'),
      //     'tmdisplay' => ('[Custom]'),
      //     // 'description' => ('You need a .heatchampionship file to play with this option. You can create some by using the circuit editor available here : #URL#'),
      //   ],
    ],
    'displaycondition' => [
      [
        'type' => 'otheroptionisnot',
        'id' => OPTION_SETUP,
        'value' => [OPTION_SETUP_FIRST_GAME, OPTION_SETUP_CHAMPIONSHIP],
      ],
      [
        'type' => 'otheroption',
        'id' => OPTION_HEAVY_RAIN_EXPANSION,
        'value' => OPTION_EXPANSION_DISABLED,
      ],
    ],
  ],
  OPTION_CIRCUIT_EXP => [
    'name' => totranslate('Circuit'),
    'values' => [
      OPTION_CIRCUIT_USA => [
        'name' => clienttranslate('USA'),
        'tmdisplay' => clienttranslate('[USA]'),
      ],
      OPTION_CIRCUIT_ITALIA => [
        'name' => clienttranslate('Italia'),
        'tmdisplay' => clienttranslate('[Italia]'),
      ],
      OPTION_CIRCUIT_GB => [
        'name' => clienttranslate('Great Britain'),
        'tmdisplay' => clienttranslate('[GB]'),
      ],
      OPTION_CIRCUIT_FRANCE => [
        'name' => clienttranslate('France'),
        'tmdisplay' => clienttranslate('[France]'),
      ],
      OPTION_CIRCUIT_MEXICO => [
        'name' => clienttranslate('Mexico'),
        'tmdisplay' => clienttranslate('[Mexico]'),
      ],
      OPTION_CIRCUIT_JAPAN => [
        'name' => clienttranslate('Japan'),
        'tmdisplay' => clienttranslate('[Japan]'),
      ],
      OPTION_CIRCUIT_RANDOM => [
        'name' => clienttranslate('Random'),
        'tmdisplay' => clienttranslate('[Random circuit]'),
        'description' => clienttranslate('Random circuit among USA, Italia, Great Britain, France, Mexico and Japan'),
      ],
    ],
    'displaycondition' => [
      [
        'type' => 'otheroptionisnot',
        'id' => OPTION_SETUP,
        'value' => [OPTION_SETUP_FIRST_GAME, OPTION_SETUP_CHAMPIONSHIP],
      ],
      [
        'type' => 'otheroption',
        'id' => OPTION_HEAVY_RAIN_EXPANSION,
        'value' => OPTION_EXPANSION_ENABLED,
      ],
    ],
  ],

  OPTION_GARAGE_MODULE => [
    'name' => totranslate('Garage module'),
    'values' => [
      OPTION_DISABLED => [
        'name' => clienttranslate('Disabled'),
      ],
      OPTION_GARAGE_BASIC => [
        'name' => clienttranslate('Basic upgrades only'),
        'tmdisplay' => clienttranslate('[Garage: basic]'),
        'nobeginner' => true,
      ],
      OPTION_GARAGE_ADVANCED => [
        'name' => clienttranslate('Advanced upgrades only'),
        'tmdisplay' => clienttranslate('[Garage: advanced]'),
        'nobeginner' => true,
      ],
      OPTION_GARAGE_MIXED => [
        'name' => clienttranslate('All upgrades'),
        'tmdisplay' => clienttranslate('[Garage]'),
        'nobeginner' => true,
      ],
    ],
    'displaycondition' => [
      [
        'type' => 'otheroptionisnot',
        'id' => OPTION_SETUP,
        'value' => [OPTION_SETUP_FIRST_GAME, OPTION_SETUP_BEGINNER, OPTION_SETUP_CHAMPIONSHIP],
      ],
    ],
  ],
  OPTION_GARAGE_MODULE_CHAMPIONSHIP => [
    'name' => totranslate('Garage module'),
    'values' => [
      OPTION_GARAGE_BASIC => [
        'name' => clienttranslate('Basic upgrades only'),
        'tmdisplay' => clienttranslate('[Garage: basic]'),
      ],
      OPTION_GARAGE_ADVANCED => [
        'name' => clienttranslate('Advanced upgrades only'),
        'tmdisplay' => clienttranslate('[Garage: advanced]'),
      ],
      OPTION_GARAGE_MIXED => [
        'name' => clienttranslate('All upgrades'),
        'tmdisplay' => clienttranslate('[Garage]'),
      ],
    ],
    'displaycondition' => [
      [
        'type' => 'otheroption',
        'id' => OPTION_SETUP,
        'value' => OPTION_SETUP_CHAMPIONSHIP,
      ],
    ],
  ],

  OPTION_GARAGE_CHOICE => [
    'name' => totranslate('Choosing upgrades'),
    'default' => OPTION_GARAGE_DRAFT,
    'values' => [
      OPTION_GARAGE_RANDOM => [
        'name' => clienttranslate('Random'),
        'tmdisplay' => clienttranslate('[Random upgrades]'),
        'description' => clienttranslate('No draft. 3 random upgrades'),
      ],
      OPTION_GARAGE_DRAFT => [
        'name' => clienttranslate('Draft'),
        'description' => clienttranslate('3 rounds of upgrade cards drafting'),
      ],
      OPTION_GARAGE_SNAKE_DRAFT => [
        'name' => clienttranslate('Snake draft'),
        'tmdisplay' => clienttranslate('[Snake draft]'),
        'description' => clienttranslate('Two round of snake draft among 2N + 3 cards (N = number of players), then each player discards one card to keep only 3 upgrade cards'),
      ],
    ],
    'displaycondition' => [
      [
        'type' => 'otheroptionisnot',
        'id' => OPTION_GARAGE_MODULE,
        'value' => [OPTION_DISABLED],
      ],
      [
        'type' => 'otheroptionisnot',
        'id' => OPTION_SETUP,
        'value' => [OPTION_SETUP_FIRST_GAME, OPTION_SETUP_BEGINNER, OPTION_SETUP_CHAMPIONSHIP],
      ],
    ],
  ],

  OPTION_WEATHER_MODULE => [
    'name' => totranslate('Weather module'),
    'values' => [
      OPTION_DISABLED => [
        'name' => clienttranslate('Disabled'),
      ],
      OPTION_WEATHER_ENABLED => [
        'name' => clienttranslate('Enabled'),
        'tmdisplay' => clienttranslate('[Weather]'),
        'nobeginner' => true,
      ],
    ],
    'displaycondition' => [
      [
        'type' => 'otheroptionisnot',
        'id' => OPTION_SETUP,
        'value' => [OPTION_SETUP_FIRST_GAME, OPTION_SETUP_BEGINNER, OPTION_SETUP_CHAMPIONSHIP],
      ],
    ],
  ],

  OPTION_CHAMPIONSHIP => [
    'name' => totranslate('Championship'),
    'values' => [
      OPTION_CHAMPIONSHIP_SEASON_61 => [
        'name' => clienttranslate('Season 1961 (3 races)'),
        'tmdisplay' => clienttranslate('[1961]'),
      ],
      OPTION_CHAMPIONSHIP_SEASON_62 => [
        'name' => clienttranslate('Season 1962 (3 races)'),
        'tmdisplay' => clienttranslate('[1962]'),
      ],
      OPTION_CHAMPIONSHIP_SEASON_63 => [
        'name' => clienttranslate('Season 1963 (4 races)'),
        'tmdisplay' => clienttranslate('[1963]'),
      ],
      OPTION_CHAMPIONSHIP_RANDOM => [
        'name' => clienttranslate('Random championship'),
        'tmdisplay' => clienttranslate('[Random championship]'),
        'description' => clienttranslate('Play the 4 circuits in a random order with random events'),
      ],
      // OPTION_CHAMPIONSHIP_CUSTOM => [
      //   'name' => ('Custom championship'),
      //   'tmdisplay' => ('[Custom championship]'),
      // ],
    ],
    'displaycondition' => [
      [
        'type' => 'otheroption',
        'id' => OPTION_SETUP,
        'value' => OPTION_SETUP_CHAMPIONSHIP,
      ],
      [
        'type' => 'otheroption',
        'id' => OPTION_HEAVY_RAIN_EXPANSION,
        'value' => OPTION_EXPANSION_DISABLED,
      ],
    ],
  ],
  OPTION_CHAMPIONSHIP_EXP => [
    'name' => totranslate('Championship'),
    'values' => [
      OPTION_CHAMPIONSHIP_SEASON_61 => [
        'name' => clienttranslate('Season 1961 (3 races)'),
        'tmdisplay' => clienttranslate('[1961]'),
      ],
      OPTION_CHAMPIONSHIP_SEASON_62 => [
        'name' => clienttranslate('Season 1962 (3 races)'),
        'tmdisplay' => clienttranslate('[1962]'),
      ],
      OPTION_CHAMPIONSHIP_SEASON_63 => [
        'name' => clienttranslate('Season 1963 (4 races)'),
        'tmdisplay' => clienttranslate('[1963]'),
      ],
      OPTION_CHAMPIONSHIP_SEASON_64 => [
        'name' => clienttranslate('Season 1964 (4 races)'),
        'tmdisplay' => clienttranslate('[1964]'),
      ],
      OPTION_CHAMPIONSHIP_RANDOM => [
        'name' => clienttranslate('Random championship'),
        'tmdisplay' => clienttranslate('[Random championship]'),
        'description' => clienttranslate('Play the 4 circuits in a random order with random events'),
      ],
      // OPTION_CHAMPIONSHIP_CUSTOM => [
      //   'name' => ('Custom championship'),
      //   'tmdisplay' => ('[Custom championship]'),
      // ],
    ],
    'displaycondition' => [
      [
        'type' => 'otheroption',
        'id' => OPTION_SETUP,
        'value' => OPTION_SETUP_CHAMPIONSHIP,
      ],
      [
        'type' => 'otheroption',
        'id' => OPTION_HEAVY_RAIN_EXPANSION,
        'value' => OPTION_EXPANSION_ENABLED,
      ],
    ],
  ],
];

$game_preferences = [
  OPTION_CONFIRM_HEAT_COST => [
    'name' => totranslate('Confirmation when heat cost increases'),
    'needReload' => false,
    'default' => OPTION_CONFIRM_HEAT_COST,
    'values' => [
      OPTION_CONFIRM_HEAT_COST_ENABLED => ['name' => totranslate('Enabled')],
      OPTION_CONFIRM_HEAT_COST_DISABLED => ['name' => totranslate('Disabled')],
    ],
  ],
];
