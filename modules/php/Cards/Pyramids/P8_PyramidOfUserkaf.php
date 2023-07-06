<?php
namespace AK\Cards\Pyramids;

class P8_PyramidOfUserkaf extends \AK\Models\Building
{
  public function __construct($row)
  {
    parent::__construct($row);
    $this->id = 'P8_PyramidOfUserkaf';
    $this->type = PYRAMID;
    $this->number = 8;
    $this->name = clienttranslate('Pyramid Of Userkaf');
    $this->country = clienttranslate('Egypt');
    $this->text = [
      clienttranslate(
        'Pyramid from the Fifth Dynasty, it demonstrates a change of ideas in the construction of royal funerary monuments.'
      ),
    ];

    $this->victoryPoint = 1;
    $this->initialKnowledge = 3;
    $this->startingSpace = 3;
    $this->activation = DECLINE;
    $this->effect = [clienttranslate('Each of your opponents must discard 1 <ARTEFACT> from their board.')];
  }
}
