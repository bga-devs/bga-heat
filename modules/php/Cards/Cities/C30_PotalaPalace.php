<?php
namespace AK\Cards\Cities;

class C30_PotalaPalace extends \AK\Models\Building
{
  public function __construct($row)
  {
    parent::__construct($row);
    $this->id = 'C30_PotalaPalace';
    $this->type = CITY;
    $this->number = 30;
    $this->name = clienttranslate('Potala Palace');
    $this->country = clienttranslate('China');
    $this->text = [
      clienttranslate(
        'It was the main residence of successive Dalai Lamas and housed the Tibetan government until the flight of the 14th Dalai Lama to India.'
      ),
    ];

    $this->victoryPoint = 8;
    $this->initialKnowledge = 3;
    $this->startingSpace = 3;
    $this->activation = IMMEDIATE;
    $this->effect = [clienttranslate('Skip your DECLINE PHASE this turn.')];
  }
}
