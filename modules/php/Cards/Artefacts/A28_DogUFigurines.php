<?php
namespace AK\Cards\Artefacts;

class A28_DogUFigurines extends \AK\Models\Artefact
{
  public function __construct($row)
  {
    parent::__construct($row);
    $this->id = 'A28_DogUFigurines';
    $this->type = ARTEFACT;
    $this->number = 28;
    $this->name = clienttranslate('DogŪ Figurines');
    $this->country = clienttranslate('Japan');
    $this->text = [clienttranslate('The function of these enigmatic statuettes from the Jōmon period remains unknown.')];
    $this->activation = ANYTIME;
    $this->effect = [clienttranslate('Your <CITY> enter play with 1 <KNOWLEDGE> less.')];
    $this->implemented = true;
  }

  public function getKnowledgeReduction($card)
  {
    return $card->getType() == CITY ? 1 : 0;
  }
}
