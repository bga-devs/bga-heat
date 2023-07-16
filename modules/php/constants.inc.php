<?php
require_once 'gameoptions.inc.php';

/*
 * State constants
 */
const ST_GAME_SETUP = 1;
const ST_SETUP_BRANCH = 2;

const ST_SETUP_RACE = 9;
const ST_START_RACE = 10;

const ST_START_ROUND = 11;
const ST_PLANIFICATION = 12;
const ST_REVEAL = 13;
const ST_CHOOSE_SPEED = 14;
const ST_REACT = 15;
const ST_SLIPSTREAM = 16;
const ST_DISCARD = 17;

const ST_END_ROUND = 20;

// END
const ST_PRE_END_OF_GAME = 98;
const ST_END_GAME = 99;

const ST_GENERIC_NEXT_PLAYER = 97;

/*
 * Constructors
 */

const CONSTRUCTOR_BLACK = 0;
const CONSTRUCTOR_BLUE = 1;
const CONSTRUCTOR_GREEN = 2;
const CONSTRUCTOR_RED = 3;
const CONSTRUCTOR_GRAY = 4;
const CONSTRUCTOR_YELLOW = 5;
const CONSTRUCTORS = [
  CONSTRUCTOR_BLACK,
  CONSTRUCTOR_BLUE,
  CONSTRUCTOR_GREEN,
  CONSTRUCTOR_RED,
  CONSTRUCTOR_GRAY,
  CONSTRUCTOR_YELLOW,
];

/*
 * Cards
 */
const SPEED = 'speed';
const STARTING_UPGRADE = 'starting_upgrade';
const BASIC_UPGRADE = 'basic_upgrade';
const ADVANCED_UPGRADE = 'advanced_upgrade';

const HEAT = 'heat';
const STRESS = 'stress';

/*
 * Symbols
 */
const BOOST = 'boost';
const COOLDOWN = 'cooldown';
const REDUCE = 'reduce';
const SLIPSTREAM = 'slipstream';
const SCRAP = 'scrap';
const SALVAGE = 'salvage';
const DIRECT = 'direct';
const ACCELERATE = 'accelerate';
const REFRESH = 'refresh';
const ADJUST = 'adjust';
const ADRENALINE = 'adrenaline';
const HEATED_BOOST = 'heated-boost';

/*
 * MISC
 */

/******************
 ****** STATS ******
 ******************/

const STAT_POSITION = 11;
