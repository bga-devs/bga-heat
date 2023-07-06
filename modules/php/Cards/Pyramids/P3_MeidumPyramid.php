<?php
namespace AK\Cards\Pyramids;

class P3_MeidumPyramid extends \AK\Models\Building
{
  public function __construct($row)
  {
    parent::__construct($row);
    $this->id = 'P3_MeidumPyramid';
    $this->type = PYRAMID;
    $this->number = 3;
    $this->name = clienttranslate('Meidum Pyramid');
    $this->country = clienttranslate('Egypt');
    $this->text = [clienttranslate('Attributed to Sneferu, it was transformed into the first Egyptian smooth-faced pyramid.')];

    $this->victoryPoint = 0;
    $this->initialKnowledge = 4;
    $this->startingSpace = 4;
    $this->discard = 1;
    $this->activation = ENDGAME;
    $this->effect = [
      clienttranslate("• If you have 3 <SECRET> or 4 <SECRET>, gain 4 <VP>;
• or, if you have 5 <SECRET> or more, gain 7 <VP>."),
    ];
    $this->implemented = true;
  }

  public function getScore()
  {
    return $this->getReward(SECRET, [3 => 4, 5 => 7]);
  }
}
