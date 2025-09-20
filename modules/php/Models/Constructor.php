<?php

namespace Bga\Games\Heat\Models;

use Bga\Games\Heat\Managers\Players;
use Bga\Games\Heat\Managers\Constructors;
use Bga\Games\Heat\Managers\Cards;
use Bga\Games\Heat\Core\Globals;
use Bga\Games\Heat\Core\Notifications;
use Bga\Games\Heat\Game;
use Bga\Games\Heat\Helpers\Collection;

/*
 * Constructor: all utility functions concerning a player, real or not
 */

class Constructor extends \Bga\Games\Heat\Helpers\DB_Model
{
  protected $table = 'constructors';
  protected $primary = 'id';
  protected $attributes = [
    'id' => ['id', 'int'],
    'no' => ['no', 'int'],
    'pId' => ['player_id', 'int'],
    'name' => 'name',
    'score' => ['score', 'int'],
    'carCell' => ['car_cell', 'int'],
    'turn' => ['turn', 'int'],
    'gear' => ['gear', 'int'],
    'speed' => ['speed', 'int'],
    'paths' => ['paths', 'obj'],
  ];
  protected int $id;
  protected int $pId;

  public function getUiData($currentPlayerId = null): array
  {
    $current = $this->pId == $currentPlayerId;
    return array_merge(parent::getUiData(), [
      'ai' => $this->isAI(),
      'lvl' => $this->getLvlAI(),
      'hand' => $current ? $this->getHand()->toArray() : [],
      'handCount' => $this->getHand()->count(),
      'engine' => $this->getEngine(),
      'discard' => $this->getDiscard(),
      'deckCount' => $this->getDeckCount(),
      'inplay' => $this->getPlayedCards(),
      'distanceToCorner' => $this->getDistanceToCorner(),
      'canLeave' => $this->canLeave(),
      'planification' => $current ? Globals::getPlanification()[$this->pId] ?? [] : [],
    ]);
  }

  public function canLeave(): bool
  {
    // Constructor must be finished to quit
    if (!$this->isFinished() || $this->isAI()) {
      return false;
    }

    // And it must be a single race or the last one in the championship
    if (!Globals::isChampionship()) {
      return true;
    } else {
      // End of championship
      $datas = Globals::getChampionshipDatas();
      return $datas['index'] + 1 == count($datas['circuits']);
    }
  }

  public function getDistanceToCorner(): int
  {
    return Game::get()
      ->getCircuit()
      ->getDistanceToCorner($this->getPosition());
  }

  public function isAI(): bool
  {
    return $this->pId < 0;
  }

  public function getLvlAI(): ?int
  {
    return $this->isAI() ? ($this->pId + 20) % 5 : null;
  }

  public function isFinished(): bool
  {
    return $this->getCarCell() < 0;
  }

  public function incScore(int $n): void
  {
    parent::incScore($n);
    if (!$this->isAI()) {
      Players::get($this->pId)->incScore($n);
    }
  }
  public function setScoreAux(int $n): void
  {
    if (!$this->isAI()) {
      Players::get($this->pId)->setScoreAux($n);
    }
  }

  public function getPosition(): int
  {
    return Game::get()
      ->getCircuit()
      ->getPosition($this);
  }

  public function getRaceProgress(): int
  {
    if ($this->isFinished()) {
      return 1;
    }
    $circuit = Game::get()->getCircuit();
    if (!$circuit->isInitialized()) {
      return 0;
    }

    $position = $this->getPosition();
    $turn = $this->getTurn();
    if ($turn < 0) {
      return 0;
    }
    $length = $circuit->getLength();
    $nLaps = $circuit->getNbrLaps();

    $uid = $turn * $length + $position;
    $max = $nLaps * $length;
    return min(1, $uid / $max);
  }

  public function getSpeedLimitModifier(): int
  {
    $speedLimitModifier = 0;
    foreach ($this->getPlayedCards() as $card) {
      $speedLimitModifier += $card['symbols'][ADJUST] ?? 0;
    }
    return $speedLimitModifier;
  }

  public function getLane(): int
  {
    return Game::get()
      ->getCircuit()
      ->getLane($this);
  }

  public function getRoadCondition(): ?int
  {
    return Game::get()
      ->getCircuit()
      ->getRoadCondition($this->getPosition());
  }

  public function isInFloodedSpace(): bool
  {
    return in_array($this->getCarCell(), Game::get()
      ->getCircuit()->getFloodedSpaces());
  }

  public function isInTunnelSpace(): bool
  {
    return in_array($this->getCarCell(), Game::get()
      ->getCircuit()->getTunnelsSpaces());
  }

  public function getDeck(): Collection
  {
    return Cards::getDeck($this->id);
  }
  public function getDeckCount(): int
  {
    return $this->getDeck()->count();
  }

  public function getHand(): Collection
  {
    return Cards::getHand($this->id);
  }

  public function getPlayedCards(): Collection
  {
    return Cards::getInPlay($this->id);
  }

  public function getEngine(): Collection
  {
    return Cards::getEngine($this->id);
  }

  public function hasNoHeat(): bool
  {
    return is_null($this->getEngine()->first());
  }

  public function getDiscard(): Collection
  {
    return Cards::getDiscard($this->id);
  }

  public function getStat(string $name): mixed
  {
    if (!$this->isAI()) {
      return Players::get($this->pId)->getStat($name);
    }
    return null;
  }

  public function setStat(string $name, mixed $val): mixed
  {
    if (!$this->isAI()) {
      return Players::get($this->pId)->setStat($name, $val);
    }
    return null;
  }

  public function incStat(string $name, int $val = 1): mixed
  {
    if (!$this->isAI()) {
      return Players::get($this->pId)->incStat($name, $val);
    }
    return null;
  }

  public function resolveBoost(): array
  {
    $cards = [];
    do {
      $card = Cards::flipForBoost($this->id, 1);
      $cards[] = $card;
    } while ($card['effect'] != SPEED);

    array_pop($cards);
    Cards::move($card['id'], ['inplay', $this->id]);
    return [$cards, $card];
  }

  public function payHeats(int $n): Collection
  {
    $cards = $this->getEngine()->limit($n);
    Cards::move($cards->getIds(), ['discard', $this->id]);
    $this->incStat('heatPayed', $n);
    return $cards;
  }

  public function getHeatsInHand(): Collection
  {
    return $this->getHand()->filter(function ($card) {
      return $card['effect'] == HEAT;
    });
  }

  public function getHeatsInEngine(): int
  {
    return $this->getEngine()->count();
  }

  public function getStressesInHand(): Collection
  {
    return $this->getHand()->filter(function ($card) {
      return $card['effect'] == STRESS;
    });
  }

  public function scrapCards(int $n): array
  {
    $cards = [];
    for ($i = 0; $i < $n; $i++) {
      $cards[] = Cards::scrap($this->id);
    }
    return $cards;
  }

  public function canUseSymbol(string $symbol, int $n): bool
  {
    // Cooldown => must have something to cooldown in the hand
    if ($symbol == \COOLDOWN) {
      $roadCondition = $this->getRoadCondition();
      if ($roadCondition == ROAD_CONDITION_NO_COOLDOWN) {
        return false;
      }

      return $this->getHeatsInHand()->count() > 0;
    }
    // Reduce stress => must have stress cards in hand
    elseif ($symbol == \REDUCE) {
      return $this->getStressesInHand()->count() > 0;
    }
    // Heated boost => must be able to pay for it
    elseif ($symbol == \HEATED_BOOST) {
      return $this->getEngine()->count() > 0;
    }
    // Heat
    elseif ($symbol == HEAT) {
      return $this->getEngine()->count() >= $n;
    }

    return true;
  }

  public function eliminate(): void
  {
    if ($this->isFinished()) {
      return;
    }

    $cells = Constructors::getAll()
      ->map(function ($c) {
        return $c->getCarCell();
      })
      ->toArray();
    $podium = array_diff([-8, -7, -6, -5, -4, -3, -2, -1], $cells);
    $cell = array_shift($podium);
    $this->setCarCell($cell);
    $this->setSpeed(-1);
    $canLeave = $this->canLeave();
    Notifications::eliminate($this, $cell, $canLeave);
  }

  public function giveUp(): void
  {
    $cell = -Constructors::count() + count(Globals::getSkippedPlayers()) + count(Globals::getGiveUpPlayers());
    $this->setCarCell($cell);
    $this->setTurn(Game::get()->getNbrLaps());
    $this->setSpeed(-1);
    $canLeave = $this->canLeave();
    Notifications::giveUp($this, $cell, $canLeave);
  }
}
