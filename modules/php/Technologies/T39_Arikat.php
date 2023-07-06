<?php
namespace AK\Technologies;

class T39_Arikat extends \AK\Models\Technology
{
  public function __construct($row)
  {
    parent::__construct($row);
    $this->id = 'T39_Arikat';
    $this->type = SECRET;
    $this->number = 39;
    $this->level = 2;
    $this->name = clienttranslate('Ari-kat');
    $this->requirement = [clienttranslate('3 <CITY>, 3 <MEGALITH>, 3 <PYRAMID> in your past.')];

    $this->activation = ENDGAME;
    $this->effect = [clienttranslate('5 <VP>')];
    $this->implemented = true;
  }

  public function canBePlayed($player)
  {
    return min(0, $player->countIcons(BUILDINGS)) >= 3;
  }

  public function getScore()
  {
    return 5;
  }
}
