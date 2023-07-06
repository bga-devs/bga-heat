<?php
namespace AK\Technologies;

class T29_Plato extends \AK\Models\Technology
{
  public function __construct($row)
  {
    parent::__construct($row);
    $this->id = 'T29_Plato';
    $this->type = ANCIENT;
    $this->number = 29;
    $this->level = 2;
    $this->name = clienttranslate('Plato');
    $this->requirement = [clienttranslate('7 monuments of the same type in your Past.')];

    $this->activation = ENDGAME;
    $this->effect = [clienttranslate('4 <VP>')];
    $this->implemented = true;
  }

  public function canBePlayed($player)
  {
    return max($player->countIcons(BUILDINGS)) >= 7;
  }

  public function getScore()
  {
    return 4;
  }
}
