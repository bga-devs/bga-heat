<?php
namespace AK\Cards\Megaliths;

class M21_BaalbekTrilithon extends \AK\Models\Building
{
  public function __construct($row)
  {
    parent::__construct($row);
    $this->id = 'M21_BaalbekTrilithon';
    $this->type = MEGALITH;
    $this->number = 21;
    $this->name = clienttranslate('Baalbek Trilithon');
    $this->country = clienttranslate('Lebanon');
    $this->text = [
      clienttranslate('The Stone of the Pregnant Woman is one of the largest monoliths ever cut and transported by man.'),
    ];

    $this->victoryPoint = 5;
    $this->initialKnowledge = 7;
    $this->startingSpace = 3;
    $this->activation = IMMEDIATE;
    $this->effect = [
      clienttranslate('If you have at least 4 <MEGALITH> in your Past, this monument enters play with 6 <KNOWLEDGE> less.'),
    ];
    $this->implemented = true;
  }

  public function getInitialKnowledgeDiscount()
  {
    $n = $this->getPlayer()->countIcon(MEGALITH);
    return $n >= 4 ? 6 : 0;
  }
}
