<?php
namespace AK\Technologies;

class T42_SumerianCuneiforms extends \AK\Models\Technology
{
  public function __construct($row)
  {
    parent::__construct($row);
    $this->id = 'T42_SumerianCuneiforms';
    $this->type = WRITING;
    $this->number = 42;
    $this->level = 2;
    $this->name = clienttranslate('Sumerian Cuneiforms');
    $this->requirement = [clienttranslate('6 Technology cards (<ANCIENT>,<WRITING> ou <SECRET>).')];

    $this->activation = ENDGAME;
    $this->effect = [clienttranslate('2 <VP>')];
    $this->implemented = true;
  }

  public function canBePlayed($player)
  {
    return array_sum($player->countIcons(\TECHNOLOGIES)) >= 6;
  }

  public function getScore()
  {
    return 2;
  }
}
