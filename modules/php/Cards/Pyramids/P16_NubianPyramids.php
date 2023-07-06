<?php
namespace AK\Cards\Pyramids;

class P16_NubianPyramids extends \AK\Models\Building
{
  public function __construct($row)
  {
    parent::__construct($row);
    $this->id = 'P16_NubianPyramids';
    $this->type = PYRAMID;
    $this->number = 16;
    $this->name = clienttranslate('Nubian Pyramids');
    $this->country = clienttranslate('Sudan');
    $this->text = [
      clienttranslate(
        'This is a complex of 220 pyramids in total, which serve as tombs for the kings and queens of Napata and Meroe.'
      ),
    ];

    $this->startingHand = 4;
    $this->victoryPoint = 1;
    $this->initialKnowledge = 3;
    $this->startingSpace = 2;
    $this->activation = IMMEDIATE;
    $this->effect = [clienttranslate('You may CREATE 1 <ARTEFACT>.')];
    $this->implemented = true;
  }

  public function getImmediateEffect()
  {
    return [
      'action' => CREATE,
      'args' => ['constraint' => [ARTEFACT]],
    ];
  }
}
