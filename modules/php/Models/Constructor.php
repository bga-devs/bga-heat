<?php
namespace HEAT\Models;
use HEAT\Managers\Players;
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
    ]);
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

  public function getLine()
  {
    return Game::get()
      ->getCircuit()
      ->getLine($this);
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

  public function getDiscard()
  {
    return Cards::getDiscard($this->id);
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
}
