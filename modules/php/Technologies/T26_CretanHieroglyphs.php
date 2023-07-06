<?php
namespace AK\Technologies;

class T26_CretanHieroglyphs extends \AK\Models\Technology
{
  public function __construct($row)
  {
    parent::__construct($row);
    $this->id = 'T26_CretanHieroglyphs';
    $this->type = WRITING;
    $this->number = 26;
    $this->level = 1;
    $this->name = clienttranslate('Cretan Hieroglyphs');

    $this->activation = IMMEDIATE;
    $this->effect = [clienttranslate('Each of your opponents discards 1 card from their hand.')];
  }
}
