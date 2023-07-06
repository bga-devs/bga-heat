<?php
namespace AK\Cards\Megaliths;

class M18_DolmenOfMenga extends \AK\Models\Building
{
  public function __construct($row)
  {
    parent::__construct($row);
    $this->id = 'M18_DolmenOfMenga';
    $this->type = MEGALITH;
    $this->number = 18;
    $this->name = clienttranslate('Dolmen Of Menga');
    $this->country = clienttranslate('Spain');
    $this->text = [
      clienttranslate(
        'This dolmen measures 25 meters long and 4 meters high with a covered gallery. The roof is made up of five slabs, the largest weighing 180 tons.'
      ),
    ];

    $this->startingHand = 1;
    $this->victoryPoint = 1;
    $this->initialKnowledge = 3;
    $this->startingSpace = 6;
    $this->activation = IMMEDIATE;
    $this->effect = [clienttranslate('You may CREATE an extra monument.')];
    $this->implemented = true;
  }

  public function getImmediateEffect()
  {
    return [
      'action' => CREATE,
      'args' => ['constraint' => BUILDINGS],
    ];
  }
}
