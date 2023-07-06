<?php
namespace AK\Cards\Monoliths;

class M9_AramuMuru extends \AK\Models\Building
{
  public function __construct($row)
  {
    parent::__construct($row);
    $this->id = 'M9_AramuMuru';
    $this->type = MONOLITH;
    $this->number = 9;
    $this->name = clienttranslate('Aramu Muru');
    $this->country = clienttranslate('Peru');
    $this->text = [clienttranslate('This abandoned Inca construction is nicknamed "The Gate of the Gods."')];

    $this->victoryPoint = 2;
    $this->initialKnowledge = 2;
    $this->startingSpace = 3;
    $this->discard = 1;
    $this->lockedSpace = true;
    $this->activation = DECLINE;
    $this->effect = [
      clienttranslate(
        'Each of your opponents must discard 2 cards from their hand. If an opponent has less than 2 cards in hand, they discard as many as they can.'
      ),
    ];
  }
}
