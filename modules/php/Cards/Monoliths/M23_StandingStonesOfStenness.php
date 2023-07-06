<?php
namespace AK\Cards\Monoliths;

class M23_StandingStonesOfStenness extends \AK\Models\Building
{
  public function __construct($row)
  {
    parent::__construct($row);
    $this->id = 'M23_StandingStonesOfStenness';
    $this->type = MONOLITH;
    $this->number = 23;
    $this->name = clienttranslate('Standing Stones Of Stenness');
    $this->country = clienttranslate('Scotland');
    $this->text = [
      clienttranslate('Originally made up of a circle of 12 stones, only four remain, the largest with a 6 meter diameter.'),
    ];

    $this->victoryPoint = 2;
    $this->initialKnowledge = 2;
    $this->startingSpace = 5;
    $this->discard = 1;
    $this->activation = IMMEDIATE;
    $this->effect = [clienttranslate('Discard 1 <KNOWLEDGE> from each of your other <MONOLITH>.')];
  }
}
