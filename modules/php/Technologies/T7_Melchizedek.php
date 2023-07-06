<?php
namespace AK\Technologies;

class T7_Melchizedek extends \AK\Models\Technology
{
  public function __construct($row)
  {
    parent::__construct($row);
    $this->id = 'T7_Melchizedek';
    $this->type = ANCIENT;
    $this->number = 7;
    $this->level = 1;
    $this->name = clienttranslate('Melchizedek');
    $this->requirement = [clienttranslate('1 <CITY>, 1 <MEGALITH>, 1 <PYRAMID> in your past.')];

    $this->activation = IMMEDIATE;
    $this->effect = [clienttranslate('Draw 4 cards.')];
    $this->implemented = true;
  }

  public function canBePlayed($player)
  {
    return min($player->countIcons(BUILDINGS)) >= 1;
  }

  public function getImmediateEffect()
  {
    return [
      'action' => DRAW,
      'args' => ['n' => 4],
    ];
  }
}
