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
    'transitions' => ['selection' => ST_INITIAL_SELECTION, 'done' => ST_FINISH_SETUP],
  ],

  ST_INITIAL_SELECTION => [
    'name' => 'initialSelection',
    'description' => clienttranslate('Waiting for others to choose the 6 cards they want to keep'),
    'descriptionmyturn' => clienttranslate('${you} must select the 6 cards you want to keep'),
    'type' => 'multipleactiveplayer',
    'args' => 'argsInitialSelection',
    'possibleactions' => ['actSelectCardsToDiscard', 'actCancelSelection'],
    'transitions' => ['done' => ST_FINISH_SETUP, 'zombiePass' => ST_FINISH_SETUP],
  ],

  ST_FINISH_SETUP => [
    'name' => 'finishSetup',
    'type' => 'game',
    'action' => 'stFinishSetup',
    'transitions' => [],
  ],

  //////////////////////////////
  //  _____
  // |_   _|   _ _ __ _ __
  //   | || | | | '__| '_ \
  //   | || |_| | |  | | | |
  //   |_| \__,_|_|  |_| |_|
  //////////////////////////////

  ST_TURNACTION => [
    'name' => 'turnAction',
    'description' => '',
    'type' => 'game',
    'action' => 'stTurnAction',
    'transitions' => [],
    'updateGameProgression' => true,
  ],

  ST_TIMELINE_PHASE => [
    'name' => 'timelinePhase',
    'type' => 'game',
    'action' => 'stAtomicAction',
  ],

  ST_DECLINE_PHASE => [
    'name' => 'declinePhase',
    'type' => 'game',
    'action' => 'stAtomicAction',
  ],

  ST_DECLINE_CARD => [
    'name' => 'declineCard',
    'type' => 'game',
    'action' => 'stAtomicAction',
  ],

  ////////////////////////////////////
  //  _____             _
  // | ____|_ __   __ _(_)_ __   ___
  // |  _| | '_ \ / _` | | '_ \ / _ \
  // | |___| | | | (_| | | | | |  __/
  // |_____|_| |_|\__, |_|_| |_|\___|
  //              |___/
  ////////////////////////////////////

  // Used just to change active player....
  ST_GENERIC_NEXT_PLAYER => [
    'name' => 'genericNextPlayer',
    'type' => 'game',
  ],

  ST_RESOLVE_STACK => [
    'name' => 'resolveStack',
    'type' => 'game',
    'action' => 'stResolveStack',
    'transitions' => [],
  ],

  ST_CONFIRM_TURN => [
    'name' => 'confirmTurn',
    'description' => clienttranslate('${actplayer} must confirm or restart their turn'),
    'descriptionmyturn' => clienttranslate('${you} must confirm or restart your turn'),
    'type' => 'activeplayer',
    'args' => 'argsConfirmTurn',
    'action' => 'stConfirmTurn',
    'possibleactions' => ['actConfirmTurn', 'actRestart'],
    'transitions' => [],
  ],

  ST_CONFIRM_PARTIAL_TURN => [
    'name' => 'confirmPartialTurn',
    'description' => clienttranslate('${actplayer} must confirm the switch of player'),
    'descriptionmyturn' => clienttranslate('${you} must confirm the switch of player. You will not be able to restart turn'),
    'type' => 'activeplayer',
    'args' => 'argsConfirmTurn',
    // 'action' => 'stConfirmPartialTurn',
    'possibleactions' => ['actConfirmPartialTurn', 'actRestart'],
  ],

  ST_RESOLVE_CHOICE => [
    'name' => 'resolveChoice',
    'description' => clienttranslate('${actplayer} must choose which effect to resolve'),
    'descriptionmyturn' => clienttranslate('${you} must choose which effect to resolve'),
    'descriptionxor' => clienttranslate('${actplayer} must choose exactly one effect'),
    'descriptionmyturnxor' => clienttranslate('${you} must choose exactly one effect'),
    'type' => 'activeplayer',
    'args' => 'argsResolveChoice',
    'action' => 'stResolveChoice',
    'possibleactions' => ['actChooseAction', 'actRestart'],
    'transitions' => [],
  ],

  ST_IMPOSSIBLE_MANDATORY_ACTION => [
    'name' => 'impossibleAction',
    'description' => clienttranslate('${actplayer} can\'t take the mandatory action and must restart his turn or exchange/cook'),
    'descriptionmyturn' => clienttranslate(
      '${you} can\'t take the mandatory action. Restart your turn or exchange/cook to make it possible'
    ),
    'type' => 'activeplayer',
    'args' => 'argsImpossibleAction',
    'possibleactions' => ['actRestart'],
  ],

  ////////////////////////////////////////////////////////////////////////////
  //     _   _                  _         _        _   _
  //    / \ | |_ ___  _ __ ___ (_) ___   / \   ___| |_(_) ___  _ __  ___
  //   / _ \| __/ _ \| '_ ` _ \| |/ __| / _ \ / __| __| |/ _ \| '_ \/ __|
  //  / ___ \ || (_) | | | | | | | (__ / ___ \ (__| |_| | (_) | | | \__ \
  // /_/   \_\__\___/|_| |_| |_|_|\___/_/   \_\___|\__|_|\___/|_| |_|___/
  //
  ////////////////////////////////////////////////////////////////////////////
  ST_CHOOSE_ACTION => [
    'name' => 'chooseAction',
    'type' => 'activeplayer',
    'description' => clienttranslate('${actplayer} must choose an action'),
    'descriptionmyturn' => clienttranslate('${you} must choose an action'),
    'args' => 'argsAtomicAction',
    'possibleactions' => ['actChooseAction', 'actRestart'],
  ],

  ST_CREATE => [
    'name' => 'create',
    'type' => 'activeplayer',
    'description' => clienttranslate('${actplayer} must choose a monument or an artifact to create'),
    'descriptionmyturn' => clienttranslate('${you} must choose a monument or an artifact to create'),
    'descriptionmyturnSelectSlot' => clienttranslate('${you} must choose a place for the selected monument'),
    'descriptionmyturnSelectDiscard' => clienttranslate('${you} must choose ${discard_number} card(s) to discard'),
    'descriptionmyturnConfirm' => clienttranslate('${you} must confirm creation'),
    'args' => 'argsAtomicAction',
    'possibleactions' => ['actCreate', 'actRestart'],
  ],

  ST_LEARN => [
    'name' => 'learn',
    'type' => 'activeplayer',
    'description' => clienttranslate('${actplayer} must choose a technology to learn'),
    'descriptionmyturn' => clienttranslate('${you} must choose a technology to learn'),
    'args' => 'argsAtomicAction',
    'possibleactions' => ['actLearn', 'actRestart'],
  ],

  ST_EXCAVATE => [
    'name' => 'excavate',
    'type' => 'activeplayer',
    'description' => clienttranslate('${actplayer} must choose cards in their past to rotate'),
    'descriptionmyturn' => clienttranslate('${you} must choose cards in your past to rotate'),
    'args' => 'argsAtomicAction',
    'possibleactions' => ['actExcavate', 'actRestart'],
  ],

  ST_ARCHIVE => [
    'name' => 'archive',
    'type' => 'activeplayer',
    'description' => clienttranslate('${actplayer} must choose cards to discard before removing <KNOWLEDGE> on their timeline'),
    'descriptionmyturn' => clienttranslate('${you} must choose cards to discard before removing <KNOWLEDGE> on your timeline'),
    'descriptionmyturnSelectDiscardTokens' => clienttranslate('${you} must choose ${discard_number} <KNOWLEDGE> to discard'),
    'descriptionmyturnConfirm' => clienttranslate('${you} must confirm archive'),
    'args' => 'argsAtomicAction',
    'possibleactions' => ['actArchive', 'actRestart'],
  ],

  ST_DRAW => [
    'name' => 'drawCard',
    'type' => 'game',
    'action' => 'stAtomicAction',
  ],

  ST_DISCARD_LOST_KNOWLEDGE => [
    'name' => 'discardLostKnowledge',
    'type' => 'game',
    'action' => 'stAtomicAction',
  ],

  ST_ACTIVATE_CARD => [
    'name' => 'activateCard',
    'type' => 'game',
    'action' => 'stAtomicAction',
  ],

  ST_REMOVE_KNOWLEDGE => [
    'name' => 'removeKnowledge',
    'type' => 'activeplayer',
    'description' => clienttranslate('${actplayer} must remove ${n} <KNOWLEDGE> on their timeline'),
    'descriptionmyturn' => clienttranslate('${you} must remove ${n} <KNOWLEDGE> on your timeline'),
    'args' => 'argsAtomicAction',
    'action' => 'stAtomicAction',
    'possibleactions' => ['actRemoveKnowledge', 'actRestart'],
  ],

  ST_DISCARD => [
    'name' => 'discard',
    'type' => 'activeplayer',
    'description' => clienttranslate('${actplayer} must choose ${n} card(s) to discard'),
    'descriptionmyturn' => clienttranslate('${you} must choose ${n} card(s) to discard'),
    'args' => 'argsAtomicAction',
    'possibleactions' => ['actDiscard', 'actRestart'],
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
