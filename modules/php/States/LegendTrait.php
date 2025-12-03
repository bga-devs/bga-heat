<?php

namespace Bga\Games\Heat\States;

use Bga\Games\Heat\Core\Globals;
use Bga\Games\Heat\Core\Notifications;
use Bga\Games\Heat\Core\Stats;
use Bga\Games\Heat\Helpers\Log;
use Bga\Games\Heat\Managers\Constructors;
use Bga\Games\Heat\Managers\Players;
use Bga\Games\Heat\Managers\Cards;
use Bga\Games\Heat\Managers\LegendCards;

trait LegendTrait
{
  function stLegendTurn()
  {
    $constructor = Constructors::getActive();
    $pos = $constructor->getPosition();
    $turn = $constructor->getTurn();
    $cornerPos = $this->getCircuit()->getNextCorner($pos);
    $linePos = $this->getCircuit()->getLegendLine($cornerPos);

    $length = $this->getCircuit()->getLength();
    $deltaCorner = ($cornerPos - $pos + $length) % $length;
    $deltaLine = ($linePos - $pos + $length) % $length;
    $deltaFinishLine = ($length - $pos) % $length;
    if ($deltaFinishLine == 0) {
      $deltaFinishLine = $length;
    }

    LegendCards::drawIfNeeded();
    list($slot, $number) = LegendCards::getCurrentCardInfos($constructor);

    // A => cross the corner
    if ($deltaLine == 0 || $deltaCorner < $deltaLine) {
      // Try to move at corner speed + "slot cell" number
      $speed = $this->getCircuit()->getCornerMaxSpeed($cornerPos) + $slot;
      $moveResult = $this->getCircuit()->getReachedCell($constructor, $speed, FLAG_COMPUTE_HEAT_COSTS);
      // Check if that makes the car cross AT MOST one corner
      $cornersCrossed = $this->getCircuit()->getCornersInBetween($turn, $pos, $turn + $moveResult['extraTurn'], $pos + $moveResult['distance']);

      $maxCornerCrossed = 1;
      if (boolval(Globals::getAggressiveLegends())) {
        $aggressiveLegends = $this->getCircuit()->getAggressiveLegendsDistance($cornerPos);
        if ($aggressiveLegends !== null && $deltaCorner <= $aggressiveLegends) {
          $maxCornerCrossed = 2;
        }

        $doubleAggressiveLegends = $this->getCircuit()->getDoubleAggressiveLegendsDistance($cornerPos);
        if ($doubleAggressiveLegends !== null && $deltaCorner <= $doubleAggressiveLegends) {
          $maxCornerCrossed = 3;
        }
      }

      if (count($cornersCrossed) <= $maxCornerCrossed) {
        $this->moveCar($constructor, $speed);
      }
      // Otherwise, stop before second corner
      else {
        $cornerPos = $cornersCrossed[1]['cornerPos'];
        $speed = ($cornerPos - 1 - $pos + $length) % $length;
        $this->moveCar($constructor, $speed);
      }
      $constructor->setSpeed($speed);
    }
    // B => approaching the corner
    else {
      // Try to move ahead at speed = number on the Helmet
      // Check if that makes the car cross the corner
      if ($number < $deltaCorner || ($turn == $this->getNbrLaps() - 1 && $deltaFinishLine < $deltaCorner)) {
        $this->moveCar($constructor, $number);
        $constructor->setSpeed($number);
      }
      // If yes, then go to the "slot cell" instead
      else {
        $speed = ($cornerPos - 1 - $slot - $pos + $length) % $length;
        $this->moveCar($constructor, $speed, false, $slot);
        $constructor->setSpeed($speed);
      }
    }

    $constructor->setPaths([]);
    $this->nextPlayerCustomOrder('reveal');
  }
}
