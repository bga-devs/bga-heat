<?php
namespace AK\Cards\Megaliths;

class M17_FortSamaipata extends \AK\Models\Building
{
  public function __construct($row)
  {
    parent::__construct($row);
    $this->id = 'M17_FortSamaipata';
    $this->type = MEGALITH;
    $this->number = 17;
    $this->name = clienttranslate('Fort Samaipata');
    $this->country = clienttranslate('Bolivia');
    $this->text = [
      clienttranslate(
        'This fort is an immense tabular rock, with basins and canals dug into the rock, accompanied by two feline figures.'
      ),
    ];

    $this->startingHand = 4;
    $this->victoryPoint = 4;
    $this->initialKnowledge = 6;
    $this->startingSpace = 2;
    $this->activation = IMMEDIATE;
    $this->effect = [
      clienttranslate('If you have at least 3 <MEGALITH> in your Past, this monument comes into play with 5 <KNOWLEDGE> less.'),
    ];
    $this->implemented = true;
  }

  public function getInitialKnowledgeDiscount()
  {
    $n = $this->getPlayer()->countIcon(MEGALITH);
    return $n >= 3 ? 5 : 1;
  }
}
