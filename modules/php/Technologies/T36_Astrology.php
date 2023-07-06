<?php
namespace AK\Technologies;

class T36_Astrology extends \AK\Models\Technology
{
  public function __construct($row)
  {
    parent::__construct($row);
    $this->id = 'T36_Astrology';
    $this->type = SECRET;
    $this->number = 36;
    $this->level = 2;
    $this->name = clienttranslate('Astrology');
    $this->requirement = [clienttranslate('10 cards in your hand.')];

    $this->activation = ENDGAME;
    $this->effect = [clienttranslate('2 <VP>')];
    $this->implemented = true;
  }

  public function canBePlayed($player)
  {
    return $player->getHand()->count() >= 10;
  }

  public function getScore()
  {
    return 2;
  }
}
