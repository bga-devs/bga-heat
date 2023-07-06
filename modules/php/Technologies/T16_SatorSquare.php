<?php
namespace AK\Technologies;

class T16_SatorSquare extends \AK\Models\Technology
{
  public function __construct($row)
  {
    parent::__construct($row);
    $this->id = 'T16_SatorSquare';
    $this->type = SECRET;
    $this->number = 16;
    $this->level = 1;
    $this->name = clienttranslate('Sator Square');

    $this->activation = IMMEDIATE;
    $this->effect = [clienttranslate('Swap 2 monuments in your Timeline.')];
  }
}
