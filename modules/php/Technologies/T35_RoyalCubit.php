<?php
namespace AK\Technologies;

class T35_RoyalCubit extends \AK\Models\Technology
{
  public function __construct($row)
  {
    parent::__construct($row);
    $this->id = 'T35_RoyalCubit';
    $this->type = SECRET;
    $this->number = 35;
    $this->level = 2;
    $this->name = clienttranslate('Royal Cubit');
    $this->requirement = [clienttranslate('3 <SECRET> in your collection.')];

    $this->activation = ENDGAME;
    $this->effect = [clienttranslate('2 <VP>')];
    $this->implemented = true;
  }

  public function canBePlayed($player)
  {
    return $player->countIcon(SECRET) >= 3;
  }

  public function getScore()
  {
    return 2;
  }
}
