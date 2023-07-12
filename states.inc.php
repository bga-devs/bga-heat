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
 * states.inc.php
 *
 * Heat game states description
 *
 */

$machinestates = [
  // The initial state. Please do not modify.
  ST_GAME_SETUP => [
    'name' => 'gameSetup',
    'description' => '',
    'type' => 'manager',
    'action' => 'stGameSetup',
    'transitions' => ['' => ST_SETUP_BRANCH],
  ],

  ///////////////////////////////////
  //    ____       _
  //   / ___|  ___| |_ _   _ _ __
  //   \___ \ / _ \ __| | | | '_ \
  //    ___) |  __/ |_| |_| | |_) |
  //   |____/ \___|\__|\__,_| .__/
  //                        |_|
  ///////////////////////////////////
  ST_SETUP_BRANCH => [
    'name' => 'setupBranch',
    'description' => '',
    'type' => 'game',
    'action' => 'stSetupBranch',
    'transitions' => ['done' => ST_START_RACE],
  ],

  //////////////////////////////
  //  ____
  // |  _ \ __ _  ___ ___
  // | |_) / _` |/ __/ _ \
  // |  _ < (_| | (_|  __/
  // |_| \_\__,_|\___\___|
  //////////////////////////////

  ST_START_RACE => [
    'name' => 'startRace',
    'description' => '',
    'type' => 'game',
    'action' => 'stStartRace',
    'updateGameProgression' => true,
    'transitions' => ['startRound' => ST_START_ROUND],
  ],

  ST_START_ROUND => [
    'name' => 'startRound',
    'description' => '',
    'type' => 'game',
    'action' => 'stStartRound',
    'updateGameProgression' => true,
    'transitions' => ['planification' => ST_PLANIFICATION],
  ],

  ST_PLANIFICATION => [
    'name' => 'planification',
    'description' => clienttranslate('Waiting for others to their gear and card(s)'),
    'descriptionmyturn' => clienttranslate('${you} must select the gear and card(s) to play'),
    'type' => 'multipleactiveplayer',
    'args' => 'argsPlanification',
    'possibleactions' => ['actPlan', 'actCancelPlan'],
    'transitions' => [],
  ],

  // ST_RESOLVE_CHOICE => [
  //   'name' => 'resolveChoice',
  //   'description' => clienttranslate('${actplayer} must choose which effect to resolve'),
  //   'descriptionmyturn' => clienttranslate('${you} must choose which effect to resolve'),
  //   'descriptionxor' => clienttranslate('${actplayer} must choose exactly one effect'),
  //   'descriptionmyturnxor' => clienttranslate('${you} must choose exactly one effect'),
  //   'type' => 'activeplayer',
  //   'args' => 'argsResolveChoice',
  //   'action' => 'stResolveChoice',
  //   'possibleactions' => ['actChooseAction', 'actRestart'],
  //   'transitions' => [],
  // ],

  //////////////////////////////////////////////////////////////////
  //  _____           _    ___   __    ____
  // | ____|_ __   __| |  / _ \ / _|  / ___| __ _ _ __ ___   ___
  // |  _| | '_ \ / _` | | | | | |_  | |  _ / _` | '_ ` _ \ / _ \
  // | |___| | | | (_| | | |_| |  _| | |_| | (_| | | | | | |  __/
  // |_____|_| |_|\__,_|  \___/|_|    \____|\__,_|_| |_| |_|\___|
  //////////////////////////////////////////////////////////////////

  ST_PRE_END_OF_GAME => [
    'name' => 'preEndOfGame',
    'type' => 'game',
    'action' => 'stPreEndOfGame',
    'transitions' => ['' => ST_END_GAME],
  ],

  // Final state.
  // Please do not modify (and do not overload action/args methods).
  ST_END_GAME => [
    'name' => 'gameEnd',
    'description' => clienttranslate('End of game'),
    'type' => 'manager',
    'action' => 'stGameEnd',
    'args' => 'argGameEnd',
  ],
];
