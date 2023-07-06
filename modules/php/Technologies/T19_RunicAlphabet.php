<?php
namespace AK\Technologies;

class T19_RunicAlphabet extends \AK\Models\Technology
{
  public function __construct($row)
  {
    parent::__construct($row);
    $this->id = 'T19_RunicAlphabet';
    $this->type = WRITING;
    $this->number = 19;
    $this->level = 1;
    $this->name = clienttranslate('Runic Alphabet');

    $this->activation = IMMEDIATE;
    $this->effect = [clienttranslate('Straighten 2 rotated monuments in your Past.')];
  }
}
