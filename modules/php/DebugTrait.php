<?php

namespace Bga\Games\Heat;

use Bga\Games\Heat\Managers\Players;
use Bga\Games\Heat\Managers\Constructors;
use Bga\Games\Heat\Managers\Cards;
use Bga\Games\Heat\Core\Globals;
use Bga\Games\Heat\Core\Game;
use Bga\Games\Heat\Core\Notifications;
use Bga\Games\Heat\Helpers\Utils;
use Bga\Games\Heat\Helpers\Log;
use Bga\Games\Heat\Helpers\Collection;
use Bga\Games\Heat\Models\Constructor;

trait DebugTrait
{
  function debug_undo(int $stepNumber)
  {
    Log::undoToStep($stepNumber);
  }

  function debug_newReact()
  {
    $constructor = Constructors::getOfPlayer((int) self::getCurrentPlayerId());
    $cId = $constructor->getId();
    $cardTypes = [3, 4, 7, 8, 11, 12, 14, 19, 23, 24, 27, 28, 29, 31, 32, 35, 36, 40, 43, 46, 47, 49, 54, 55, 56, 59];
    $cards = [];
    foreach ($cardTypes as $cardType) {
      $cards[] = ['type' => $cardType, 'nbr' => 1, 'location' => "hand-$cId"];
    }
    Cards::create($cards);
  }

  function debug_eventCookerPressure()
  {
    $this->stProceedToNextRace();
    $this->stProceedToNextRace();
    $this->stProceedToNextRace();
  }


  function debug_tp()
  {
    Globals::loadCircuitDatas();
    // $constructor = Constructors::getActive();
    // $constructor->setCarCell(301);
    // $this->actReact(DIRECT, [120]);

    // $circuit = $this->getCircuit();

    // // Draw a card
    // $weatherCard = bga_rand(0, 5);
    // // Draw tokens
    // $tokens = [0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 5, 5];
    // shuffle($tokens);
    // $cornerTokens = [];
    // foreach ($circuit->getCorners() as $cornerPos => $maxSpeed) {
    //   if (!$circuit->isChicane($cornerPos)) {
    //     $cornerTokens[$cornerPos] = array_shift($tokens);
    //   }
    // }
    // // Simulate duplicated tokens for chicane, 
    // //  but remove sector token from the first corner to make sure sector in between the two corners has nothing on it
    // foreach ($circuit->getCorners() as $cornerPos => $maxSpeed) {
    //   if ($circuit->isChicane($cornerPos)) {
    //     $mainCornerPos = $circuit->getChicaneMainCorner($cornerPos);
    //     $cornerTokens[$cornerPos] = $cornerTokens[$mainCornerPos];
    //     if (in_array($cornerTokens[$cornerPos], [ROAD_CONDITION_WEATHER, ROAD_CONDITION_FREE_BOOST, ROAD_CONDITION_INCREASE_SLIPSTREAM])) {
    //       $cornerTokens[$mainCornerPos] = null;
    //     }
    //   }
    // }

    // var_dump([
    //   'card' => $weatherCard,
    //   'tokens' => $cornerTokens,
    // ]);
    // Globals::setWeather([
    //   'card' => $weatherCard,
    //   'tokens' => $cornerTokens,
    // ]);

    // $round = Globals::getDraftRound();
    // $turnOrder = Constructors::getTurnOrder();
    // var_dump($turnOrder);
    // Utils::filter($turnOrder, function ($cId) {
    //   return !Constructors::get($cId)->isAI();
    // });

    // if ($round != 2) {
    //   $turnOrder = array_reverse($turnOrder);
    // }
    // var_dump($turnOrder);

    //    $this->actChooseUpgrade(13);
    //    var_dump($this->getCircuit()->isFree(7, 1));
  }

  function debug_move($speed)
  {
    $constructor = Constructors::getActive();
    var_dump($this->getCircuit()->getReachedCell($constructor, $speed));
  }

  function debug_discard()
  {
    $this->actDiscard([]);
  }

  function debug_discardDeck()
  {
    $this->DbQuery("UPDATE `cards` set card_location = REPLACE(card_location, 'deck', 'discard')");
  }

  function debug_discardEngine()
  {
    $this->DbQuery("UPDATE `cards` set card_location = REPLACE(card_location, 'engine', 'discard')");
  }

  function debug_endRaceExcept(int $constructorId = -1)
  {
    if ($constructorId === -1) {
      $constructor = Constructors::getActive();
      $constructorId = $constructor->getId();
    }
    $this->DbQuery("UPDATE constructors SET `turn` = 3 WHERE `id` <> $constructorId");
  }

  function debug_endRace(/*?int $constructorId = null*/)
  {
    $sql = 'UPDATE constructors SET `turn` = 3';
    /*if ($constructorId != null) {
      $sql .= " WHERE `id` = $constructorId";
    }*/
    $this->DbQuery($sql);
  }

  function debug_clutterHand(int $constructorId = -1)
  {
    if ($constructorId === -1) {
      $constructor = Constructors::getActive();
      $constructorId = $constructor->getId();
    }
    $this->DbQuery("UPDATE constructors SET `gear` = 4 WHERE id = $constructorId");
    $this->DbQuery("UPDATE `cards` SET `type` = 111 WHERE card_location = 'hand-$constructorId'");
  }

  function debug_addHeats(int $constructorId = -1, int $heats = 4)
  {
    if ($constructorId === -1) {
      $constructor = Constructors::getActive();
      $constructorId = $constructor->getId();
    }
    $this->DbQuery("UPDATE `cards` SET `type` = 111 WHERE card_location = 'hand-$constructorId' LIMIT $heats");
  }

  function debug_setPodium(?int $constructorId = null, int $rank)
  {
    $this->DbQuery("UPDATE constructors SET `turn` = 3, car_cell = -$rank WHERE `id` = $constructorId");
  }

  // discardAll(11, 1)
  /*function discardAll($n = 11, $constructorId = null)
  {
    $constructor = $constructorId === null ? Constructors::getActive() : Constructors::get($constructorId);
    $cards = $constructor->scrapCards($n);
    Notifications::scrapCards($constructor, $cards);
  }*/
  function debug_refill($constructorId)
  {
    $constructor = Constructors::get($constructorId);
    $this->DbQuery("UPDATE `cards` set card_location = REPLACE(card_location, 'deck', 'discard')");
    $this->DbQuery("UPDATE `cards` set card_location = REPLACE(card_location, 'inplay', 'discard')");
    $this->DbQuery("UPDATE `cards` set card_location = REPLACE(card_location, 'hand', 'discard')");
    // Replenish
    Cards::fillHand($constructor);
  }

  /*
   * loadBugSQL: in studio, this is one of the URLs triggered by loadBug() above
   */
  /*public function loadBugReportSQL(int $reportId, array $studioPlayers): void
  {
    $prodPlayers = $this->getObjectListFromDb("SELECT `player_id` FROM `player`", true);
    $prodCount = count($prodPlayers);
    $studioCount = count($studioPlayers);
    if ($prodCount != $studioCount) {
        throw new BgaVisibleSystemException("Incorrect player count (bug report has $prodCount players, studio table has $studioCount players)");
    }

    // Change for your game
    // We are setting the current state to match the start of a player's turn if it's already game over
    $sql = ['UPDATE global SET global_value='.ST_DRAFT_GARAGE_SNAKE_DISCARD.' WHERE global_id=1 AND global_value=99'];
    foreach ($prodPlayers as $index => $prodId) {
      $studioId = $studioPlayers[$index];

      // All games can keep this SQL
      $sql[] = "UPDATE player SET player_id=$studioId WHERE player_id=$prodId";
      $sql[] = "UPDATE global SET global_value=$studioId WHERE global_value=$prodId";
      $sql[] = "UPDATE stats SET stats_player_id=$studioId WHERE stats_player_id=$prodId";

      // Add game-specific SQL update the tables for your game
      $sql[] = "UPDATE constructors SET player_id=$studioId WHERE player_id=$prodId";

      // This could be improved, it assumes you had sequential studio accounts before loading
      // e.g., quietmint0, quietmint1, quietmint2, etc. are at the table
      $studioId++;
    }

    foreach ($sql as $q) {
      $this->DbQuery($q);
    }
  }*/
}
