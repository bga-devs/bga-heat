<?php
namespace AK\Cards\Cities;

class C3_GobekliTepe extends \AK\Models\Building
{
  public function __construct($row)
  {
    parent::__construct($row);
    $this->id = 'C3_GobekliTepe';
    $this->type = CITY;
    $this->number = 3;
    $this->name = clienttranslate('Göbekli Tepe');
    $this->country = clienttranslate('Türkiye');
    $this->text = [clienttranslate('Built around 10,000 BC, this temple challenged our historical chronology.')];

    $this->victoryPoint = 0;
    $this->initialKnowledge = 4;
    $this->startingSpace = 5;
    $this->discard = 2;
    $this->activation = ENDGAME;
    $this->effect = [
      clienttranslate(
        'Choose 1 type of monument (<CITY>, <MEGALITH> ou <PYRAMID> ). Gain 1 <VP> for each monument of this type in your Past.'
      ),
    ];

    $this->implemented = true;
  }

  public function getScore()
  {
    $icons = $this->getPlayer()->countIcons(BUILDINGS);
    return max($icons);
  }
}
