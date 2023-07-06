<?php
namespace AK\Cards\Cities;

class C24_EasterIsland extends \AK\Models\Building
{
  public function __construct($row)
  {
    parent::__construct($row);
    $this->id = 'C24_EasterIsland';
    $this->type = CITY;
    $this->number = 24;
    $this->name = clienttranslate('Easter Island');
    $this->country = clienttranslate('Chile');
    $this->text = [clienttranslate('The first inhabitants called it Rapa Nui, which means "the navel of the world."')];

    $this->victoryPoint = 2;
    $this->initialKnowledge = 3;
    $this->startingSpace = 5;
    $this->activation = ANYTIME;
    $this->effect = [clienttranslate('Your other <CITY> enter play with 1 <KNOWLEDGE> less.')];
    $this->implemented = true;
  }

  public function getKnowledgeReduction($card)
  {
    return $card->getType() == CITY ? 1 : 0;
  }
}
