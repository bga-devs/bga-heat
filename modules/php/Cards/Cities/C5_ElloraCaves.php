<?php
namespace AK\Cards\Cities;

class C5_ElloraCaves extends \AK\Models\Building
{
  public function __construct($row)
  {
    parent::__construct($row);
    $this->id = 'C5_ElloraCaves';
    $this->type = CITY;
    $this->number = 5;
    $this->name = clienttranslate('Ellora Caves');
    $this->country = clienttranslate('India');
    $this->text = [
      clienttranslate('400 million kg of stone were dug out of the mountain. It is twice the size of the Parthenon in Athens.'),
    ];

    $this->startingHand = 1;
    $this->victoryPoint = 0;
    $this->initialKnowledge = 3;
    $this->startingSpace = 5;
    $this->discard = 2;
    $this->activation = ENDGAME;
    $this->effect = [clienttranslate('Gain 1 <VP> for each <CITY> in your Past.')];
    $this->implemented = true;
  }

  public function getScore()
  {
    return $this->getPlayer()->countIcon(CITY);
  }
}
