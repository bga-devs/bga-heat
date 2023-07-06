<?php
namespace AK\Cards\Cities;

class C1_Osirion extends \AK\Models\Building
{
  public function __construct($row)
  {
    parent::__construct($row);
    $this->id = 'C1_Osirion';
    $this->type = CITY;
    $this->number = 1;
    $this->name = clienttranslate('Osirion');
    $this->country = clienttranslate('Egypt');
    $this->text = [clienttranslate('Built for King Seti I of the 19th Dynasty, Abydos is the holy city of the god Osiris.')];

    $this->victoryPoint = 0;
    $this->initialKnowledge = 4;
    $this->startingSpace = 4;
    $this->discard = 1;
    $this->activation = ENDGAME;
    $this->effect = [
      clienttranslate('If you have 3 <ANCIENT> or 4 <ANCIENT>, gain 4 <VP>.'),
      clienttranslate('or, if you have 5 <ANCIENT> or more, gain 7 <VP>.'),
    ];
    $this->implemented = true;
  }

  public function getScore()
  {
    return $this->getReward(ANCIENT, [3 => 4, 5 => 7]);
  }
}
