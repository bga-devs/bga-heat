<?php
namespace AK\Cards\Pyramids;

class P17_TheQueensPyramids extends \AK\Models\Building
{
  public function __construct($row)
  {
    parent::__construct($row);
    $this->id = 'P17_TheQueensPyramids';
    $this->type = PYRAMID;
    $this->number = 17;
    $this->name = clienttranslate('The Queen’s Pyramids');
    $this->country = clienttranslate('Egypt');
    $this->text = [clienttranslate('The pyramid built for Queen Meritites measures 31 meters high.')];

    $this->victoryPoint = 4;
    $this->initialKnowledge = 5;
    $this->startingSpace = 3;
    $this->activation = IMMEDIATE;
    $this->effect = [clienttranslate('This monument enters play with 1 <KNOWLEDGE> less for each <PYRAMID> in your Past.')];
    $this->implemented = true;
  }

  public function getInitialKnowledgeDiscount()
  {
    $n = $this->getPlayer()->countIcon(PYRAMID);
    return $n;
  }
}
