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

const BLACK = 0;
const BLUE = 1;
const GREEN = 2;
const RED = 3;
const GRAY = 4;
const YELLOW = 5;

class LegendCards
{
  public static function setupNewGame()
  {
    Globals::setLegendCard(-1);
    if (Globals::isLegend()) {
      self::reshuffle();
    }
  }

  public static function getCurrentCard()
  {
    if (!Globals::isLegend()) {
      return null;
    }
    $cardId = Globals::getLegendCard();
    if ($cardId == -1) {
      return null;
    } else {
      return self::$cards[$cardId];
    }
  }

  public function getCurrentCardInfos($constructor)
  {
    $cId = $constructor->getId();
    $card = self::getCurrentCard();
    foreach ($card as $slot => $t) {
      if (array_key_exists($cId, $t)) {
        return [$slot, $t[$cId]];
      }
    }

    die('SHOULD NOT HAPPEN');
  }

  public static function drawIfNeeded()
  {
    if (Globals::isLegendCardDrawn()) {
      return;
    }
    $ids = Globals::getLegendCards();
    if (empty($ids)) {
      self::reshuffle();
      $ids = Globals::getLegendCards();
    }

    $id = array_pop($ids);
    Globals::setLegendCards($ids);
    Globals::setLegendCard($id);
    Globals::setLegendCardDrawn(true);

    $card = self::getCurrentCard();
    Notifications::newLegendCard($card);
  }

  public static function reshuffle()
  {
    $ids = array_keys(self::$cards);
    shuffle($ids);
    Globals::setLegendCards($ids);
  }

  static $cards = [
    [[YELLOW => 11], [RED => 13, GRAY => 14], [BLACK => 16, GREEN => 15], [BLUE => 18]],
    [[], [YELLOW => 13, GREEN => 12], [BLUE => 16, RED => 17], [BLACK => 18, GRAY => 19]],
    [[GREEN => 10, RED => 11], [GRAY => 13, BLUE => 14], [YELLOW => 15, BLACK => 17], []],
    [[], [BLUE => 12, BLACK => 14], [GRAY => 16, RED => 15, YELLOW => 17], [GREEN => 18]],
    [[RED => 10], [GRAY => 12, BLACK => 13], [GREEN => 16, BLUE => 17], [YELLOW => 19]],
    [[BLUE => 10], [YELLOW => 12, GREEN => 13, RED => 14], [], [GRAY => 18, BLACK => 19]],
    [[GRAY => 11], [BLUE => 13, YELLOW => 14], [BLACK => 15], [RED => 18, GREEN => 19]],
    [[GRAY => 10, BLACK => 11], [RED => 12, GREEN => 14], [YELLOW => 16], [BLUE => 19]],
    [[YELLOW => 10, BLUE => 11], [BLACK => 12], [GRAY => 15, GREEN => 17], [RED => 19]],
    [[BLACK => 10, GREEN => 11], [], [RED => 16, BLUE => 15, GRAY => 17], [YELLOW => 18]],
  ];
}
