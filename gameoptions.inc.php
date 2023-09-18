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
 * gameoptions.inc.php
 *
 * Heat game options description
 *
 * In this file, you can define your game options (= game variants).
 *
 * Note: If your game has no variant, you don't have to modify this file.
 *
 * Note²: All options defined in this file should have a corresponding "game state labels"
 *        with the same ID (see "initGameStateLabels" in heat.game.php)
 *
 * !! It is not a good idea to modify this file when a game is running !!
 *
 */

namespace HEAT;

require_once 'modules/php/gameoptions.inc.php';

$game_options = [
  OPTION_SETUP => [
    'name' => totranslate('Mode'),
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
      ],
    ],
  ],

  OPTION_LEGEND => [
    'name' => totranslate('Legends'),
    'values' => [
      0 => [
        'name' => clienttranslate('0'),
        'description' => clienttranslate('Only human players'),
      ],
      1 => [
        'name' => clienttranslate('1 legend'),
        'tmdisplay' => clienttranslate('[1 legend]'),
      ],
      2 => [
        'name' => clienttranslate('2 legends'),
        'tmdisplay' => clienttranslate('[2 legends]'),
      ],
      3 => [
        'name' => clienttranslate('3 legends'),
        'tmdisplay' => clienttranslate('[3 legends]'),
      ],
      4 => [
        'name' => clienttranslate('4 legends'),
        'tmdisplay' => clienttranslate('[4 legends]'),
      ],
      5 => [
        'name' => clienttranslate('5 legends'),
        'tmdisplay' => clienttranslate('[5 legends]'),
      ],
    ],
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
      1 => [
        [
          'type' => 'maxplayers',
          'value' => 5,
          'message' => clienttranslate('Number of legends + players can\'t exceed 6'),
        ],
      ],
      2 => [
        [
          'type' => 'maxplayers',
          'value' => 4,
          'message' => clienttranslate('Number of legends + players can\'t exceed 6'),
        ],
      ],
      3 => [
        [
          'type' => 'maxplayers',
          'value' => 3,
          'message' => clienttranslate('Number of legends + players can\'t exceed 6'),
        ],
      ],
      4 => [
        [
          'type' => 'maxplayers',
          'value' => 2,
          'message' => clienttranslate('Number of legends + players can\'t exceed 6'),
        ],
      ],
      5 => [
        [
          'type' => 'maxplayers',
          'value' => 1,
          'message' => clienttranslate('Number of legends + players can\'t exceed 6'),
        ],
      ],
    ],
  ],

  OPTION_LEGEND_PRO => [
    'name' => totranslate('Pro Legends'),
    'values' => [
      0 => [
        'name' => clienttranslate('Disabled'),
      ],
      1 => [
        'name' => clienttranslate('+1'),
        'tmdisplay' => clienttranslate('[Legend:+1]'),
      ],
      2 => [
        'name' => clienttranslate('+2'),
        'tmdisplay' => clienttranslate('[Legend:+2]'),
      ],
      3 => [
        'name' => clienttranslate('+3'),
        'tmdisplay' => clienttranslate('[Legend:+3]'),
      ],
      4 => [
        'name' => clienttranslate('+4'),
        'tmdisplay' => clienttranslate('[Legend:+4]'),
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
        'name' => clienttranslate('Great-Britain'),
        'tmdisplay' => clienttranslate('[GB]'),
      ],
      OPTION_CIRCUIT_FRANCE => [
        'name' => clienttranslate('France'),
        'tmdisplay' => clienttranslate('[France]'),
      ],
      //   OPTION_CIRCUIT_CUSTOM => [
      //     'name' => clienttranslate('Custom'),
      //     'tmdisplay' => clienttranslate('[Custom]'),
      //     // 'description' => ('You need a .heat file to play with this option. You can create some by using the circuit editor available here : #URL#'),
      //   ],
    ],
    'displaycondition' => [
      [
        'type' => 'otheroptionisnot',
        'id' => OPTION_SETUP,
        'value' => [OPTION_SETUP_FIRST_GAME, OPTION_SETUP_CHAMPIONSHIP],
      ],
    ],
  ],

  // OPTION_NBR_LAPS => [
  //   'name' => totranslate('Number of laps'),
  //   'values' => [
  //     0 => [
  //       'name' => clienttranslate('Default'),
  //     ],
  //     1 => [
  //       'name' => clienttranslate('Single lap'),
  //       'tmdisplay' => clienttranslate('[1 lap]'),
  //     ],
  //     2 => [
  //       'name' => clienttranslate('2 laps'),
  //       'tmdisplay' => clienttranslate('[2 laps]'),
  //     ],
  //     3 => [
  //       'name' => clienttranslate('3 laps'),
  //       'tmdisplay' => clienttranslate('[3 laps]'),
  //     ],
  //     4 => [
  //       'name' => clienttranslate('4 laps'),
  //       'tmdisplay' => clienttranslate('[4 laps]'),
  //     ],
  //   ],
  //   'displaycondition' => [
  //     [
  //       'type' => 'otheroptionisnot',
  //       'id' => OPTION_SETUP,
  //       'value' => [OPTION_SETUP_FIRST_GAME, OPTION_SETUP_BEGINNER, OPTION_SETUP_CHAMPIONSHIP],
  //     ],
  //   ],
  // ],

  OPTION_GARAGE_MODULE => [
    'name' => totranslate('Garage module'),
    'values' => [
      OPTION_DISABLED => [
        'name' => clienttranslate('Disabled'),
      ],
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
      OPTION_CHAMPIONSHIP_CUSTOM => [
        'name' => clienttranslate('Custom championship'),
        'tmdisplay' => clienttranslate('[Custom championship]'),
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
];

$game_preferences = [];
