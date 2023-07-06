<?php
namespace AK\Cards\Pyramids;

class P5_CahuachiPyramids extends \AK\Models\Building
{
  public function __construct($row)
  {
    parent::__construct($row);
    $this->id = 'P5_CahuachiPyramids';
    $this->type = PYRAMID;
    $this->number = 5;
    $this->name = clienttranslate('Cahuachi Pyramids');
    $this->country = clienttranslate('Peru');
    $this->text = [
      clienttranslate(
        'This is the largest site ever discovered dating from the Nazca civilization. Less than 5% of the ruins have been excavated.'
      ),
    ];

    $this->victoryPoint = 1;
    $this->initialKnowledge = 4;
    $this->startingSpace = 3;
    $this->discard = 1;
    $this->activation = ENDGAME;
    $this->effect = [
      clienttranslate(
        'Gain 2 <VP> for each set of 3 different types of Technology (<ANCIENT>, <WRITING> and <SECRET>) you have.'
      ),
    ];
    $this->implemented = true;
  }

  public function getScore()
  {
    return 2 * min($this->getPlayer()->countIcons(\TECHNOLOGIES));
  }
}
