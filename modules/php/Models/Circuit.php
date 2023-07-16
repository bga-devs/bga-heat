<?php
namespace HEAT\Models;
use HEAT\Managers\Constructors;

class Circuit
{
  protected $corners = [];
  protected $raceLines = [];
  protected $startingCells = [];
  protected $cells = [];

  protected $nbrLaps = 0;
  protected $stressCards = 0;
  protected $heatCards = 0;
  public function getNbrLaps()
  {
    $initial = $this->nbrLaps;
    // TODO : weather + event
    return $initial;
  }
  public function getStressCards()
  {
    $initial = $this->stressCards;
    // TODO : weather + event
    return $initial;
  }
  public function getHeatCards()
  {
    $initial = $this->heatCards;
    // TODO : weather + event
    return $initial;
  }

  public function getStartingCells()
  {
    return $this->startingCells;
  }

  public function getLength()
  {
    return count($this->cells) / 2;
  }

  public function isFree($position, $lane, $exclude = null)
  {
    foreach (Constructors::getAll() as $cId => $constructor) {
      if (!is_null($exclude) && $cId == $exclude) {
        continue;
      }

      $cell = $constructor->getCarCell();
      $cellPos = $this->cells[$cell];
      if ($cellPos['pos'] == $position && $cellPos['lane'] == $lane) {
        return false;
      }
    }
    return true;
  }

  public function getRaceLine($position)
  {
    $position = $position % $this->getLength();
    $i = 0;
    foreach ($this->corners as $pos => $speed) {
      if ($pos > $position) {
        break;
      } else {
        $i++;
      }
    }
    return $this->raceLines[$i];
  }

  public function getFreeLane($position, $exclude = null)
  {
    // Try raceline first
    $raceLine = $this->getRaceLine($position);
    if ($this->isFree($position, $raceLine, $exclude)) {
      return $raceLine;
    }
    // Otherwise, try the other one
    $raceLine = 3 - $raceLine;
    if ($this->isFree($position, $raceLine, $exclude)) {
      return $raceLine;
    }
    // Otherwise, return 0 if both are full
    return 0;
  }

  public function getPosition($constructor)
  {
    $currentCell = $constructor->getCarCell();
    return $this->cells[$currentCell]['pos'];
  }

  public function getLine($constructor)
  {
    $currentCell = $constructor->getCarCell();
    return $this->cells[$currentCell]['lane'];
  }

  public function getReachedCell($constructor, $speed)
  {
    $cId = $constructor->getId();
    $currentPosition = $this->getPosition($constructor);

    // Find the first position that is not already full with cars
    $newPosition = $currentPosition + $speed;
    $avoidInfiniteLoop = 0;
    while ($this->getFreeLane($newPosition, $cId) == 0 && $avoidInfiniteLoop++ < 10) {
      $newPosition--;
    }
    if ($avoidInfiniteLoop >= 10) {
      die('Couldnt find a valid cell, should not happen');
    }

    // Compute potential extra turns
    $extraTurn = intdiv($newPosition, $this->getLength());
    $nSpacesForward = $newPosition - $currentPosition;
    $newPosition = $newPosition % $this->getLength();
    $newLane = $this->getFreeLane($newPosition);

    // Now get the cell
    foreach ($this->cells as $cellId => $cellPos) {
      if ($cellPos['pos'] == $newPosition && $cellPos['lane'] == $newLane) {
        return [$cellId, $nSpacesForward, $extraTurn];
      }
    }
  }

  public function getSlipstreamResult($constructor, $n)
  {
    $currentPosition = $this->getPosition($constructor);
    // TODO : check section and weather condition that might prevent slipstream

    // Is there a car next to me or in front of me ?
    $currentLine = $this->getLine($constructor);
    $nextPosition = ($currentPosition + 1) % $this->getLength();
    if ($this->isFree($currentPosition, 3 - $currentLine) && $this->isFree($nextPosition, 1) && $this->isFree($nextPosition, 2)) {
      return false;
    }

    // Cant slipstream on last last if that makes you cross finish line
    $newPosition = $currentPosition + $n;
    $extraTurn = intdiv($newPosition, $this->getLength());
    if ($constructor->getTurn() + $extraTurn >= $this->getNbrLaps()) {
      return false;
    }

    // Check that you move at least one cell forward
    list($cell, $nSpacesForward) = $this->getReachedCell($constructor, $n);
    if ($nSpacesForward == 0) {
      return false;
    }

    return $cell;
  }

  public function getCornersInBetween($turn1, $pos1, $turn2, $pos2)
  {
    $length = $this->getLength();
    $uid1 = $length * $turn1 + $pos1;
    $uid2 = $length * $turn2 + $pos2;
    $corners = [];
    for ($pos = $uid1 + 1; $pos <= min($uid2, $length * $this->getNbrLaps()); $pos++) {
      $position = $pos % $length;
      if (array_key_exists($position, $this->corners)) {
        $corners[] = [$position, $this->corners[$position]];
      }
    }

    return $corners;
  }
}
