<?php
namespace AK\Technologies;

class T31_Pythagoras extends \AK\Models\Technology
{
  public function __construct($row)
  {
    parent::__construct($row);
    $this->id = 'T31_Pythagoras';
    $this->type = ANCIENT;
    $this->number = 31;
    $this->level = 2;
    $this->name = clienttranslate('Pythagoras');
    $this->requirement = [clienttranslate('3 monuments with <VP> activation in your Past.')];

    $this->activation = ENDGAME;
    $this->effect = [clienttranslate('3 <VP>')];
    $this->implemented = true;
  }

  public function getScore()
  {
    return 3;
  }
}
