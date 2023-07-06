<?php
namespace AK\Cards\Artefacts;

class A18_DogonMythology extends \AK\Models\Artefact
{
  public function __construct($row)
  {
    parent::__construct($row);
    $this->id = 'A18_DogonMythology';
    $this->type = ARTEFACT;
    $this->number = 18;
    $this->name = clienttranslate('Dogon Mythology');
    $this->country = clienttranslate('Mali');
    $this->text = [
      clienttranslate(
        'Suspected of having discovered the white dwarf Sirius B, the Dogons of Mali have their own astronomical legends.'
      ),
    ];
    $this->activation = ANYTIME;
    $this->effect = [clienttranslate('Each time you LEARN 1 <ANCIENT>, draw 2 cards.')];
  }
}
