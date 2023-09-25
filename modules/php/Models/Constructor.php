<?php
namespace HEAT\Models;
use HEAT\Managers\Players;
use HEAT\Managers\Constructors;
use HEAT\Managers\Cards;
use HEAT\Core\Globals;
use HEAT\Core\Notifications;
use HEAT\Core\Preferences;
use HEAT\Core\Stats;
use HEAT\Core\Game;

/*
 * Constructor: all utility functions concerning a player, real or not
 */

class Constructor extends \HEAT\Helpers\DB_Model
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

  public function getUiData($currentPlayerId = null)
  {
    $current = $this->pId == $currentPlayerId;
    return array_merge(parent::getUiData(), [
      'ai' => $this->isAI(),
      'lvl' => $this->getLvlAI(),
      'hand' => $current ? $this->getHand()->toArray() : [],
      'handCount' => $this->getHand()->count(),
      'engine' => $this->getEngine(),
      'discard' => $this->getDiscard(),
      'deckCount' => $this->getDeck()->count(),
      'inplay' => $this->getPlayedCards(),
      'distanceToCorner' => $this->getDistanceToCorner(),
      'canLeave' => $this->canLeave(),
    ]);
  }

  public function canLeave()
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

  public function getDistanceToCorner()
  {
    return Game::get()
      ->getCircuit()
      ->getDistanceToCorner($this->getPosition());
  }

  public function isAI()
  {
    return $this->pId < 0;
  }

  public function getLvlAI()
  {
    return $this->isAI() ? ($this->pId + 20) % 5 : null;
  }

  public function isFinished()
  {
    return $this->getCarCell() < 0;
  }

  public function incScore($n)
  {
    parent::incScore($n);
    if (!$this->isAI()) {
      Players::get($this->pId)->incScore($n);
    }
  }

  public function getPosition()
  {
    return Game::get()
      ->getCircuit()
      ->getPosition($this);
  }

  public function getRaceProgress()
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

  public function getLane()
  {
    return Game::get()
      ->getCircuit()
      ->getLane($this);
  }

  public function getRoadCondition()
  {
    return Game::get()
      ->getCircuit()
      ->getRoadCondition($this->getPosition());
  }

  public function getDeck()
  {
    return Cards::getDeck($this->id);
  }

  public function getHand()
  {
    return Cards::getHand($this->id);
  }

  public function getPlayedCards()
  {
    return Cards::getInPlay($this->id);
  }

  public function getEngine()
  {
    return Cards::getEngine($this->id);
  }

  public function hasNoHeat()
  {
    return is_null($this->getEngine()->first());
  }

  public function getDiscard()
  {
    return Cards::getDiscard($this->id);
  }

  public function getStat($name)
  {
    if (!$this->isAI()) {
      return Players::get($this->pId)->getStat($name);
    }
  }

  public function setStat($name, $val)
  {
    if (!$this->isAI()) {
      return Players::get($this->pId)->setStat($name, $val);
    }
  }

  public function incStat($name, $val = 1)
  {
    if (!$this->isAI()) {
      return Players::get($this->pId)->incStat($name, $val);
    }
  }

  public function resolveBoost()
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

  public function payHeats($n)
  {
    $cards = $this->getEngine()->limit($n);
    Cards::move($cards->getIds(), ['discard', $this->id]);
    $this->incStat('heatPayed', $n);
    return $cards;
  }

  public function getHeatsInHand()
  {
    return $this->getHand()->filter(function ($card) {
      return $card['effect'] == HEAT;
    });
  }

  public function getStressesInHand()
  {
    return $this->getHand()->filter(function ($card) {
      return $card['effect'] == STRESS;
    });
  }

  public function scrapCards($n)
  {
    $cards = [];
    for ($i = 0; $i < $n; $i++) {
      $cards[] = Cards::scrap($this->id);
    }
    return $cards;
  }

  public function canUseSymbol($symbol)
  {
    // Cooldown => must have something to cooldown in the hand
    if ($symbol == \COOLDOWN) {
      return $this->getHeatsInHand()->count() > 0;
    }
    // Reduce stress => must have stress cards in hand
    elseif ($symbol == \REDUCE) {
      return $this->getStressesInHand()->count() > 0;
    }
    // Heated boost => must be able to pay for it
    elseif ($symbol == \HEATED_BOOST) {
      return $this->getEngine()->count() > 0; // TODO : wheather can remove this
    }
    // Heat
    elseif ($symbol == HEAT) {
      return $this->getEngine()->count() > 0;
    }

    return true;
  }

  public function eliminate()
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

  public function giveUp()
  {
    $cell = -Constructors::count() + count(Globals::getSkippedPlayers()) + count(Globals::getGiveUpPlayers());
    $this->setCarCell($cell);
    $this->setTurn(Game::get()->getNbrLaps());
    $this->setSpeed(-1);
    $canLeave = $this->canLeave();
    Notifications::giveUp($this, $cell, $canLeave);
  }
}
