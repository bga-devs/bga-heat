<?php
namespace HEAT\Models;
use HEAT\Managers\Constructors;

class Circuit
{
  protected $corners = [];
  protected $raceLines = [];
  protected $startingCells = [];
  protected $cells = [];
  protected $posToCells = [];
  public function __construct($datas)
  {
    $lane = null;
    foreach ($datas['corners'] as $pos => $info) {
      $this->corners[$pos] = $info['speed'];
      $lane = $info['lane'];
      $this->raceLines[] = $lane;
    }
    array_unshift($this->raceLines, $lane);
    $this->startingCells = $datas['startingCells'];
    $this->nbrLaps = $datas['nbrLaps'];
    $this->stressCards = $datas['stressCards'];
    $this->heatCards = $datas['heatCards'];

    foreach ($datas['cells'] as $cellId => $info) {
      $this->cells[(int) $cellId] = [
        'pos' => $info['position'] - 1, // OFFSET OF 1 !
        'lane' => $info['lane'],
      ];
    }

    foreach ($this->cells as $cellId => $cellPos) {
      $this->posToCells[2 * $cellPos['pos'] + $cellPos['lane']] = $cellId;
    }
  }

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
      if ((!is_null($exclude) && $cId == $exclude) || $constructor->isFinished()) {
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

  public function getFreeLine($position, $exclude = null)
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

  public function getFreeCell($position)
  {
    $line = $this->getFreeLine($position);
    if ($line == 0) {
      die('Trying to get free cell on a busy position');
    }
    return $this->getCell($position, $line);
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

  public function getCell($position, $line)
  {
    $pos = $position % $this->getLength();
    return $this->posToCells[2 * $pos + $line];
  }

  public function getFirstFreePosition($position, $cId)
  {
    $avoidInfiniteLoop = 0;
    while ($this->getFreeLine($position, $cId) == 0 && $avoidInfiniteLoop++ < 10) {
      $position--;
    }
    if ($avoidInfiniteLoop >= 10) {
      die('Couldnt find a valid cell, should not happen');
    }
    return $position;
  }

  public function getFirstFreeCell($position, $cId)
  {
    $position = $this->getFirstFreePosition($position, $cId);
    return $this->getFreeCell($position);
  }

  public function getReachedCell($constructor, $speed)
  {
    if ($speed == 0) {
      return [$constructor->getCarCell(), 0, 0, []];
    }

    $cId = $constructor->getId();
    $currentPosition = $this->getPosition($constructor);
    $currentLine = $this->getLine($constructor);

    // Find the first position that is not already full with cars
    $newPosition = $this->getFirstFreePosition($currentPosition + $speed, $cId);

    // Compute the path
    $path = [$constructor->getCarCell()];
    for ($pos = $currentPosition + 1; $pos < $newPosition; $pos++) {
      if ($currentLine == 1.5) {
        $currentLine = $this->getRaceLine($pos);
      }

      if ($this->isFree($pos, $currentLine)) {
        $path[] = $this->getCell($pos, $currentLine);
      } elseif ($this->isFree($pos, 3 - $currentLine)) {
        $currentLine = 3 - $currentLine;
        $path[] = $this->getCell($pos, $currentLine);
      } else {
        $currentLine = 1.5;
        $path[] = [$this->getCell($pos, 1), $this->getCell($pos, 2)];
      }
    }

    // Compute potential extra turns
    $extraTurn = intdiv($newPosition, $this->getLength());
    $nSpacesForward = $newPosition - $currentPosition;
    $newPosition = $newPosition % $this->getLength();

    // Now get the cell
    $cellId = $this->getFreeCell($newPosition);
    $path[] = $cellId;
    return [$cellId, $nSpacesForward, $extraTurn, $path];
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
    list($cell, $nSpacesForward, , $path) = $this->getReachedCell($constructor, $n);
    if ($nSpacesForward == 0) {
      return false;
    }

    return [$cell, $path];
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
