<?php
namespace AK\Technologies;

class T18_Astronomy extends \AK\Models\Technology
{
  public function __construct($row)
  {
    parent::__construct($row);
    $this->id = 'T18_Astronomy';
    $this->type = SECRET;
    $this->number = 18;
    $this->level = 1;
    $this->name = clienttranslate('Astronomy');
    $this->requirement = [clienttranslate('1 <CITY>, 1 <PYRAMID> in your past.')];

    $this->activation = IMMEDIATE;
    $this->effect = [clienttranslate('Draw 3 cards.')];
    $this->implemented = true;
  }

  public function canBePlayed($player)
  {
    return min($player->countIcons([\PYRAMID, CITY])) >= 1;
  }

  public function getImmediateEffect()
  {
    return [
      'action' => DRAW,
      'args' => ['n' => 3],
    ];
  }
}
