<?php
namespace AK\Managers;

use BgaVisibleSystemException;
use AK\Core\Stats;
use AK\Core\Globals;
use AK\Core\Notifications;
use AK\Helpers\UserException;
use AK\Helpers\Collection;

/* Class to manage all the cards for Ancient Knowledge */

class Cards extends \AK\Helpers\Pieces
{
  protected static $table = 'cards';
  protected static $prefix = 'card_';
  protected static $customFields = ['player_id', 'knowledge'];
  protected static $autoIncrement = false;
  protected static $autoremovePrefix = false;
  protected static $autoreshuffle = true;
  protected static $autoreshuffleCustom = ['deck' => 'discard'];

  protected static function cast($card)
  {
    return self::getCardInstance($card['card_id'], $card);
  }

  public static function getCardInstance($id, $data = null)
  {
    $t = explode('_', $id);
    // First part before _ specify the type and the numbering
    $prefixes = [
      'C' => 'Cities',
      'M' => 'Megaliths',
      'P' => 'Pyramids',
      'A' => 'Artefacts',
    ];
    $prefix = $prefixes[$t[0][0]];
    $className = "\AK\Cards\\$prefix\\$id";
    return new $className($data);
  }

  public static function getUiData()
  {
    return self::getInLocation('timeline-%');
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
  public static function setupNewGame($players, $options)
  {
    // Load list of cards
    include dirname(__FILE__) . '/../Cards/list.inc.php';

    // Randomly assign a starting hand to each player
    $isPreMadeHands = ($options[OPTION_FIRST_GAME] ?? 1) == OPTION_FIRST_GAME_ENABLED;
    if ($isPreMadeHands) {
      $pIds = array_keys($players);
      shuffle($pIds);
      $hands = [1, 2, 3, 4];
      shuffle($hands);

      $mapping = [];
      foreach ($pIds as $i => $pId) {
        $mapping[$hands[$i]] = $pId;
      }
    }

    // Create cards
    foreach ($cardIds as $cId) {
      $data = [
        'id' => $cId,
        'location' => 'deck',
      ];

      if ($isPreMadeHands) {
        $card = self::getCardInstance($cId);
        $n = $card->getStartingHand();
        if (array_key_exists($n, $mapping)) {
          $data['location'] = 'hand';
          $data['player_id'] = $mapping[$n];
        }
      }

      $cards[$cId] = $data;
    }

    // Create the cards
    self::create($cards, null);
    self::shuffle('deck');
  }

  public static function initialDraw()
  {
    foreach (Players::getAll() as $pId => $player) {
      $cards = self::draw($player, 10);
      Notifications::drawCards($player, $cards);
    }
  }

  public static function extraInitialDraw()
  {
    $turnOrder = Players::getTurnOrder();
    for ($i = 2; $i < count($turnOrder); $i++) {
      $cards = self::draw($turnOrder[$i], 1);
      Notifications::drawCards($player, $cards);
    }
  }

  public static function discard($cardIds, $discard = 'discard')
  {
    return self::move($cardIds, $discard);
  }

  public static function rotate($cardIds)
  {
    return self::setState($cardIds, 1);
  }

  ///////////////////////////////////////////////
  //    ____                                 _
  //   |  _ \ ___ _ __ ___  ___  _ __   __ _| |
  //   | |_) / _ \ '__/ __|/ _ \| '_ \ / _` | |
  //   |  __/  __/ |  \__ \ (_) | | | | (_| | |
  //   |_|   \___|_|  |___/\___/|_| |_|\__,_|_|
  ///////////////////////////////////////////////

  /**
   * Draw cards from the deck
   */
  public static function draw($player, $n = 1, $fromLocation = 'deck', $toLocation = 'hand')
  {
    $cards = self::pickForLocation($n, $fromLocation, $toLocation);
    foreach ($cards as $cId => &$c) {
      self::insertOnTop($cId, $toLocation);
      $c->setPId($player->getId());
    }
    return $cards;
  }

  /**
   * Get all cards in hand of player matching the given type
   */
  public static function getHand($pId, $type = null)
  {
    return self::getFilteredQuery($pId, 'hand')
      ->orderBy(['card_state', 'ASC'])
      ->get()
      ->filter(function ($card) use ($type) {
        return $type == null || $card->getType() == $type;
      });
  }

  /**
   * Get all cards in timeline
   */
  public static function getTimeline($pId, $type = null)
  {
    return self::getFilteredQuery($pId, 'timeline-%')
      ->orderBy('card_location')
      ->get()
      ->filter(function ($card) use ($type) {
        return $type == null || $card->getType() == $type;
      });
  }

  public static function getOnTimelineSpace($pId, $space)
  {
    return self::getFilteredQuery($pId, "timeline-$space[0]-$space[1]")
      ->get()
      ->first();
  }

  /**
   * Get all artefacts played
   */
  public static function getArtefacts($pId)
  {
    return self::getFilteredQuery($pId, 'artefact-%')->get();
  }

  /**
   * Check whether a player played a specific card
   */
  public static function hasPlayedCard($pId, $id)
  {
    $card = self::getSingle($id, false);
    return !is_null($card) && $card->isPlayed() && $card->getPId() == $pId;
  }

  /**
   * Get all cards in past
   */
  public static function getPast($pId, $type = null)
  {
    return self::getFilteredQuery($pId, 'past')
      ->get()
      ->filter(function ($card) use ($type) {
        return $type == null || $card->getType() == $type;
      });
  }
}
