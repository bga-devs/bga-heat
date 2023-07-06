<?php
namespace AK\Cards\Cities;

class C22_Baalbek extends \AK\Models\Building
{
  public function __construct($row)
  {
    parent::__construct($row);
    $this->id = 'C22_Baalbek';
    $this->type = CITY;
    $this->number = 22;
    $this->name = clienttranslate('Baalbek');
    $this->country = clienttranslate('Lebanon');
    $this->text = [
      clienttranslate('The temple of Bacchus, one of the best preserved temples of the Greco-Roman world, is located here.'),
    ];

    $this->victoryPoint = 4;
    $this->initialKnowledge = 6;
    $this->startingSpace = 2;
    $this->activation = IMMEDIATE;
    $this->effect = [
      clienttranslate('If you have at least 3 <CITY> in your Past, this monument enters play with 5 <KNOWLEDGE> less.'),
    ];
    $this->implemented = true;
  }

  public function getInitialKnowledgeDiscount()
  {
    $n = $this->getPlayer()->countIcon(CITY);
    return $n >= 3 ? 5 : 0;
  }
}
