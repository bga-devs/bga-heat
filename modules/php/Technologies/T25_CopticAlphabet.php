<?php
namespace AK\Technologies;

class T25_CopticAlphabet extends \AK\Models\Technology
{
  public function __construct($row)
  {
    parent::__construct($row);
    $this->id = 'T25_CopticAlphabet';
    $this->type = WRITING;
    $this->number = 25;
    $this->level = 1;
    $this->name = clienttranslate('Coptic Alphabet');
    $this->requirement = [clienttranslate('2 <MEGALITH> in your Past.')];

    $this->activation = IMMEDIATE;
    $this->effect = [clienttranslate('Draw 3 cards.')];
    $this->implemented = true;
  }

  public function canBePlayed($player)
  {
    return $player->countIcon(\MEGALITH) >= 2;
  }

  public function getImmediateEffect()
  {
    return [
      'action' => DRAW,
      'args' => ['n' => 3],
    ];
  }
}
