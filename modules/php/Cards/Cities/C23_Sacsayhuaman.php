<?php
namespace AK\Cards\Cities;

class C23_Sacsayhuaman extends \AK\Models\Building
{
  public function __construct($row)
  {
    parent::__construct($row);
    $this->id = 'C23_Sacsayhuaman';
    $this->type = CITY;
    $this->number = 23;
    $this->name = clienttranslate('SacsayhuamÁn');
    $this->country = clienttranslate('Peru');
    $this->text = [clienttranslate("This fortress is shaped like a puma's head, a sacred animal in Inca tradition.")];

    $this->victoryPoint = 6;
    $this->initialKnowledge = 8;
    $this->startingSpace = 3;
    $this->activation = IMMEDIATE;
    $this->effect = [
      clienttranslate('If you have at least 3 <CITY> in your Past, this monument enters play with 6 <KNOWLEDGE> less.'),
    ];
    $this->implemented = true;
  }

  public function getInitialKnowledgeDiscount()
  {
    $n = $this->getPlayer()->countIcon(CITY);
    return $n >= 3 ? 6 : 0;
  }
}
