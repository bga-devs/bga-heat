<?php
namespace HEAT\Managers;

use BgaVisibleSystemException;
use HEAT\Core\Stats;
use HEAT\Core\Globals;
use HEAT\Core\Notifications;
use HEAT\Core\Game;
use HEAT\Helpers\UserException;
use HEAT\Helpers\Collection;
use HEAT\Managers\Constructors;

/* Class to manage all the cards for Heat */

class Cards extends \HEAT\Helpers\Pieces
{
  protected static $table = 'cards';
  protected static $prefix = 'card_';
  protected static $customFields = ['type'];
  protected static $autoreshuffle = true;
  protected static $autoreshuffleCustom = [];

  protected static function cast($card)
  {
    return array_merge($card, self::getDatas()[$card['type']]);
  }

  public static function getDeck($cId)
  {
    return self::getInLocation(['deck', $cId]);
  }

  public static function getHand($cId)
  {
    return self::getInLocation(['hand', $cId]);
  }

  public static function getInPlay($cId)
  {
    return self::getInLocation(['inplay', $cId]);
  }

  public static function getDiscard($cId)
  {
    return self::getInLocationOrdered(['discard', $cId]);
  }

  public static function getEngine($cId)
  {
    return self::getInLocation(['engine', $cId]);
  }

  public function draw($cId, $n)
  {
    static::$autoreshuffleCustom["deck-$cId"] = "discard-$cId";
    return static::pickForLocation($n, "deck-$cId", "hand-$cId");
  }

  public function flipForBoost($cId)
  {
    static::$autoreshuffleCustom["deck-$cId"] = "discard-$cId";
    return static::pickOneForLocation("deck-$cId", "discard-$cId");
  }

  public function scrap($cId)
  {
    static::$autoreshuffleCustom["deck-$cId"] = "discard-$cId";
    return static::pickOneForLocation("deck-$cId", "discard-$cId");
  }

  ///////////////////////////////////
  //  ____       _
  // / ___|  ___| |_ _   _ _ __
  // \___ \ / _ \ __| | | | '_ \
  //  ___) |  __/ |_| |_| | |_) |
  // |____/ \___|\__|\__,_| .__/
  //                      |_|
  ///////////////////////////////////

  /* Creation of the cards */
  public static function setupNewGame($options)
  {
    $cards = [];

    foreach (Constructors::getAll() as $cId => $constructor) {
      if ($constructor->isAI()) {
        continue;
      }

      // Speed cards
      $cards[] = ['type' => 101, 'nbr' => 3, 'location' => "deck-$cId"];
      $cards[] = ['type' => 102, 'nbr' => 3, 'location' => "deck-$cId"];
      $cards[] = ['type' => 103, 'nbr' => 3, 'location' => "deck-$cId"];
      $cards[] = ['type' => 104, 'nbr' => 3, 'location' => "deck-$cId"];

      if ($options[\HEAT\OPTION_GARAGE_MODULE] == \HEAT\OPTION_DISABLED) {
        // Starting upgrades : 0, 5, pesonalized Heat
        $cards[] = ['type' => 100, 'nbr' => 1, 'location' => "deck-$cId"];
        $cards[] = ['type' => 105, 'nbr' => 1, 'location' => "deck-$cId"];
        $cards[] = ['type' => 106, 'nbr' => 1, 'location' => "deck-$cId"];
      }
    }

    // Create deck of upgrades
    $garage = $options[\HEAT\OPTION_GARAGE_MODULE];
    if ($garage != \HEAT\OPTION_DISABLED) {
      $withAdvanced = in_array($garage, [\HEAT\OPTION_GARAGE_ADVANCED, \HEAT\OPTION_GARAGE_MIXED]);
      $withBasic = in_array($garage, [\HEAT\OPTION_GARAGE_BASIC, \HEAT\OPTION_GARAGE_MIXED]);
      for ($i = 1; $i <= 48; $i++) {
        $advanced = $i >= 18;
        if ((!$advanced && $withBasic) || ($advanced && $withAdvanced)) {
          $cards[] = ['type' => $i, 'nbr' => 1, 'location' => 'upgrades'];
        }
      }
    }

    // Create the cards
    self::create($cards, null);
    self::shuffle('upgrades');

    // Draw them if random mode is selected
    if ($options[\HEAT\OPTION_GARAGE_CHOICE] == \HEAT\OPTION_GARAGE_RANDOM) {
      foreach (Constructors::getAll() as $cId => $constructor) {
        if ($constructor->isAI()) {
          continue;
        }
        static::pickForLocation(3, 'upgrades', "deck-$cId");
      }
    }
  }

  public static function setupRace()
  {
    $nStress = Game::get()
      ->getCircuit()
      ->getStressCards();
    $nHeat = Game::get()
      ->getCircuit()
      ->getHeatCards();

    $cards = [];
    foreach (Constructors::getAll() as $cId => $constructor) {
      if ($constructor->isAI()) {
        continue;
      }

      // Stress and heats
      $cards[] = ['type' => 110, 'nbr' => $nStress, 'location' => "deck-$cId"];
      $cards[] = ['type' => 111, 'nbr' => $nHeat, 'location' => "engine-$cId"];
    }

    self::create($cards, null);
    //    Notifications::setupRace($cards, $nStress, $nHeat);
  }

  public static function fillHand($constructor)
  {
    $nCards = $constructor->getHand()->count();
    $nToDraw = Game::get()->getHandSizeLimit() - $nCards;
    if ($nToDraw == 0) {
      return;
    }
    $cards = Cards::draw($constructor->getId(), $nToDraw);
    Notifications::draw($constructor, $cards);
  }

  public static function addStress($constructor, $n)
  {
    $cId = $constructor->getId();
    $cards = [];
    $cards[] = ['type' => 110, 'nbr' => $n, 'location' => "hand-$cId"];
    return self::create($cards, null);
  }

  ////////////////////////////////
  //  ____        _
  // |  _ \  __ _| |_ __ _ ___
  // | | | |/ _` | __/ _` / __|
  // | |_| | (_| | || (_| \__ \
  // |____/ \__,_|\__\__,_|___/
  ////////////////////////////////
  public function getDatas()
  {
    $f = function ($type, $speed, $symbols = [], $text = '') {
      return [
        'effect' => $type,
        'speed' => $speed,
        'symbols' => $symbols,
        'text' => $text,
      ];
    };

    return [
      // Personalized card
      100 => $f(STARTING_UPGRADE, 0),
      101 => $f(SPEED, 1),
      102 => $f(SPEED, 2),
      103 => $f(SPEED, 3),
      104 => $f(SPEED, 4),
      105 => $f(STARTING_UPGRADE, 5),
      106 => $f(HEAT, 0),

      // Generic stress and heats
      110 => $f(STRESS, 0, [BOOST => 1]),
      111 => $f(HEAT, 0),

      // 4 wheel drive
      1 => $f(BASIC_UPGRADE, 4, [BOOST => 1], clienttranslate('4 wheel drive')),
      2 => $f(BASIC_UPGRADE, 0, [BOOST => 3], clienttranslate('4 wheel drive')),
      3 => $f(BASIC_UPGRADE, 0, [BOOST => 1, COOLDOWN => 3], clienttranslate('4 wheel drive')),
      // Body
      4 => $f(BASIC_UPGRADE, 3, [REDUCE => 2], clienttranslate('Body')),
      5 => $f(BASIC_UPGRADE, 5, [REDUCE => 1], clienttranslate('Body')),
      6 => $f(BASIC_UPGRADE, 1, [REDUCE => 3], clienttranslate('Body')),
      // Brakes
      7 => $f(BASIC_UPGRADE, [1, 2, 3, 4], [HEAT => 1], clienttranslate('Brakes')),
      8 => $f(BASIC_UPGRADE, [1, 3], [], clienttranslate('Brakes')),
      9 => $f(BASIC_UPGRADE, [2, 4], [], clienttranslate('Brakes')),
      10 => $f(BASIC_UPGRADE, [1, 5], [], clienttranslate('Brakes')),
      // Cooling systems
      11 => $f(BASIC_UPGRADE, 6, [HEAT => 1, COOLDOWN => 1], clienttranslate('Cooling system')),
      12 => $f(BASIC_UPGRADE, 1, [COOLDOWN => 2], clienttranslate('Cooling system')),
      13 => $f(BASIC_UPGRADE, 3, [COOLDOWN => 1], clienttranslate('Cooling system')),
      // R.P.M.
      14 => $f(BASIC_UPGRADE, 1, [SLIPSTREAM => 2], clienttranslate('R.P.M.')),
      15 => $f(BASIC_UPGRADE, 2, [SLIPSTREAM => 2], clienttranslate('R.P.M.')),
      16 => $f(BASIC_UPGRADE, 3, [SLIPSTREAM => 2], clienttranslate('R.P.M.')),

      17 => $f(HEAT, 0),

      // ADVANCED
      // Body
      18 => $f(ADVANCED_UPGRADE, 6, [REDUCE => 3, HEAT => 1], clienttranslate('Body')),
      19 => $f(ADVANCED_UPGRADE, 2, [REDUCE => 1, COOLDOWN => 1, SCRAP => 2], clienttranslate('Body')),
      20 => $f(ADVANCED_UPGRADE, 2, [REDUCE => 1, SLIPSTREAM => 1], clienttranslate('Body')),
      // Cooling systems
      21 => $f(ADVANCED_UPGRADE, 4, [SCRAP => 2, COOLDOWN => 1], clienttranslate('Cooling system')),
      // Fuel
      22 => $f(ADVANCED_UPGRADE, 2, [SALVAGE => 2], clienttranslate('Fuel')),
      23 => $f(ADVANCED_UPGRADE, 0, [BOOST => 1, SALVAGE => 2, COOLDOWN => 1], clienttranslate('Fuel')),
      // Gas pedal
      24 => $f(ADVANCED_UPGRADE, 1, [SCRAP => 1, DIRECT => 1], clienttranslate('Gas pedal')),
      25 => $f(ADVANCED_UPGRADE, 2, [SCRAP => 2, DIRECT => 1], clienttranslate('Gas pedal')),
      26 => $f(ADVANCED_UPGRADE, 3, [SCRAP => 3, DIRECT => 1], clienttranslate('Gas pedal')),
      27 => $f(ADVANCED_UPGRADE, 4, [HEAT => 1, COOLDOWN => 1, DIRECT => 1], clienttranslate('Gas pedal')),
      28 => $f(ADVANCED_UPGRADE, 1, [SCRAP => 1, SCRAP => 5, ACCELERATE => 1], clienttranslate('Gas pedal')),
      // R.P.M.
      29 => $f(ADVANCED_UPGRADE, 0, [BOOST => 1, SLIPSTREAM => 3], clienttranslate('R.P.M.')),
      30 => $f(ADVANCED_UPGRADE, 1, [HEAT => 1, SLIPSTREAM => 3], clienttranslate('R.P.M.')),
      31 => $f(ADVANCED_UPGRADE, [1, 2], [SLIPSTREAM => 1], clienttranslate('R.P.M.')),
      // Suspension
      32 => $f(ADVANCED_UPGRADE, 2, [REDUCE => 1, REFRESH => 1], clienttranslate('Suspension')),
      33 => $f(ADVANCED_UPGRADE, 2, [COOLDOWN => 1, REFRESH => 1], clienttranslate('Suspension')),
      34 => $f(ADVANCED_UPGRADE, 4, [REFRESH => 1], clienttranslate('Suspension')),
      35 => $f(ADVANCED_UPGRADE, 1, [SLIPSTREAM => 1, REFRESH => 1], clienttranslate('Suspension')),
      // Tires
      36 => $f(ADVANCED_UPGRADE, 2, [ADJUST => -1, COOLDOWN => 3], clienttranslate('Tires')),
      37 => $f(ADVANCED_UPGRADE, 1, [ADJUST => 1, SCRAP => 2], clienttranslate('Tires')),
      38 => $f(ADVANCED_UPGRADE, 2, [ADJUST => 1, SCRAP => 2], clienttranslate('Tires')),
      39 => $f(ADVANCED_UPGRADE, 3, [ADJUST => -1, COOLDOWN => 2], clienttranslate('Tires')),
      40 => $f(ADVANCED_UPGRADE, 0, [ADJUST => 1, COOLDOWN => 1, SLIPSTREAM => 1], clienttranslate('Tires')),
      41 => $f(ADVANCED_UPGRADE, 0, [ADJUST => 2, BOOST => 2], clienttranslate('Tires')),
      // Turbo charger
      42 => $f(ADVANCED_UPGRADE, 7, [HEAT => 2, COOLDOWN => 3], clienttranslate('Turbo charger')),
      43 => $f(ADVANCED_UPGRADE, 8, [HEAT => 1, SCRAP => 6], clienttranslate('Turbo charger')),
      // Wings
      44 => $f(ADVANCED_UPGRADE, 4, [HEAT => 1, SCRAP => 2, ADJUST => 2], clienttranslate('Wings')),
      45 => $f(ADVANCED_UPGRADE, 3, [HEAT => 1, SCRAP => 2, ADJUST => 2], clienttranslate('Wings')),
      46 => $f(ADVANCED_UPGRADE, 6, [HEAT => 2, ADJUST => 3], clienttranslate('Wings')),
      // 4 wheel drive
      47 => $f(ADVANCED_UPGRADE, 0, [BOOST => 1, ACCELERATE => 1], clienttranslate('4 wheel drive')),

      48 => $f(HEAT, 0),
    ];
  }
}
