<?php
namespace AK\Cards\Monoliths;

class M3_AswanObelisk extends \AK\Models\Building
{
  public function __construct($row)
  {
    parent::__construct($row);
    $this->id = 'M3_AswanObelisk';
    $this->type = MONOLITH;
    $this->number = 3;
    $this->name = clienttranslate('Aswan Obelisk');
    $this->country = clienttranslate('Egypt');
    $this->text = [
      clienttranslate('Almost 42 meters long, it is cut on three sides. Its weight is estimated at around 1200 tons.'),
    ];

    $this->victoryPoint = 1;
    $this->initialKnowledge = 2;
    $this->startingSpace = 4;
    $this->discard = 1;
    $this->activation = ENDGAME;
    $this->effect = [clienttranslate('Gain 1 <VP> for each <PYRAMID> in your past.')];
  }
}
