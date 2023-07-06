<?php
namespace AK\Cards\Pyramids;

class P4_Palenque extends \AK\Models\Building
{
  public function __construct($row)
  {
    parent::__construct($row);
    $this->id = 'P4_Palenque';
    $this->type = PYRAMID;
    $this->number = 4;
    $this->name = clienttranslate('Palenque');
    $this->country = clienttranslate('Mexico');
    $this->text = [
      clienttranslate('Made up of several temples and pyramids, it is one of the most impressive sites of Mayan culture.'),
    ];

    $this->victoryPoint = 0;
    $this->initialKnowledge = 4;
    $this->startingSpace = 4;
    $this->discard = 1;
    $this->activation = ENDGAME;
    $this->effect = [
      clienttranslate("• If you have 3 <WRITING> or 4 <WRITING>, gain 4 <VP>;
• or, if you have 5 <WRITING> or more, gain 7 <VP>."),
    ];
    $this->implemented = true;
  }

  public function getScore()
  {
    return $this->getReward(WRITING, [3 => 4, 5 => 7]);
  }
}
