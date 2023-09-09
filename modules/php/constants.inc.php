<?php
require_once 'gameoptions.inc.php';

/*
 * State constants
 */
const ST_GAME_SETUP = 1;
const ST_SETUP_BRANCH = 2;

const ST_SETUP_RACE = 9;
const ST_PREPARE_GARAGE_DRAFT = 40;
const ST_DRAFT_GARAGE = 41;
const ST_START_RACE = 10;

const ST_START_ROUND = 11;
const ST_PLANIFICATION = 12;
const ST_REVEAL = 13;
const ST_CHOOSE_SPEED = 14;
const ST_REACT = 15;
const ST_SLIPSTREAM = 16;
const ST_DISCARD = 17;

const ST_SALVAGE = 18;

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

const WEATHER_CLOUD = 0;
const WEATHER_FOG = 1;
const WEATHER_STORM = 2;
const WEATHER_SNOW = 3;
const WEATHER_RAIN = 4;
const WEATHER_SUN = 5;

const ROAD_CONDITION_WEATHER = 0;
const ROAD_CONDITION_MORE_HEAT = 1;
const ROAD_CONDITION_REDUCE_SPEED = 2;
const ROAD_CONDITION_INCREASE_SPEED = 3;
const ROAD_CONDITION_FREE_BOOST = 4;
const ROAD_CONDITION_INCREASE_SLIPSTREAM = 5;

// Road condition tokens from weather card
const ROAD_CONDITION_NO_COOLDOWN = 100;
const ROAD_CONDITION_NO_SLIPSTREAM = 101;
const ROAD_CONDITION_SLIPSTREAM_BOOST = 102;
const ROAD_CONDITION_COOLING_BONUS = 103;

/******************
 ****** STATS ******
 ******************/

const STAT_POSITION = 11;
