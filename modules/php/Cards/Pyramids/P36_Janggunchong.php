<?php
namespace AK\Cards\Pyramids;

class P36_Janggunchong extends \AK\Models\Building
{
  public function __construct($row)
  {
    parent::__construct($row);
    $this->id = 'P36_Janggunchong';
    $this->type = PYRAMID;
    $this->number = 36;
    $this->name = clienttranslate('Janggun-chong');
    $this->country = clienttranslate('China');
    $this->text = [
      clienttranslate('Nicknamed the "Tomb of the General," this ancient Korean pyramid is 75 meter high and 11 meters wide.'),
    ];

    $this->victoryPoint = 1;
    $this->initialKnowledge = 3;
    $this->startingSpace = 2;
    $this->activation = ENDGAME;
    $this->effect = [clienttranslate('If you have at least 3 monuments in your Timeline, gain 6 <VP>.')];
    $this->implemented = true;
  }

  public function getScore()
  {
    $n = $this->getPlayer()
      ->getTimeline()
      ->count();
    return $n < 3 ? 0 : 6;
  }
}
