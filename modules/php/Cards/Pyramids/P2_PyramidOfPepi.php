<?php
namespace AK\Cards\Pyramids;

class P2_PyramidOfPepi extends \AK\Models\Building
{
  public function __construct($row)
  {
    parent::__construct($row);
    $this->id = 'P2_PyramidOfPepi';
    $this->type = PYRAMID;
    $this->number = 2;
    $this->name = clienttranslate('Pyramid Of Pepi Ii');
    $this->country = clienttranslate('Egypt');
    $this->text = [clienttranslate('Full of Pyramid Texts, it is the last pyramidal complex of the Old Kingdom.')];

    $this->victoryPoint = 1;
    $this->initialKnowledge = 2;
    $this->startingSpace = 3;
    $this->discard = 1;
    $this->activation = ENDGAME;
    $this->effect = [clienttranslate('If you have at least 7 <CITY> in your Past, gain 6 <VP> ')];
    $this->implemented = true;
  }

  public function getScore()
  {
    return $this->getReward(CITY, [7 => 6]);
  }
}
