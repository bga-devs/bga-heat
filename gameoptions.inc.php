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
          'message' => clienttranslate('Number of lengeds + players can\'t exceed 6'),
        ],
      ],
      2 => [
        [
          'type' => 'maxplayers',
          'value' => 4,
          'message' => clienttranslate('Number of lengeds + players can\'t exceed 6'),
        ],
      ],
      3 => [
        [
          'type' => 'maxplayers',
          'value' => 3,
          'message' => clienttranslate('Number of lengeds + players can\'t exceed 6'),
        ],
      ],
      4 => [
        [
          'type' => 'maxplayers',
          'value' => 2,
          'message' => clienttranslate('Number of lengeds + players can\'t exceed 6'),
        ],
      ],
      5 => [
        [
          'type' => 'maxplayers',
          'value' => 1,
          'message' => clienttranslate('Number of lengeds + players can\'t exceed 6'),
        ],
      ],
    ],
  ],
];

$game_preferences = [];
