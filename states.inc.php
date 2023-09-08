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

  ST_GENERIC_NEXT_PLAYER => [
    'name' => 'genericNextPlayer',
    'description' => '',
    'type' => 'game',
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
    'transitions' => ['done' => ST_SETUP_RACE],
  ],

  //////////////////////////////
  //  ____
  // |  _ \ __ _  ___ ___
  // | |_) / _` |/ __/ _ \
  // |  _ < (_| | (_|  __/
  // |_| \_\__,_|\___\___|
  //////////////////////////////

  ST_SETUP_RACE => [
    'name' => 'setupRace',
    'description' => '',
    'type' => 'game',
    'action' => 'stSetupRace',
    'updateGameProgression' => true,
    'transitions' => ['start' => ST_START_RACE, 'draft' => ST_PREPARE_GARAGE_DRAFT],
  ],

  ST_PREPARE_GARAGE_DRAFT => [
    'name' => 'prepareGarageDraft',
    'description' => '',
    'type' => 'game',
    'action' => 'stPrepareGarageDraft',
    'transitions' => ['done' => ST_SETUP_RACE],
  ],

  ST_DRAFT_GARAGE => [
    'name' => 'chooseUpgrade',
    'description' => clienttranslate('${actplayer} must choose an Upgrade card (draft round n°${round}/3)'),
    'descriptionmyturn' => clienttranslate('${you} must choose an Upgrade card (draft round n°${round}/3)'),
    'type' => 'activeplayer',
    'args' => 'argsChooseUpgrade',
    'possibleactions' => ['actChooseUpgrade'],
    'transitions' => ['start' => ST_START_RACE, 'draft' => ST_PREPARE_GARAGE_DRAFT],
  ],

  ST_START_RACE => [
    'name' => 'startRace',
    'description' => '',
    'type' => 'game',
    'action' => 'stStartRace',
    'updateGameProgression' => true,
    'transitions' => ['startRound' => ST_START_ROUND],
  ],

  /////////////////////////////////////
  //  ____                       _
  // |  _ \ ___  _   _ _ __   __| |
  // | |_) / _ \| | | | '_ \ / _` |
  // |  _ < (_) | |_| | | | | (_| |
  // |_| \_\___/ \__,_|_| |_|\__,_|
  /////////////////////////////////////

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
  ],

  // ST_REVEAL => [
  //   'name' => 'reveal',
  //   'description' => '',
  //   'type' => 'game',
  //   'action' => 'stReveal',
  // ],

  // ST_END_ROUND => [
  //   'name' => 'endRound',
  //   'description' => '',
  //   'type' => 'game',
  //   'action' => 'stEndRound',
  //   'updateGameProgression' => true,
  // ],

  ST_CHOOSE_SPEED => [
    'name' => 'chooseSpeed',
    'description' => clienttranslate('${actplayer} must choose their speed'),
    'descriptionmyturn' => clienttranslate('${you} must choose your speed'),
    'type' => 'activeplayer',
    'args' => 'argsChooseSpeed',
    'action' => 'stChooseSpeed',
    'possibleactions' => ['actChooseSpeed'],
  ],

  ST_REACT => [
    'name' => 'react',
    'description' => clienttranslate('${actplayer} may react'),
    'descriptionmyturn' => clienttranslate('${you} may react'),
    'descriptionMust' => clienttranslate('${actplayer} must react'),
    'descriptionmyturnMust' => clienttranslate('${you} must react'),
    'type' => 'activeplayer',
    'args' => 'argsReact',
    'possibleactions' => ['actReact', 'actPassReact'],
  ],

  ST_SLIPSTREAM => [
    'name' => 'slipstream',
    'description' => clienttranslate('${actplayer} may slipstream'),
    'descriptionmyturn' => clienttranslate('${you} may slipstream'),
    'type' => 'activeplayer',
    'args' => 'argsSlipstream',
    'action' => 'stSlipstream',
    'possibleactions' => ['actSlipstream'],
  ],

  ST_DISCARD => [
    'name' => 'discard',
    'description' => clienttranslate('${actplayer} may discard cards from their hand'),
    'descriptionmyturn' => clienttranslate('${you} may discard cards from your hand'),
    'type' => 'activeplayer',
    'args' => 'argsDiscard',
    'action' => 'stDiscard',
    'possibleactions' => ['actDiscard'],
  ],

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
