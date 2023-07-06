<?php
namespace AK\Cards\Monoliths;

class M1_Stonehenge extends \AK\Models\Building
{
  public function __construct($row)
  {
    parent::__construct($row);
    $this->id = 'M1_Stonehenge';
    $this->type = MONOLITH;
    $this->number = 1;
    $this->name = clienttranslate('Stonehenge');
    $this->country = clienttranslate('England');
    $this->text = [
      clienttranslate(
        'Astronomical calendar, observatory, or temple dedicated to worshipping the sun? Its function is still debated.'
      ),
    ];

    $this->victoryPoint = 1;
    $this->initialKnowledge = 4;
    $this->startingSpace = 3;
    $this->discard = 1;
    $this->activation = ENDGAME;
    $this->effect = [
      clienttranslate(
        'Gain 2 <VP> for each set of 3 different types of Technology (<ANCIENT>, <WRITING> and <SECRET>) you have.'
      ),
    ];
  }
}
