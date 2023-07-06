<?php
namespace AK\Cards\Megaliths;

class M32_GiantsTomb extends \AK\Models\Building
{
  public function __construct($row)
  {
    parent::__construct($row);
    $this->id = 'M32_GiantsTomb';
    $this->type = MEGALITH;
    $this->number = 32;
    $this->name = clienttranslate('Giants’ Tomb');
    $this->country = clienttranslate('Italy');
    $this->text = [
      clienttranslate('Funeral monument made up of collective burials belonging to the Nuragic culture present in Sardinia.'),
    ];

    $this->victoryPoint = 0;
    $this->initialKnowledge = 1;
    $this->startingSpace = 5;
    $this->discard = 1;
    $this->activation = ENDGAME;
    $this->effect = [clienttranslate('If you have at least 20 <LOST_KNOWLEDGE> on your board, gain 12 <VP>.')];
    $this->implemented = true;
  }

  public function getScore()
  {
    return $this->getPlayer()->getLostKnowledge() >= 20 ? 12 : 0;
  }
}
