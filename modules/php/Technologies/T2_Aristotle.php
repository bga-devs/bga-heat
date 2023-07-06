<?php
namespace AK\Technologies;

class T2_Aristotle extends \AK\Models\Technology
{
  public function __construct($row)
  {
    parent::__construct($row);
    $this->id = 'T2_Aristotle';
    $this->type = ANCIENT;
    $this->number = 2;
    $this->level = 1;
    $this->name = clienttranslate('Aristotle');
    $this->requirement = [clienttranslate('2 <PYRAMID> in your past.')];

    $this->activation = IMMEDIATE;
    $this->effect = [clienttranslate('Draw 3 cards.')];
    $this->implemented = true;
  }

  public function canBePlayed($player)
  {
    return $player->countIcon(PYRAMID) >= 2;
  }

  public function getImmediateEffect()
  {
    return [
      'action' => DRAW,
      'args' => ['n' => 3],
    ];
  }
}
