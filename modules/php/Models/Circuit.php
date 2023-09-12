<?php
namespace HEAT\Models;
use HEAT\Managers\Constructors;
use HEAT\Core\Globals;

class Circuit
{
  protected $id = null;
  protected $name = null;
  protected $datas = null;
  protected $corners = [];
  protected $legendLanes = [];
  protected $raceLanes = [];
  protected $startingCells = [];
  protected $cells = [];
  protected $posToCells = [];
  public function getUiData()
  {
    if (is_null($this->datas)) {
      return [];
    }

    $cornersDatas = [];
    foreach ($this->datas['corners'] as $i => $infos) {
      $pos = $infos['position'] ?? $i;
      $cornersDatas[$pos] = [
        'x' => $infos['x'],
        'y' => $infos['y'],
        'tentX' => $infos['tentX'],
        'tentY' => $infos['tentY'],
        'sectorTentX' => $infos['sectorTentX'],
        'sectorTentY' => $infos['sectorTentY'],
      ];
    }

    $cellsDatas = [];
    foreach ($this->datas['cells'] as $cellId => $infos) {
      $cellsDatas[$cellId] = [
        'x' => $infos['x'],
        'y' => $infos['y'],
        'a' => $infos['a'],
      ];
    }

    return [
      'id' => $this->id,
      'name' => $this->name,
      'jpgUrl' => $this->datas['jpgUrl'] ?? $this->datas['assets']['jpg'],
      'stressCards' => $this->stressCards,
      'heatCards' => $this->heatCards,
      'nbrLaps' => $this->nbrLaps,
      'corners' => $cornersDatas,
      'weatherCardPos' => $this->datas['weatherCardPos'],
      'podium' => $this->datas['podium'],
      'startingCells' => $this->startingCells,
      'cells' => $cellsDatas,
    ];
  }

  public function __construct($datas)
  {
    if (empty($datas)) {
      return;
    }
    $this->datas = $datas;
    $this->id = $datas['id'];
    $this->name = $datas['name'];

    $lane = null;
    foreach ($datas['corners'] as $pos => $info) {
      if (isset($info['position'])) {
        $pos = $info['position'];
      }

      $this->corners[$pos] = $info['speed'];
      $this->legendLanes[$pos] = $info['legend'];
      $lane = $info['lane'];
      $this->raceLanes[] = $lane;
    }
    array_unshift($this->raceLanes, $lane);
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
  public function getId()
  {
    return $this->id;
  }
  public function getName()
  {
    return $this->name;
  }
  public function getCorners()
  {
    return $this->corners;
  }

  protected $nbrLaps = 0;
  protected $stressCards = 0;
  protected $heatCards = 0;
  public function getNbrLaps()
  {
    $n = $this->nbrLaps;
    $optionNbrLaps = Globals::getNbrLaps();
    if ($optionNbrLaps != 0) {
      $n = $optionNbrLaps;
    }
    // TODO : event
    return $n;
  }

  public function getStressCards()
  {
    $value = $this->stressCards;

    // Weather
    $weatherCard = Globals::getWeatherCard();
    if ($weatherCard === WEATHER_CLOUD) {
      $value--;
    } elseif ($weatherCard === WEATHER_STORM) {
      $value++;
    }

    // TODO : event
    return $value;
  }

  public function getHeatCards()
  {
    $value = $this->heatCards;

    // Weather
    $weatherCard = Globals::getWeatherCard();
    if ($weatherCard === WEATHER_FOG) {
      $value++;
    } elseif ($weatherCard === WEATHER_SNOW) {
      $value--;
    }

    // TODO : event
    return $value;
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
    $position = $position % $this->getLength();
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

  public function getRaceLane($position)
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
    return $this->raceLanes[$i];
  }

  public function getFreeLane($position, $exclude = null)
  {
    // Try racelane first
    $raceLane = $this->getRaceLane($position);
    if ($this->isFree($position, $raceLane, $exclude)) {
      return $raceLane;
    }
    // Otherwise, try the other one
    $raceLane = 3 - $raceLane;
    if ($this->isFree($position, $raceLane, $exclude)) {
      return $raceLane;
    }
    // Otherwise, return 0 if both are full
    return 0;
  }

  public function getFreeCell($position, $exclude = null, $error = true)
  {
    $lane = $this->getFreeLane($position, $exclude);
    if ($lane == 0) {
      if ($error) {
        die('Trying to get free cell on a busy position');
      } else {
        $lane = 1;
      }
    }
    return $this->getCell($position, $lane);
  }

  public function getPosition($constructor)
  {
    $currentCell = $constructor->getCarCell();
    return $this->cells[$currentCell]['pos'];
  }

  public function getLane($constructor)
  {
    $currentCell = $constructor->getCarCell();
    return $this->cells[$currentCell]['lane'];
  }

  public function getCell($position, $lane)
  {
    $pos = $position % $this->getLength();
    return $this->posToCells[2 * $pos + $lane];
  }

  public function getFirstFreePosition($position, $cId)
  {
    $avoidInfiniteLoop = 0;
    while ($this->getFreeLane($position, $cId) == 0 && $avoidInfiniteLoop++ < 10) {
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
    $currentLane = $this->getLane($constructor);

    // Find the first position that is not already full with cars
    $newPosition = $this->getFirstFreePosition($currentPosition + $speed, $cId);
    $isMovingForward = $newPosition > $currentPosition;

    // Compute the path
    $path = [$constructor->getCarCell()];
    for ($pos = $currentPosition + 1; $pos < $newPosition; $pos++) {
      if ($currentLane == 1.5) {
        $currentLane = $this->getRaceLane($pos);
      }

      if ($this->isFree($pos, $currentLane)) {
        $path[] = $this->getCell($pos, $currentLane);
      } elseif ($this->isFree($pos, 3 - $currentLane)) {
        $currentLane = 3 - $currentLane;
        $path[] = $this->getCell($pos, $currentLane);
      } else {
        $currentLane = 1.5;
        $path[] = [$this->getCell($pos, 1), $this->getCell($pos, 2)];
      }
    }

    // Compute potential extra turns
    $extraTurn = intdiv($newPosition, $this->getLength());
    $nSpacesForward = $newPosition - $currentPosition;
    $newPosition = $newPosition % $this->getLength();

    // Now get the cell
    if ($isMovingForward) {
      $cellId = $this->getFreeCell($newPosition);
      $path[] = $cellId;
    } else {
      $cellId = $path[0];
    }
    return [$cellId, $nSpacesForward, $extraTurn, $path];
  }

  public function getSlipstreamResult($constructor, $n)
  {
    $currentPosition = $this->getPosition($constructor);
    // TODO : check section and weather condition that might prevent slipstream

    // Is there a car next to me or in front of me ?
    $currentLane = $this->getLane($constructor);
    $nextPosition = ($currentPosition + 1) % $this->getLength();
    if ($this->isFree($currentPosition, 3 - $currentLane) && $this->isFree($nextPosition, 1) && $this->isFree($nextPosition, 2)) {
      return false;
    }

    // Cant slipstream on last last if that makes you cross finish lane
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
        $corners[] = $position;
      }
    }

    return $corners;
  }

  public function getCornerMaxSpeed($cornerPos)
  {
    $limit = $this->corners[$cornerPos];
    $weather = $this->getCornerWeather($cornerPos);
    if ($weather == \ROAD_CONDITION_INCREASE_SPEED) {
      $limit++;
    } elseif ($weather == \ROAD_CONDITION_REDUCE_SPEED) {
      $limit--;
    }

    return $limit;
  }

  // Get corner ahead
  public function getNextCorner($position)
  {
    foreach ($this->corners as $pos => $infos) {
      if ($pos > $position) {
        return $pos;
      }
    }

    return array_keys($this->corners)[0];
  }

  // Get "current" corner = corner behind
  public function getSector($position)
  {
    $prevPos = array_keys($this->corners)[count($this->corners) - 1];
    foreach ($this->corners as $pos => $infos) {
      if ($pos > $position) {
        return $prevPos;
      }
      $prevPos = $pos;
    }

    return $prevPos;
  }

  public function getCornerWeather($corner)
  {
    $weather = Globals::getWeather();
    return $weather['tokens'][$corner] ?? null;
  }

  public function getRoadCondition($position)
  {
    $corner = $this->getSector($position);
    $token = $this->getCornerWeather($corner);
    if ($token === \ROAD_CONDITION_WEATHER) {
      $map = [
        WEATHER_CLOUD => ROAD_CONDITION_NO_COOLDOWN,
        WEATHER_FOG => ROAD_CONDITION_NO_SLIPSTREAM,
        WEATHER_STORM => ROAD_CONDITION_SLIPSTREAM_BOOST,
        WEATHER_SNOW => ROAD_CONDITION_COOLING_BONUS,
        WEATHER_RAIN => ROAD_CONDITION_COOLING_BONUS,
        WEATHER_SUN => ROAD_CONDITION_SLIPSTREAM_BOOST,
      ];
      $token = $map[Globals::getWeatherCard()];
    }
    return $token;
  }

  public function getLegendLane($cornerPos)
  {
    return $this->legendLanes[$cornerPos];
  }
}
