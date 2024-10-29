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
 * stats.inc.php
 *
 * Heat game statistics description
 *
 */

require_once 'modules/php/constants.inc.php';

$stats_type = [
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
# position at race start
# position at race end (note that because of legend cars, you can win the game for BGA and not actually be first) (so the result for this for any given race can be 1 to 6)

# of rounds played
# of rounds played in speed 1/2/3/4
# of rounds started in first position

# rounds with adrenalin
# of "adrenalin extra space" used

# of spinouts
# Stress cards gained via spinouts

# Heat paid
# Heat in engine at game's end
# Heat paid for increasing gear by 2
# Heat paid for deceasing gear by 2

# of boosts performed
# of corners passed with speed above the speed limit

# of slipstreams performed

# Cards voluntarily discarded in phase 9
# of stress cards played

###
# relative position at race's end ( 100% for first car, 0 % for last and linear regression between the two extremes: If there are N cars, car in position X gets a score of (N-X)/(N-1) )
# relative human position at race's end (as above but only taking human played cars into account. And not computed in solo player games.)

# of legend cars in game
# of human players in game
