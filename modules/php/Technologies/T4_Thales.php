<?php
namespace AK\Technologies;

class T4_Thales extends \AK\Models\Technology
{
  public function __construct($row)
  {
    parent::__construct($row);
    $this->id = 'T4_Thales';
    $this->type = ANCIENT;
    $this->number = 4;
    $this->level = 1;
    $this->name = clienttranslate('Thales');

    $this->activation = IMMEDIATE;
    $this->effect = [
      clienttranslate("Look at the top 8 cards of the deck:
• take 1;
• and discard the remaining cards."),
    ];
  }
}
