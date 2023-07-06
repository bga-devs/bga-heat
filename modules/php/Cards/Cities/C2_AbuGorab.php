<?php
namespace AK\Cards\Cities;

class C2_AbuGorab extends \AK\Models\Building
{
  public function __construct($row)
  {
    parent::__construct($row);
    $this->id = 'C2_AbuGorab';
    $this->type = CITY;
    $this->number = 2;
    $this->name = clienttranslate('Abu Gorab');
    $this->country = clienttranslate('Egypt');
    $this->text = [clienttranslate('Located 15 km south of Cairo, it houses the solar temple of King Nyuserre Ini.')];

    $this->victoryPoint = 0;
    $this->initialKnowledge = 4;
    $this->startingSpace = 4;
    $this->discard = 1;
    $this->activation = ENDGAME;
    $this->effect = [
      clienttranslate('If you have 3 <SECRET> or 4 <SECRET>, gain 4 <VP>.'),
      clienttranslate('or, if you have 5 <SECRET> or more, gain 7 <VP>.'),
    ];
    $this->implemented = true;
  }

  public function getScore()
  {
    return $this->getReward(SECRET, [3 => 4, 5 => 7]);
  }
}
