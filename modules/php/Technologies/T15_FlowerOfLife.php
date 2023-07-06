<?php
namespace AK\Technologies;

class T15_FlowerOfLife extends \AK\Models\Technology
{
  public function __construct($row)
  {
    parent::__construct($row);
    $this->id = 'T15_FlowerOfLife';
    $this->type = SECRET;
    $this->number = 15;
    $this->level = 1;
    $this->name = clienttranslate('Flower Of Life');
    $this->requirement = [clienttranslate('2 <CITY> in your past.')];

    $this->activation = IMMEDIATE;
    $this->effect = [clienttranslate('Draw 3 cards.')];
    $this->implemented = true;
  }

  public function canBePlayed($player)
  {
    return $player->countIcon(CITY) >= 2;
  }

  public function getImmediateEffect()
  {
    return [
      'action' => DRAW,
      'args' => ['n' => 3],
    ];
  }
}
