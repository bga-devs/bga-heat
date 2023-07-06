<?php
namespace AK\Technologies;

class T41_EmeraldTablet extends \AK\Models\Technology
{
  public function __construct($row)
  {
    parent::__construct($row);
    $this->id = 'T41_EmeraldTablet';
    $this->type = WRITING;
    $this->number = 41;
    $this->level = 2;
    $this->name = clienttranslate('Emerald Tablet');
    $this->requirement = [clienttranslate('3 <WRITING> in your collection.')];

    $this->activation = ENDGAME;
    $this->effect = [clienttranslate('2 <VP>')];
    $this->implemented = true;
  }

  public function canBePlayed($player)
  {
    return $player->countIcon(\WRITING) >= 3;
  }

  public function getScore()
  {
    return 2;
  }
}
