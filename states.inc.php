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
    'transitions' => ['done' => ST_SETUP_RACE, 'custom' => ST_UPLOAD_CIRCUIT],
  ],

  ST_UPLOAD_CIRCUIT => [
    'name' => 'uploadCircuit',
    'description' => clienttranslate('You must upload a heat circuit'),
    'descriptionmyturn' => clienttranslate('${you} must upload a heat circuit'),
    'type' => 'multipleactiveplayer',
    'possibleactions' => ['actUploadCircuit'],
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
    'description' => clienttranslate('${actplayer} must choose an Upgrade card (draft round n°${round}/${nRounds})'),
    'descriptionmyturn' => clienttranslate('${you} must choose an Upgrade card (draft round n°${round}/${nRounds})'),
    'type' => 'activeplayer',
    'args' => 'argsChooseUpgrade',
    'possibleactions' => ['actChooseUpgrade'],
    'transitions' => ['start' => ST_START_RACE, 'draft' => ST_PREPARE_GARAGE_DRAFT, 'swap' => ST_DRAFT_GARAGE_SWAP],
  ],

  // Snake draft only
  ST_DRAFT_GARAGE_SNAKE_DISCARD => [
    'name' => 'snakeDiscard',
    'description' => clienttranslate('Waiting for some players to choose the upgrade card they want to discard'),
    'descriptionmyturn' => clienttranslate('You must discard one of the drafted upgrade cards'),
    'type' => 'multipleactiveplayer',
    'args' => 'argsSnakeDiscard',
    'possibleactions' => ['actSnakeDiscard', 'actCancelSnakeDiscard'],
    'transitions' => ['start' => ST_START_RACE],
  ],

  // Championship only
  ST_DRAFT_GARAGE_SWAP => [
    'name' => 'swapUpgrade',
    'description' => clienttranslate('${actplayer} may swap one of the Upgrades they picked with another one left in the market'),
    'descriptionmyturn' => clienttranslate('${you} may swap one of the Upgrades you picked with another one left in the market'),
    'type' => 'activeplayer',
    'args' => 'argsSwapUpgrade',
    'possibleactions' => ['actSwapUpgrade', 'actPassSwapUpgrade'],
    'transitions' => ['start' => ST_DRAW_SPONSORS, 'zombiePass' => ST_DRAW_SPONSORS],
  ],

  ST_DRAW_SPONSORS => [
    'name' => 'drawSponsors',
    'description' => '',
    'type' => 'game',
    'action' => 'stDrawSponsors',
    'transitions' => ['start' => ST_START_RACE],
  ],

  ST_START_RACE => [
    'name' => 'startRace',
    'description' => '',
    'type' => 'game',
    'action' => 'stStartRace',
    'updateGameProgression' => true,
    'transitions' => ['startRound' => ST_START_ROUND],
  ],

  // CHAMPIONSHIP
  ST_CONFIRM_END_OF_RACE => [
    'name' => 'confirmEndOfRace',
    'description' => clienttranslate('Some players are seeing end of round result'),
    'descriptionmyturn' => clienttranslate('End of race result'),
    'type' => 'multipleactiveplayer',
    'possibleactions' => ['actConfirmResults'],
    'transitions' => ['done' => ST_PROCEED_TO_NEXT_RACE, 'zombiePass' => ST_PROCEED_TO_NEXT_RACE],
  ],

  ST_PROCEED_TO_NEXT_RACE => [
    'name' => 'proceedNextRace',
    'description' => '',
    'type' => 'game',
    'action' => 'stProceedToNextRace',
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
    'description' => clienttranslate('Waiting for others to select their gear and card(s)'),
    'descriptionmyturn' => clienttranslate('${you} must select the gear and card(s) to play'),
    'type' => 'multipleactiveplayer',
    'args' => 'argsPlanification',
    'possibleactions' => ['actPlan', 'actCancelPlan', 'actGiveUp'],
  ],

  ST_CHOOSE_SPEED => [
    'name' => 'chooseSpeed',
    'description' => clienttranslate('${actplayer} must choose their speed'),
    'descriptionmyturn' => clienttranslate('${you} must choose your speed'),
    'descriptionmyturnSingleChoice' => clienttranslate('${you} must move according to your speed'),
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
    'action' => 'stReact',
    'possibleactions' => ['actReact', 'actPassReact', 'actCryCauseNotEnoughHeatToPay'],
  ],

  ST_SALVAGE => [
    'name' => 'salvage',
    'description' => clienttranslate('${actplayer} may choose up to ${n} card(s) in their discard to put back in their deck'),
    'descriptionmyturn' => clienttranslate('${you} may choose up to ${n} card(s) in your discard to put back in your deck'),
    'type' => 'activeplayer',
    'args' => 'argsSalvage',
    'possibleactions' => ['actSalvage', 'actPassReact'],
  ],

  ST_SUPER_COOL => [
    'name' => 'superCool',
    'description' => /*clienttranslateTODOHR*/ ('${actplayer} may choose up to ${n} Heat card(s) in their discard to put back in their engine'),
    'descriptionmyturn' => /*clienttranslateTODOHR*/ ('${you} may choose up to ${n} Heat card(s) in your discard to put back in your engine'),
    'type' => 'activeplayer',
    'args' => 'argsSuperCool',
    'possibleactions' => ['actSuperCool', 'actPassReact'],
  ],

  ST_PAY_HEATS => [
    'name' => 'payHeats',
    'description' => clienttranslate(
      '${actplayer} must choose which card to pay Heat(s) for and which card to discard and resolve as stress'
    ),
    'descriptionmyturn' => clienttranslate(
      '${you} must choose which card to pay Heat(s) for and which card to discard and resolve as stress'
    ),
    'type' => 'activeplayer',
    'args' => 'argsPayHeats',
    'action' => 'stPayHeats',
    'possibleactions' => ['actPayHeats'],
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
    'possibleactions' => ['actDiscard', 'actRefresh'],
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
