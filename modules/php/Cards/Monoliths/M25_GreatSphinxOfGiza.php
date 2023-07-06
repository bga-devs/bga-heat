<?php
namespace AK\Cards\Monoliths;

class M25_GreatSphinxOfGiza extends \AK\Models\Building
{
  public function __construct($row)
  {
    parent::__construct($row);
    $this->id = 'M25_GreatSphinxOfGiza';
    $this->type = MONOLITH;
    $this->number = 25;
    $this->name = clienttranslate('Great Sphinx Of Giza');
    $this->country = clienttranslate('Egypt');
    $this->text = [
      clienttranslate(
        'This is the largest monolithic monumental sculpture in the world at 73 meters long, 14 meters wide, and 20 meters high.'
      ),
    ];

    $this->victoryPoint = 1;
    $this->initialKnowledge = 3;
    $this->startingSpace = 2;
    $this->activation = IMMEDIATE;
    $this->effect = [clienttranslate('Add 2 <KNOWLEDGE> from the reserve to any monument in each of your opponents’ Timelines.')];
  }
}
