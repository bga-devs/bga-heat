<?php
namespace AK\Cards\Monoliths;

class M36_PoulnabroneDolmen extends \AK\Models\Building
{
  public function __construct($row)
  {
    parent::__construct($row);
    $this->id = 'M36_PoulnabroneDolmen';
    $this->type = MONOLITH;
    $this->number = 36;
    $this->name = clienttranslate('Poulnabrone Dolmen');
    $this->country = clienttranslate('Ireland');
    $this->text = [
      clienttranslate('The rectangular shape of the top table is particularly rare and is said to weigh several tons.'),
    ];

    $this->victoryPoint = 0;
    $this->initialKnowledge = 0;
    $this->startingSpace = 6;
    $this->activation = ANYTIME;
    $this->effect = [
      clienttranslate('If you have at least 11 cards in your Past when you CREATE a monument, you may CREATE 2 instead.'),
    ];
  }
}
