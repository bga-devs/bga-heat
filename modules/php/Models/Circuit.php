<?php

namespace HEAT\Models;

use HEAT\Managers\Constructors;
use HEAT\Core\Globals;

class Circuit
{
  /////////////////////////////
  //  ____        _        
  // |  _ \  __ _| |_ __ _ 
  // | | | |/ _` | __/ _` |
  // | |_| | (_| | || (_| |
  // |____/ \__,_|\__\__,_|
  /////////////////////////////


  // CONSTRUCTOR: given a json representing the circuit, initialize the circuit
  protected ?string $id = null;
  protected ?string $name = null;
  protected ?array $datas = null;
  protected array $corners = [];
  protected array $chicanes = [];
  protected array $legendLines = [];
  protected array $agressiveLegendDistances = [];
  protected array $raceLanes = [];
  protected array $startingCells = [];
  protected array $cells = [];
  protected array $uPosToCells = [];
  protected ?array $pressCornersPositions = null;

  public function isInitialized(): bool
  {
    return !is_null($this->datas);
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
      if (isset($info['chicane'])) {
        $this->chicanes[$pos] = $datas['corners'][$info['chicane']]['position'];
      }
      $this->corners[$pos] = $info['speed'];
      $this->legendLines[$pos] = $info['legend'];
      $this->agressiveLegendDistances[$pos] = $info['agressiveLegend'] ?? null;
      $lane = $info['lane'];
      $this->raceLanes[] = $lane;
    }
    array_unshift($this->raceLanes, $lane);
    $this->startingCells = $datas['startingCells'];
    $this->nbrLaps = $datas['nbrLaps'];
    $this->stressCards = $datas['stressCards'];
    $this->heatCards = $datas['heatCards'];
    $this->pressCornersPositions = $datas['pressCornersPositions'] ?? null;

    foreach ($datas['cells'] as $cellId => $info) {
      $this->cells[(int) $cellId] = [
        'pos' => $info['position'] - 1, // OFFSET OF 1 !
        'lane' => $info['lane'],
      ];
    }

    foreach ($this->cells as $cellId => $cellPos) {
      $uPos = 2 * $cellPos['pos'] + $cellPos['lane'];
      $this->uPosToCells[$uPos] = $cellId;
    }
  }


  /**
   * getUiData: send all the info the front need to place the cars and corners accordingly
   *  filter out useless informations
   */
  public function getUiData(): array
  {
    if (is_null($this->datas)) {
      return [];
    }

    $cornersDatas = [];
    $pressCorners = [];
    foreach ($this->datas['corners'] as $i => $infos) {
      $pos = $infos['position'] ?? $i;
      $cornersDatas[$pos] = [
        'x' => $infos['x'],
        'y' => $infos['y'],
        'tentX' => $infos['tentX'],
        'tentY' => $infos['tentY'],
        'sectorTentX' => $infos['sectorTentX'],
        'sectorTentY' => $infos['sectorTentY'],
        'speed' => $infos['speed'],
      ];

      if (isset($infos['chicane'])) {
        $chicane = $this->datas['corners'][$infos['chicane']];
        $cornersDatas[$pos]['chicane'] = $chicane['position'];
        foreach (['tentX', 'tentY', 'sectorTentX', 'sectorTentY'] as $key) {
          $cornersDatas[$pos][$key] = $chicane[$key];
        }
      }

      if ($this->isPressCorner($pos)) {
        $pressCorners[] = $pos;
      }
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
      'pressCorners' => $pressCorners,
    ];
  }

  /**
   * DATA ACCESS
   */
  public function getId(): string
  {
    return $this->id;
  }
  public function getName(): string
  {
    return $this->name;
  }
  public function getCorners(): array
  {
    return $this->corners;
  }

  public function getFloodedSpaces(): array
  {
    return $this->datas['floodedSpaces'] ?? [];
  }

  public function getTunnelsSpaces(): array
  {
    return $this->datas['tunnelSpaces'] ?? [];
  }

  public function getStartingCells(): array
  {
    return $this->startingCells;
  }

  public function getLength(): int
  {
    return count($this->cells) / 2;
  }


  /**
   * DATA ACCESS : these piece of data can be modified by events!
   */
  protected int $nbrLaps = 0;
  protected int $stressCards = 0;
  protected int $heatCards = 0;
  public function getNbrLaps(): int
  {
    $n = $this->nbrLaps;
    $optionNbrLaps = Globals::getNbrLaps();
    if ($optionNbrLaps != 0) {
      $n = $optionNbrLaps;
    }

    $event = Globals::getCurrentEvent();
    if ($event == EVENT_STRIKE) {
      $n--;
    } elseif ($event == EVENT_RECORD_CROWDS) {
      $n++;
    }

    return $n;
  }

  public function getStressCards(): int
  {
    $value = $this->stressCards;

    // Weather
    $weatherCard = Globals::getWeatherCard();
    if ($weatherCard === WEATHER_CLOUD) {
      $value--;
    } elseif ($weatherCard === WEATHER_STORM) {
      $value++;
    }

    // Event
    $event = Globals::getCurrentEvent();
    if ($event == EVENT_SAFETY_REGULATIONS) {
      $value--;
    } elseif ($event == EVENT_FUTURE_UNKNOWN) {
      $value++;
    }

    return $value;
  }

  public function getHeatCards(): int
  {
    $value = $this->heatCards;

    // Weather
    $weatherCard = Globals::getWeatherCard();
    if ($weatherCard === WEATHER_FOG) {
      $value++;
    } elseif ($weatherCard === WEATHER_SNOW) {
      $value--;
    }

    // Event
    $event = Globals::getCurrentEvent();
    if ($event == EVENT_RESTRICTIONS_LIFTED) {
      $value++;
    } elseif ($event == EVENT_SAFETY_REGULATIONS) {
      $value -= 2;
    }

    return $value;
  }

  ///////////////////////////////////////////////////////
  //   ____     _ _            _       _           _ 
  //  / ___|___| | |  _ __ ___| | __ _| |_ ___  __| |
  // | |   / _ \ | | | '__/ _ \ |/ _` | __/ _ \/ _` |
  // | |__|  __/ | | | | |  __/ | (_| | ||  __/ (_| |
  //  \____\___|_|_| |_|  \___|_|\__,_|\__\___|\__,_|
  ///////////////////////////////////////////////////////

  /**
   * In all this file, there are several ways to represent a position:
   *   - $cell will always be the unique cellId of the svg file
   *   - $position will always be only an integer representing how far we are from the starting mark
   *      => there are two cells at each positions (one for each lane)!
   *      => careful: position might be greater than circuit length!
   *   - $uPosition will always be a UniquePosition computed by doing : 2 * $pos + lane
   *      => there is a one-one mapping linking uPos to cells in $this->uPosToCells
   */

  public function getUPos(int $position, int $lane): int
  {
    $pos = $position % $this->getLength();
    return 2 * $pos + $lane;
  }

  public function getCell(int $position, int $lane): int
  {
    $uPos = $this->getUPos($position, $lane);
    return $this->uPosToCells[$uPos];
  }

  // Syntaxic sugar for accessing Constructor information
  public function getPosition(Constructor $constructor): int
  {
    if (!$this->isInitialized()) {
      return 0;
    }
    $currentCell = $constructor->getCarCell();
    return $this->cells[$currentCell]['pos'] ?? 0;
  }

  // Syntaxic sugar for accessing Constructor information
  public function getUPosition(Constructor $constructor): int
  {
    if (!$this->isInitialized()) {
      return 0;
    }
    $currentCell = $constructor->getCarCell();
    $cellInfos = $this->cells[$currentCell];
    return $this->getUPos($cellInfos['pos'], $cellInfos['lane']);
  }

  // Syntaxic sugar for accessing Constructor information
  public function getLane(Constructor $constructor): int
  {
    if (!$this->isInitialized()) {
      return 0;
    }
    $currentCell = $constructor->getCarCell();
    return $this->cells[$currentCell]['lane'];
  }

  /**
   * Given a position, compute what is the race lane at this position
   *  => this depends on the current "corner section" and possible values are 1 or 2
   */
  public function getRaceLane(int $position): int
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


  /**
   * Check whether a given unique position is free or not
   *  => exclude: optional constructor id parameter to ignore in collision detection
   */
  public function isFree(int $position, int $lane, ?int $exclude = null): bool
  {
    $uPos = $this->getUPos($position, $lane);
    foreach (Constructors::getAll() as $cId => $constructor) {
      if ((!is_null($exclude) && $cId == $exclude) || $constructor->isFinished()) {
        continue;
      }

      $uPos2 = $this->getUPosition($constructor);
      if ($uPos == $uPos2) {
        return false;
      }
    }
    return true;
  }

  /**
   * Given a position, return the lane that is free at that position, prioritizing the race line first
   *  => return 0 if none of the two cells at this position are available
   */
  public function getFreeLane(int $position, ?int $exclude = null): int
  {
    // Try raceLane first
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

  /**
   * Given a position, return the cell that is free at that position, prioritizing the race line first
   *  => we should never call this function with both cells as empty, but we allow to bypass this with boolean parameter that will just return the lane 1
   */
  public function getFreeCell(int $position, ?int $exclude = null, bool $error = true): int
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


  /**
   * Given a position, find the first free position where at least one cell is free, going backward until it's found
   *  => upper bound for $avoidInfiniteLoop is 10 because that would mean that the 10*2 = 20 cells are full, which is currently impossible
   */
  public function getFirstFreePosition(int $position, int $cId): int
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

  public function getFirstFreeCell(int $position, int $cId): int
  {
    $position = $this->getFirstFreePosition($position, $cId);
    return $this->getFreeCell($position);
  }

  /**
   * Core logic part: getReachedCell allow to compute where a car would land if it moves by $speed cells forward
   * Possible flags:
   *  - compute paths: do we want to compute the path from starting cell to reached cell? (useful for animation only)
   *  - compute heat costs: do we want to compute the corresponding heat cost ?
   *  - is slipstream: is it a slipstream move ? (change heat computation)
   * Return an assoc array:
   *  - int cell
   *  - int distance: how many space forward? (that might be less than $speed if cells are full)
   *  - int extraTurn: have we crossed the finish line?
   *  - ?array path
   *  - ?int heatCost
   *  - ?array heatCosts: ???
   *  - ?bool spinOut
   */
  public function getReachedCell(Constructor $constructor, int $speed, int $flags = 0): array
  {
    $computePath = ($flags & FLAG_COMPUTE_PATHS) == FLAG_COMPUTE_PATHS;
    $computeHeatCost = ($flags & FLAG_COMPUTE_HEAT_COSTS) == FLAG_COMPUTE_HEAT_COSTS;
    $isSlipstream = ($flags & FLAG_IS_SLIPSTREAM) == FLAG_IS_SLIPSTREAM;

    // Not moving => return
    if ($speed == 0) {
      return [
        'cell' => $constructor->getCarCell(),
        'distance' => 0,
        'extraTurn' => 0,
        'paths' => [],
        'heatCost' => 0,
        'heatCosts' => [],
        'spinOut' => false
      ];
    }

    $result = [];

    // Current information about the constructor
    $cId = $constructor->getId();
    $currentTurn = $constructor->getTurn();
    $currentPosition = $this->getPosition($constructor);
    $currentLane = $this->getLane($constructor);

    // Find the first position that is not already full with cars
    $newPosition = $this->getFirstFreePosition($currentPosition + $speed, $cId);
    $isMovingForward = $newPosition > $currentPosition;

    // Compute the path
    $path = [$constructor->getCarCell()];
    if ($computePath) {
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
          $currentLane = 1.5; // If no cell are free, just move through the middle of them (only allowed because the car does not stop here)
          $path[] = [$this->getCell($pos, 1), $this->getCell($pos, 2)];
        }
      }
    }

    // Compute potential extra turns
    $extraTurn = intdiv($newPosition, $this->getLength());
    $result['extraTurn'] = $extraTurn;
    $result['distance'] = $newPosition - $currentPosition;
    $newPosition = $newPosition % $this->getLength();

    // Now get the cell
    if ($isMovingForward) {
      $cellId = $this->getFreeCell($newPosition);
      $path[] = $cellId;
    } else {
      $cellId = $path[0];
    }
    $result['cell'] = $cellId;

    // Compute the heat cost
    if ($computeHeatCost) {
      if ($isSlipstream) {
        $speed = max(0, $constructor->getSpeed());
      } else {
        $speed += max(0, $constructor->getSpeed());
      }
      $prevPosition = Globals::getPreviousPosition();
      $prevTurn = Globals::getPreviousTurn();
      $infos = $this->getCrossedCornersHeatCosts(
        $constructor,
        $speed,
        $prevTurn,
        $prevPosition,
        $currentTurn + $extraTurn,
        $newPosition
      );
      $heatCosts = $infos['heatCosts'];
      $heatCost = array_sum($heatCosts);

      $result['heatCost'] = $heatCost;
      $result['heatCosts'] = $heatCosts;
      $result['spinOut'] = $infos['spinOut'];
    }

    if ($computePath) {
      $result['path'] = $path;
    }

    return $result;
  }

  /**
   * Given a contructor and a value for slipstream, compute information where the car would land with that slipstream
   *  => return false is not slipstream is possible
   */
  public function getSlipstreamResult(Constructor $constructor, int $n): array|bool
  {
    $currentPosition = $this->getPosition($constructor);

    // Is there a car next to me or in front of me ?
    $currentLane = $this->getLane($constructor);
    $nextPosition = ($currentPosition + 1) % $this->getLength();
    if ($this->isFree($currentPosition, 3 - $currentLane) && $this->isFree($nextPosition, 1) && $this->isFree($nextPosition, 2)) {
      return false;
    }

    // Cant slipstream on last turn if that makes you cross finish lane
    $newPosition = $currentPosition + $n;
    $extraTurn = intdiv($newPosition, $this->getLength());
    if ($constructor->getTurn() + $extraTurn >= $this->getNbrLaps()) {
      return false;
    }

    // Check that you move at least one cell forward
    $result = $this->getReachedCell($constructor, $n, FLAG_COMPUTE_PATHS | FLAG_COMPUTE_HEAT_COSTS | FLAG_IS_SLIPSTREAM);
    if ($result['distance'] == 0) {
      return false;
    }

    return $result;
  }



  /////////////////////////////////////////////////////////////////////////////
  //   ____                                          _       _           _ 
  //  / ___|___  _ __ _ __   ___ _ __ ___   _ __ ___| | __ _| |_ ___  __| |
  // | |   / _ \| '__| '_ \ / _ \ '__/ __| | '__/ _ \ |/ _` | __/ _ \/ _` |
  // | |__| (_) | |  | | | |  __/ |  \__ \ | | |  __/ | (_| | ||  __/ (_| |
  //  \____\___/|_|  |_| |_|\___|_|  |___/ |_|  \___|_|\__,_|\__\___|\__,_|
  /////////////////////////////////////////////////////////////////////////////
  /**
   * Corners information are stored in $this->corners array in the following form: cornerPos => speedLimit
   *  => cornerPos will always represent the position of the first cell AFTER the corner
   */

  // Max speed of a corner might be changed by weather
  public function getCornerMaxSpeed(int $cornerPos): int
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

  /**
   * Legend information:
   *  - what is the line for a given corner
   *  - what is the distance from given corner that would allow for double corner crossing for agressive legends
   */
  public function getLegendLine(int $cornerPos): int
  {
    return $this->legendLines[$cornerPos];
  }

  public function getAgressiveLegendDistance(int $cornerPos): ?int
  {
    return $this->agressiveLegendDistances[$cornerPos];
  }

  /**
   * Expansion chicanes: an assoc array stored the link : secondChicaneCorner => mainChicaneCorner
   */
  public function getChicaneMainCorner(int $cornerPos): int
  {
    return $this->chicanes[$cornerPos];
  }

  public function isChicane(int $cornerPos): bool
  {
    return !is_null($this->chicanes[$cornerPos] ?? null);
  }



  // Get corner ahead
  public function getNextCorner(int $position): int
  {
    foreach ($this->corners as $pos => $infos) {
      if ($pos > $position) {
        return $pos;
      }
    }

    // If we are here, we are after the final corner but before the finish line
    // => next corner is still the first one on the circuit
    return array_keys($this->corners)[0];
  }

  // Get distance to next corner
  public function getDistanceToCorner(int $position): int
  {
    $cornerPos = $this->getNextCorner($position);
    $length = $this->getLength();
    return ($cornerPos - $position - 1 + $length) % $length;
  }

  // Get previous corner => useful for weather
  public function getPrevCorner(int $position): int
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



  /**
   * Given two positions with associated turns, compute the set of corners crossed by going from 1st pos to 2nd pos
   *  => return an array where each entry has 'cornerPos' and 'turn'
   */
  public function getCornersInBetween(int $turn1, int $pos1, int $turn2, int $pos2): array
  {
    $length = $this->getLength();
    $position1 = $length * $turn1 + $pos1;
    $position2 = $length * $turn2 + $pos2;
    $maxPosition = min($position2, $length * $this->getNbrLaps()); // Corners after the end of the race never count!
    $corners = [];
    for ($pos = $position1 + 1; $pos <= $maxPosition; $pos++) {
      $position = ($pos + $length) % $length;
      if (array_key_exists($position, $this->corners)) {
        $corners[] = [
          'cornerPos' => $position,
          'turn' => intdiv($pos, $length)
        ];
      }
    }

    return $corners;
  }


  /**
   * Core logic part: given a constructor, a speed, a strarting and ending pos, return the following informations about corner crossed
   *  - array heatCosts: cornerPos => heatCost
   *  - bool spinOut
   *  - array speedLimits: cornerPos => speedLimit
   */
  public function getCrossedCornersHeatCosts(Constructor $constructor, int $speed, int $turn1, int $pos1, int $turn2, int $pos2): array
  {
    $corners = $this->getCornersInBetween($turn1, $pos1, $turn2, $pos2);

    // Max speed modificator
    $speedLimitModifier = 0;
    foreach ($constructor->getPlayedCards() as $card) {
      $speedLimitModifier += $card['symbols'][ADJUST] ?? 0;
    }

    // For each corner, check speed against max speed of corner
    $spinOut = false;
    $costs = [];
    $limits = [];
    $availableHeats = $constructor->getEngine()->count();

    if (!empty($corners)) {
      foreach ($corners as $infos) {
        $cornerPos = $infos['cornerPos'];
        $costs[$cornerPos] = 0;
        $rawLimit = $this->getCornerMaxSpeed($cornerPos);
        $limit = $rawLimit + $speedLimitModifier;
        $limits[$cornerPos] = $limit;
        $delta = $speed - $limit;

        if ($delta > 0) {
          $nHeatsToPay = $delta;
          // Road condition can increase number of heat to pay
          $roadCondition = $this->getRoadCondition($cornerPos);
          if ($roadCondition == \ROAD_CONDITION_MORE_HEAT) {
            $nHeatsToPay++;
          }

          // Are we spinning out ??
          $costs[$cornerPos] = $nHeatsToPay;
          if ($nHeatsToPay > $availableHeats) {
            $spinOut = true;
            break;
          } else {
            $availableHeats -= $nHeatsToPay;
          }
        }
      }
    }

    return [
      'heatCost' => array_sum($costs),
      'heatCosts' => $costs,
      'spinOut' => $spinOut,
      'speedLimits' => $limits
    ];
  }


  ///////////////////////////////////////////////
  // __        __         _   _               
  // \ \      / /__  __ _| |_| |__   ___ _ __ 
  //  \ \ /\ / / _ \/ _` | __| '_ \ / _ \ '__|
  //   \ V  V /  __/ (_| | |_| | | |  __/ |   
  //    \_/\_/ \___|\__,_|\__|_| |_|\___|_|   
  ///////////////////////////////////////////////

  // Get current corner sector => corner behind
  public function getSector(int $position): int
  {
    return $this->getPrevCorner($position);
  }

  // Get the weather token associated to that corner
  public function getCornerWeather(int $corner): ?int
  {
    $weather = Globals::getWeather();
    return $weather['tokens'][$corner] ?? null;
  }

  // Get the road condition at that position
  public function getRoadCondition(int $position): ?int
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


  /////////////////////////////////
  // ____                    
  // |  _ \ _ __ ___  ___ ___ 
  // | |_) | '__/ _ \/ __/ __|
  // |  __/| | |  __/\__ \__ \
  // |_|   |_|  \___||___/___/
  /////////////////////////////////

  /**
   * Compute the mapping for press : corner position => n° of corner
   *  => usual computation just ignore chicane and take all the corners from starting positions
   *  => this is NOT TRUE for Espana that can overwrite this!
   */
  public function getPressCornersMapping(): array
  {
    $nCorners = 0;
    $map = [];

    // Adhoc case => array of corner positions in the datas
    if (!is_null($this->pressCornersPositions)) {
      foreach ($this->pressCornersPositions as $cornerPos) {
        $map[$cornerPos] = $nCorners;
        $nCorners++;
      }
    }
    // Standard case: compute them by skipping chicane
    else {
      foreach ($this->corners as $cornerPos => $maxSpeed) {
        if ($this->isChicane($cornerPos)) {
          $nCorners--;
          unset($map[$this->getChicaneMainCorner($cornerPos)]);
        }

        $map[$cornerPos] = $nCorners;
        $nCorners++;
      }
    }

    return $map;
  }


  // Is a given corner a press corner FOR THE CURRENT GAME
  public function isPressCorner(int $cornerPos): bool
  {
    if (!Globals::isChampionship()) {
      return false;
    }

    $map = $this->getPressCornersMapping();
    $nCorners = count($map);
    $i = $map[$cornerPos] ?? null;
    if (is_null($i)) return false;

    $event = Globals::getCurrentEvent();
    $allEvents = Globals::getPossibleEvents();
    $pressCorners = array_map(fn($j) => $j % $nCorners, $allEvents[$event]['press']);
    return in_array($i, $pressCorners);
  }


  /////////////////////////
  // __  __ _          
  // |  \/  (_)___  ___ 
  // | |\/| | / __|/ __|
  // | |  | | \__ \ (__ 
  // |_|  |_|_|___/\___|
  /////////////////////////

  // USEFUL FOR LIVE TV EVENT
  public function getCarsInBetween(int $turn1, int $pos1, int $turn2, int $pos2): int
  {
    $length = $this->getLength();
    $uid1 = $length * $turn1 + $pos1;
    $uid2 = $length * $turn2 + $pos2;
    $cars = 0;
    for ($pos = $uid1 + 1; $pos < $uid2; $pos++) {
      if (!$this->isFree($pos, 1)) {
        $cars++;
      }
      if (!$this->isFree($pos, 2)) {
        $cars++;
      }
    }

    return $cars;
  }
}
