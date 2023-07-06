<?php
namespace AK\Technologies;

class T8_Ptolemy extends \AK\Models\Technology
{
  public function __construct($row)
  {
    parent::__construct($row);
    $this->id = 'T8_Ptolemy';
    $this->type = ANCIENT;
    $this->number = 8;
    $this->level = 1;
    $this->name = clienttranslate('Ptolemy');
    $this->requirement = [clienttranslate('0 or 1 card in your hand.')];

    $this->activation = IMMEDIATE;
    $this->effect = [clienttranslate('Draw 3 cards.')];
    $this->implemented = true;
  }

  public function canBePlayed($player)
  {
    return $player->getHand()->count() <= 1;
  }

  public function getImmediateEffect()
  {
    return [
      'action' => DRAW,
      'args' => ['n' => 3],
    ];
  }
}
