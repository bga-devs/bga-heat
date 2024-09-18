<?php

namespace HEAT;

use HEAT\Managers\Players;
use HEAT\Managers\Constructors;
use HEAT\Managers\Cards;
use HEAT\Core\Globals;
use HEAT\Core\Game;
use HEAT\Core\Notifications;
use HEAT\Helpers\Utils;
use HEAT\Helpers\Log;
use HEAT\Helpers\Collection;

trait DebugTrait
{
  function debug_tp()
  {
    $round = Globals::getDraftRound();
    $turnOrder = Constructors::getTurnOrder();
    var_dump($turnOrder);
    Utils::filter($turnOrder, function ($cId) {
      return !Constructors::get($cId)->isAI();
    });

    if ($round != 2) {
      $turnOrder = array_reverse($turnOrder);
    }
    var_dump($turnOrder);

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
