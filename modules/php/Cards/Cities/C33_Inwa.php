<?php
namespace AK\Cards\Cities;

class C33_Inwa extends \AK\Models\Building
{
  public function __construct($row)
  {
    parent::__construct($row);
    $this->id = 'C33_Inwa';
    $this->type = CITY;
    $this->number = 33;
    $this->name = clienttranslate('Inwa');
    $this->country = clienttranslate('Myanmar');
    $this->text = [clienttranslate('It was formerly called Ava or Ratanapura: the City of Gems.')];

    $this->victoryPoint = 4;
    $this->initialKnowledge = 6;
    $this->startingSpace = 2;
    $this->activation = IMMEDIATE;
    $this->effect = [clienttranslate('If you have at least 3 <SECRET>,this monument enters play with 5 <KNOWLEDGE> less.')];
    $this->implemented = true;
  }

  public function getInitialKnowledgeDiscount()
  {
    $n = $this->getPlayer()->countIcon(SECRET);
    return $n >= 3 ? 5 : 0;
  }
}
