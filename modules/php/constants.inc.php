<?php
require_once 'gameoptions.inc.php';

/*
 * State constants
 */
const ST_GAME_SETUP = 1;
const ST_SETUP_BRANCH = 2;
const ST_UPLOAD_CIRCUIT = 3;
const ST_CONFIRM_END_OF_RACE = 4;
const ST_PROCEED_TO_NEXT_RACE = 5;

const ST_SETUP_RACE = 9;
const ST_PREPARE_GARAGE_DRAFT = 40;
const ST_DRAFT_GARAGE = 41;
const ST_DRAFT_GARAGE_SWAP = 42;
const ST_DRAFT_GARAGE_SNAKE_DISCARD = 44;
const ST_DRAW_SPONSORS = 43;
const ST_START_RACE = 10;

const ST_START_ROUND = 11;
const ST_PLANIFICATION = 12;
const ST_REVEAL = 13;
const ST_CHOOSE_SPEED = 14;
// Kept for not breaking ongoing tables
const ST_OLD_REACT = 15;
const ST_OLD_SALVAGE = 18;
const ST_OLD_PAY_HEATS = 19;
const ST_OLD_SUPER_COOL = 21;
// New code
const ST_REACT = 22;
const ST_SALVAGE = 23;
const ST_PAY_HEATS = 24;
const ST_SUPER_COOL = 25;

const ST_SLIPSTREAM = 16;
const ST_DISCARD = 17;

const ST_HIDDEN_PLANIFICATION = 40;

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
const CONSTRUCTOR_ORANGE = 6;
const CONSTRUCTOR_PURPLE = 7;
const CONSTRUCTORS = [
  CONSTRUCTOR_BLACK,
  CONSTRUCTOR_BLUE,
  CONSTRUCTOR_GREEN,
  CONSTRUCTOR_RED,
  CONSTRUCTOR_GRAY,
  CONSTRUCTOR_YELLOW,
  CONSTRUCTOR_ORANGE,
  CONSTRUCTOR_PURPLE,
];

/*
 * Cards
 */
const SPEED = 'speed';
const STARTING_UPGRADE = 'starting_upgrade';
const BASIC_UPGRADE = 'basic_upgrade';
const ADVANCED_UPGRADE = 'advanced_upgrade';
const SPONSOR = 'sponsor';

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
const SUPER_COOL = 'super-cool';
const DRAFT = 'draft';

/*
 * MISC
 */

const GEAR = 'gear';
const WEATHER = 'weather';

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

const FLAG_COMPUTE_PATHS = 1;
const FLAG_COMPUTE_HEAT_COSTS = 2;
const FLAG_IS_SLIPSTREAM = 4;

/*
 * CHAMPIONSHIP
 */
const EVENT_INAUGURATION = 1;
const EVENT_NEW_RECORD = 2;
const EVENT_STRIKE = 3;
const EVENT_RESTRICTIONS_LIFTED = 4;
const EVENT_RECORD_CROWDS = 5;
const EVENT_CORRUPTION = 6;
const EVENT_TITLE_SPONSOR = 7;
const EVENT_FIRST_LIVE_TV = 8;
const EVENT_SAFETY_REGULATIONS = 9;
const EVENT_FUTURE_UNKNOWN = 10;
// HR EXPANSION
const EVENT_GOING_GLOBAL = 11;
const EVENT_TURBULENT_WINDS = 12;
const EVENT_CHICANES = 13;
const EVENT_SUDDEN_RAIN = 14;
// TV EXPANSION
const EVENT_HOLD_TIGHT = 15;
const EVENT_SMILE_WAVE = 16;
const EVENT_TUNNEL_VISION = 17;
const EVENT_PRESSURE_COOKER = 18;

const EVENTS = [
  EVENT_INAUGURATION => ['sponsors' => 2, 'press' => [0]],
  EVENT_NEW_RECORD => ['sponsors' => 1, 'press' => [1]],
  EVENT_STRIKE => ['sponsors' => 1, 'press' => [2]],
  EVENT_RESTRICTIONS_LIFTED => ['sponsors' => 2, 'press' => [4]],
  EVENT_RECORD_CROWDS => ['sponsors' => 1, 'press' => [2, 4]],
  EVENT_CORRUPTION => ['sponsors' => 1, 'press' => [2]],
  EVENT_TITLE_SPONSOR => ['sponsors' => 3, 'press' => [0]],
  EVENT_FIRST_LIVE_TV => ['sponsors' => 1, 'press' => [1, 3]],
  EVENT_SAFETY_REGULATIONS => ['sponsors' => 1, 'press' => [3]],
  EVENT_FUTURE_UNKNOWN => ['sponsors' => 0, 'press' => [3]],
];

const EVENTS_EXP_HV = [
  EVENT_GOING_GLOBAL => ['sponsors' => 0, 'press' => [1, 2]],
  EVENT_TURBULENT_WINDS => ['sponsors' => 1, 'press' => [1]],
  EVENT_CHICANES => ['sponsors' => 1, 'press' => [2]],
  EVENT_SUDDEN_RAIN => ['sponsors' => 1, 'press' => []],
];

const EVENTS_EXP_TV = [
  EVENT_HOLD_TIGHT => ['sponsors' => 2, 'press' => [3]],
  EVENT_SMILE_WAVE => ['sponsors' => 0, 'press' => [2]],
  EVENT_TUNNEL_VISION => ['sponsors' => 0, 'press' => [0, 2]],
  EVENT_PRESSURE_COOKER => ['sponsors' => 1, 'press' => [1]],
];


const CHAMPIONSHIP_SEASONS = [
  \HEAT\OPTION_CHAMPIONSHIP_SEASON_61 => [
    'name' => 1961,
    'circuits' => [
      ['circuit' => 'gb', 'event' => EVENT_INAUGURATION],
      ['circuit' => 'usa', 'event' => EVENT_NEW_RECORD],
      ['circuit' => 'italia', 'event' => EVENT_STRIKE],
    ],
  ],
  \HEAT\OPTION_CHAMPIONSHIP_SEASON_62 => [
    'name' => 1962,
    'circuits' => [
      ['circuit' => 'italia', 'event' => EVENT_RESTRICTIONS_LIFTED],
      ['circuit' => 'gb', 'event' => EVENT_RECORD_CROWDS],
      ['circuit' => 'france', 'event' => EVENT_CORRUPTION],
    ],
  ],
  \HEAT\OPTION_CHAMPIONSHIP_SEASON_63 => [
    'name' => 1963,
    'circuits' => [
      ['circuit' => 'usa', 'event' => EVENT_TITLE_SPONSOR],
      ['circuit' => 'gb', 'event' => EVENT_FIRST_LIVE_TV],
      ['circuit' => 'france', 'event' => EVENT_SAFETY_REGULATIONS],
      ['circuit' => 'italia', 'event' => EVENT_FUTURE_UNKNOWN],
    ],
  ],
  \HEAT\OPTION_CHAMPIONSHIP_SEASON_64 => [
    'name' => 1964,
    'circuits' => [
      ['circuit' => 'japan', 'event' => EVENT_GOING_GLOBAL],
      ['circuit' => 'france', 'event' => EVENT_TURBULENT_WINDS],
      ['circuit' => 'mexico', 'event' => EVENT_CHICANES],
      ['circuit' => 'japan', 'event' => EVENT_SUDDEN_RAIN],
    ],
  ],
  \HEAT\OPTION_CHAMPIONSHIP_SEASON_65 => [
    'name' => 1965,
    'circuits' => [
      ['circuit' => 'gb', 'event' => EVENT_HOLD_TIGHT],
      ['circuit' => 'usa', 'event' => EVENT_SMILE_WAVE],
      ['circuit' => 'espana', 'event' => EVENT_TUNNEL_VISION],
      ['circuit' => 'nederland', 'event' => EVENT_PRESSURE_COOKER],
    ],
  ],
];

const CIRCUITS = ['usa', 'gb', 'italia', 'france'];
const CIRCUITS_EXP_HV = ['japan', 'mexico'];
const CIRCUITS_EXP_TV = ['nederland', 'espana'];

/******************
 ****** STATS ******
 ******************/

const STAT_POSITION = 11;
const STAT_POSITION_END = 12;
const STAT_ROUNDS = 13;
const STAT_ROUNDS_FIRST = 14;
const STAT_ROUNDS_1 = 15;
const STAT_ROUNDS_2 = 16;
const STAT_ROUNDS_3 = 17;
const STAT_ROUNDS_4 = 18;
const STAT_ROUNDS_ADRENALINE = 19;
const STAT_ADRENALINE_GAIN = 20;
const STAT_SPINOUT = 21;
const STAT_SPINOUT_STRESS = 22;
const STAT_HEAT_LEFT = 23;
const STAT_HEAT_PAYED = 24;
const STAT_HEAT_PAYED_GEAR_UP = 25;
const STAT_HEAT_PAYED_GEAR_DOWN = 26;
const STAT_BOOST = 27;
const STAT_OVERSPEED_CORNERS = 28;
const STAT_SLIPSTREAM_GAINS = 29;
const STAT_EXTRA_DISCARD = 30;
const STAT_STRESS_PLAYED = 31;
const STAT_CIRCUIT_TIME = 32;
