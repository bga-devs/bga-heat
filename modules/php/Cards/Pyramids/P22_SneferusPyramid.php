<?php
namespace AK\Cards\Pyramids;

class P22_SneferusPyramid extends \AK\Models\Building
{
  public function __construct($row)
  {
    parent::__construct($row);
    $this->id = 'P22_SneferusPyramid';
    $this->type = PYRAMID;
    $this->number = 22;
    $this->name = clienttranslate('Sneferu’s Pyramid');
    $this->country = clienttranslate('Egypt');
    $this->text = [
      clienttranslate(
        'Its particular shape deems it a failed attempt at a pyramid with smooth faces, the final stage in the evolution of pyramids.'
      ),
    ];

    $this->victoryPoint = 2;
    $this->initialKnowledge = 3;
    $this->startingSpace = 5;
    $this->activation = ANYTIME;
    $this->effect = [clienttranslate('Your other <CITY> enter play with 1 <KNOWLEDGE> less.')];
    $this->implemented = true;
  }

  public function getKnowledgeReduction($card)
  {
    return $card->getType() == CITY ? 1 : 0;
  }
}
