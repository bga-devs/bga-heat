<?php
namespace AK\Technologies;

class T22_AncientGreek extends \AK\Models\Technology
{
  public function __construct($row)
  {
    parent::__construct($row);
    $this->id = 'T22_AncientGreek';
    $this->type = WRITING;
    $this->number = 22;
    $this->level = 1;
    $this->name = clienttranslate('Ancient Greek');

    $this->activation = IMMEDIATE;
    $this->effect = [
      clienttranslate("Draw the top 10 cards of the deck:
• choose and CREATE 1 <ARTEFACT>;
• and discard the remaining cards."),
    ];
  }
}
