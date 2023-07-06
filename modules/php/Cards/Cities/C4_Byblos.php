<?php
namespace AK\Cards\Cities;

class C4_Byblos extends \AK\Models\Building
{
  public function __construct($row)
  {
    parent::__construct($row);
    $this->id = 'C4_Byblos';
    $this->type = CITY;
    $this->number = 4;
    $this->name = clienttranslate('Byblos');
    $this->country = clienttranslate('Liban');
    $this->text = [clienttranslate('The Greeks named it so because papyrus was imported into Greece from Gebal.')];

    $this->victoryPoint = 1;
    $this->initialKnowledge = 2;
    $this->startingSpace = 5;
    $this->discard = 2;
    $this->activation = ENDGAME;
    $this->effect = [
      clienttranslate(
        'Gain 2 <VP> for each set of 3 different types of monuments (<CITY>, <MEGALITH> and <PYRAMID>) in your Past.'
      ),
    ];

    $this->implemented = true;
  }

  public function getScore()
  {
    $icons = $this->getPlayer()->countIcons(BUILDINGS);
    return 2 * min($icons);
  }
}
