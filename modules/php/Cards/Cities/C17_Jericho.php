<?php
namespace AK\Cards\Cities;

class C17_Jericho extends \AK\Models\Building
{
  public function __construct($row)
  {
    parent::__construct($row);
    $this->id = 'C17_Jericho';
    $this->type = CITY;
    $this->number = 17;
    $this->name = clienttranslate('Jericho');
    $this->country = clienttranslate('Palestine');
    $this->text = [clienttranslate('It is sometimes considered one of the oldest cities in the world.')];

    $this->victoryPoint = 1;
    $this->initialKnowledge = 3;
    $this->startingSpace = 3;
    $this->discard = 1;
    $this->activation = DECLINE;
    $this->effect = [clienttranslate('Draw 6 cards.')];
    $this->implemented = true;
  }

  public function getDeclineEffect()
  {
    return [
      'action' => DRAW,
      'args' => ['n' => 6],
    ];
  }
}
