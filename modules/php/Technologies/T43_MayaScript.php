<?php
namespace AK\Technologies;

class T43_MayaScript extends \AK\Models\Technology
{
  public function __construct($row)
  {
    parent::__construct($row);
    $this->id = 'T43_MayaScript';
    $this->type = WRITING;
    $this->number = 43;
    $this->level = 2;
    $this->name = clienttranslate('Maya Script');
    $this->requirement = [clienttranslate('10 monuments in your past.')];

    $this->activation = ENDGAME;
    $this->effect = [clienttranslate('2 <VP>')];
    $this->implemented = true;
  }

  public function canBePlayed($player)
  {
    return array_sum($player->countIcons(BUILDINGS)) >= 10;
  }

  public function getScore()
  {
    return 2;
  }
}
