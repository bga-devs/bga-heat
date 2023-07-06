<?php
namespace AK\Technologies;

class T32_Akhenaten extends \AK\Models\Technology
{
  public function __construct($row)
  {
    parent::__construct($row);
    $this->id = 'T32_Akhenaten';
    $this->type = ANCIENT;
    $this->number = 32;
    $this->level = 2;
    $this->name = clienttranslate('Akhenaten');
    $this->requirement = [clienttranslate('4 <PYRAMID> in your past.')];

    $this->activation = ENDGAME;
    $this->effect = [clienttranslate('3 <VP>')];
    $this->implemented = true;
  }

  public function canBePlayed($player)
  {
    return $player->countIcon(PYRAMID) >= 4;
  }

  public function getScore()
  {
    return 3;
  }
}
