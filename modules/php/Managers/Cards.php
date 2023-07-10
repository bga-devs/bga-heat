<?php
namespace HEAT\Managers;

use BgaVisibleSystemException;
use HEAT\Core\Stats;
use HEAT\Core\Globals;
use HEAT\Core\Notifications;
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
  protected static $autoreshuffleCustom = ['deck' => 'discard'];

  protected static function cast($card)
  {
    return $card;
  }

  public static function getHand($cId)
  {
    return self::getInLocation("hand_$cId");
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
  public static function setupNewGame()
  {
    foreach (Constructors::getAll() as $cId => $constructor) {
      if ($constructor->isAI()) {
        continue;
      }

      $cards = [];

      // Speed cards
      $cards[] = ['type' => 101, 'n' => 3, 'location' => "deck_$cId"];
      $cards[] = ['type' => 102, 'n' => 3, 'location' => "deck_$cId"];
      $cards[] = ['type' => 103, 'n' => 3, 'location' => "deck_$cId"];
      $cards[] = ['type' => 104, 'n' => 3, 'location' => "deck_$cId"];

      // Starting upgrades : 0, 5, pesonalized Heat
      $cards[] = ['type' => 100, 'n' => 1, 'location' => "deck_$cId"];
      $cards[] = ['type' => 105, 'n' => 1, 'location' => "deck_$cId"];
      $cards[] = ['type' => 106, 'n' => 1, 'location' => "deck_$cId"];

      // Stress and heats
      $cards[] = ['type' => 110, 'n' => 3, 'location' => "deck_$cId"];
      $cards[] = ['type' => 111, 'n' => 6, 'location' => "engine_$cId"];

      // Create the cards
      self::create($cards, null);
      self::shuffle("deck_$cId");

      // Draw them
      static::pickForLocation(7, "deck_$cId", "hand_$cId");
    }
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
        'type' => $type,
        'speed' => $speed,
        'symbols' => $symbols,
        'text' => $text,
      ];
    };

    return [
      100 => $f(STARTING_UPGRADE, 0),
      101 => $f(SPEED, 1),
      102 => $f(SPEED, 2),
      103 => $f(SPEED, 3),
      104 => $f(SPEED, 4),
      105 => $f(STARTING_UPGRADE, 5),

      // 4 wheel drive
      1 => $f(BASIC_UPGRADE, 4, [PLUS => 1], clienttranslate('4 wheel drive')),
      2 => $f(BASIC_UPGRADE, null, [PLUS => 3], clienttranslate('4 wheel drive')),
      3 => $f(BASIC_UPGRADE, null, [PLUS => 1, COOLDOWN => 3], clienttranslate('4 wheel drive')),
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

      17 => $f(HEAT, null),

      // ADVANCED
      // Body
      18 => $f(ADVANCED_UPGRADE, 6, [REDUCE => 3, HEAT => 1], clienttranslate('Body')),
      19 => $f(ADVANCED_UPGRADE, 2, [REDUCE => 1, COOLDOWN => 1, SCRAP => 2], clienttranslate('Body')),
      20 => $f(ADVANCED_UPGRADE, 2, [REDUCE => 1, SLIPSTREAM => 1], clienttranslate('Body')),
      // Cooling systems
      21 => $f(ADVANCED_UPGRADE, 4, [SCRAP => 2, COOLDOWN => 1], clienttranslate('Cooling system')),
      // Fuel
      22 => $f(ADVANCED_UPGRADE, 2, [SALVAGE => 2], clienttranslate('Fuel')),
      23 => $f(ADVANCED_UPGRADE, 0, [PLUS => 1, SALVAGE => 2, COOLDOWN => 1], clienttranslate('Fuel')),
      // Gas pedal
      24 => $f(ADVANCED_UPGRADE, 1, [SCRAP => 1, DIRECT => 1], clienttranslate('Gas pedal')),
      25 => $f(ADVANCED_UPGRADE, 2, [SCRAP => 2, DIRECT => 1], clienttranslate('Gas pedal')),
      26 => $f(ADVANCED_UPGRADE, 3, [SCRAP => 3, DIRECT => 1], clienttranslate('Gas pedal')),
      27 => $f(ADVANCED_UPGRADE, 4, [HEAT => 1, COOLDOWN => 1, DIRECT => 1], clienttranslate('Gas pedal')),
      28 => $f(ADVANCED_UPGRADE, 1, [SCRAP => 1, SCRAP => 5, ACCELERATE => 1], clienttranslate('Gas pedal')),
      // R.P.M.
      29 => $f(ADVANCED_UPGRADE, 0, [PLUS => 1, SLIPSTREAM => 3], clienttranslate('R.P.M.')),
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
      41 => $f(ADVANCED_UPGRADE, 0, [ADJUST => 2, PLUS => 2], clienttranslate('Tires')),
      // Turbo charger
      42 => $f(ADVANCED_UPGRADE, 7, [HEAT => 2, COOLDOWN => 3], clienttranslate('Turbo charger')),
      43 => $f(ADVANCED_UPGRADE, 8, [HEAT => 1, SCRAP => 6], clienttranslate('Turbo charger')),
      // Wings
      44 => $f(ADVANCED_UPGRADE, 4, [HEAT => 1, SCRAP => 2, ADJUST => 2], clienttranslate('Wings')),
      45 => $f(ADVANCED_UPGRADE, 3, [HEAT => 1, SCRAP => 2, ADJUST => 2], clienttranslate('Wings')),
      46 => $f(ADVANCED_UPGRADE, 6, [HEAT => 2, ADJUST => 3], clienttranslate('Wings')),
      // 4 wheel drive
      47 => $f(ADVANCED_UPGRADE, 0, [PLUS => 1, ACCELERATE => 1], clienttranslate('4 wheel drive')),

      48 => $f(HEAT, null),
    ];
  }
}
