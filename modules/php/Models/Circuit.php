<?php
namespace HEAT\Models;
use HEAT\Managers\Constructors;

class Circuit
{
  protected $corners = [];
  protected $raceLines = [];
  protected $startingCells = [];
  protected $cells = [];

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

  public function getReachedCell($constructor, $speed)
  {
    $cId = $constructor->getId();
    $currentCell = $constructor->getCarCell();
    $currentPosition = $this->cells[$currentCell]['pos'];

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
    $newPosition = $newPosition % $this->getLength();
    $newLane = $this->getFreeLane($newPosition);

    // Now get the cell
    foreach ($this->cells as $cellId => $cellPos) {
      if ($cellPos['pos'] == $newPosition && $cellPos['lane'] == $newLane) {
        return [$cellId, $extraTurn];
      }
    }
  }
}
