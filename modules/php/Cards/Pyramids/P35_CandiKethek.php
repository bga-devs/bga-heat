<?php
namespace AK\Cards\Pyramids;

class P35_CandiKethek extends \AK\Models\Building
{
  public function __construct($row)
  {
    parent::__construct($row);
    $this->id = 'P35_CandiKethek';
    $this->type = PYRAMID;
    $this->number = 35;
    $this->name = clienttranslate('Candi Kethek');
    $this->country = clienttranslate('Indonesia');
    $this->text = [clienttranslate('The temple has 7 west-facing terraces.')];

    $this->victoryPoint = 1;
    $this->initialKnowledge = 3;
    $this->startingSpace = 2;
    $this->activation = IMMEDIATE;
    $this->effect = [clienttranslate('Choose 2 available Technologies and put them on the bottom of their respective deck(s).')];
  }
}
