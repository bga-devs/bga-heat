<?php
namespace HEAT\States;
use HEAT\Core\Globals;
use HEAT\Core\Notifications;
use HEAT\Core\Stats;
use HEAT\Helpers\Log;
use HEAT\Managers\Constructors;
use HEAT\Managers\Players;
use HEAT\Managers\Cards;
use HEAT\Managers\LegendCards;

trait LegendTrait
{
  function stLegendTurn()
  {
    $constructor = Constructors::getActive();
    $pos = $constructor->getPosition();
    $turn = $constructor->getTurn();
    $cornerPos = $this->getCircuit()->getNextCorner($pos);
    $linePos = $this->getCircuit()->getLegendLane($cornerPos);

    LegendCards::drawIfNeeded();
    list($slot, $number) = LegendCards::getCurrentCardInfos($constructor);

    // A => cross the corner
    if ($linePos <= $pos && $pos < $cornerPos) {
      // Try to move at corner speed + "slot cell" number
      $speed = $this->getCircuit()->getCornerMaxSpeed($cornerPos) + $slot;
      list($newCell, $nSpacesForward, $extraTurns, $path) = $this->getCircuit()->getReachedCell($constructor, $speed);
      // Check if that makes the car cross AT MOST one corner
      $cornersCrossed = $this->getCircuit()->getCornersInBetween($turn, $pos, $turn + $extraTurns, $pos + $nSpacesForward);
      if (count($cornersCrossed) <= 1) {
        $this->moveCar($constructor, $speed);
      }
      // Otherwise, stop before second corner
      else {
        $cornerPos = $cornersCrossed[1][0];
        $length = $this->getCircuit()->getLength();
        $speed = ($cornerPos - 1 - $pos + $length) % $length;
        $this->moveCar($constructor, $speed);
      }
    }
    // B => approaching the corner
    else {
      // Try to move ahead at speed = number on the Helmet
      $length = $this->getCircuit()->getLength();
      $cornerPos = $this->getCircuit()->getNextCorner($pos);
      $delta = ($cornerPos - $pos + $length) % $length;
      // Check if that makes the car cross the corner
      if ($number < $delta) {
        $this->moveCar($constructor, $number);
      }
      // If yes, then go to the "slot cell" instead
      else {
        $speed = ($cornerPos - 1 - $slot - $pos + $length) % $length;
        $this->moveCar($constructor, $speed);
      }
    }

    $this->nextPlayerCustomOrder('reveal');
  }
}
