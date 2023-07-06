<?php
namespace AK\Technologies;

class T3_HermesTrismegistus extends \AK\Models\Technology
{
  public function __construct($row)
  {
    parent::__construct($row);
    $this->id = 'T3_HermesTrismegistus';
    $this->type = ANCIENT;
    $this->number = 3;
    $this->level = 1;
    $this->name = clienttranslate('Hermes Trismegistus');

    $this->activation = IMMEDIATE;
    $this->effect = [
      clienttranslate("Reveal the top 5 cards of the deck:
• each player chooses 1, going clockwise;
• take a second card, then discard any remaining cards."),
    ];
  }
}
