<?php
namespace AK\Cards\Monoliths;

class M16_DiquisStoneSpheres extends \AK\Models\Building
{
  public function __construct($row)
  {
    parent::__construct($row);
    $this->id = 'M16_DiquisStoneSpheres';
    $this->type = MONOLITH;
    $this->number = 16;
    $this->name = clienttranslate('DiquÍs Stone Spheres');
    $this->country = clienttranslate('Costa Rica');
    $this->text = [
      clienttranslate(
        'How were these spheres moved across the country and what is their significance? Scientists continue to wonder...'
      ),
    ];

    $this->victoryPoint = 1;
    $this->initialKnowledge = 3;
    $this->startingSpace = 2;
    $this->activation = IMMEDIATE;
    $this->startingHand = 2;
    $this->effect = [clienttranslate('You may CREATE 1 <ARTEFACT>.')];
  }
}
