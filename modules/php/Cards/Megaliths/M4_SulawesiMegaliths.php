<?php
namespace AK\Cards\Megaliths;

class M4_SulawesiMegaliths extends \AK\Models\Building
{
  public function __construct($row)
  {
    parent::__construct($row);
    $this->id = 'M4_SulawesiMegaliths';
    $this->type = MEGALITH;
    $this->number = 4;
    $this->name = clienttranslate('Sulawesi Megaliths');
    $this->country = clienttranslate('Indonesia');
    $this->text = [clienttranslate('Discovered in 1908 in the Bada Valley, the dating of these megaliths remains unknown.')];

    $this->victoryPoint = 1;
    $this->initialKnowledge = 2;
    $this->startingSpace = 3;
    $this->discard = 1;
    $this->activation = ENDGAME;
    $this->effect = [clienttranslate('If you have at least 7 <MEGALITH> in your Past, gain 6 <VP>.')];
    $this->implemented = true;
  }

  public function getScore()
  {
    return $this->getReward(MEGALITH, [7 => 6]);
  }
}
