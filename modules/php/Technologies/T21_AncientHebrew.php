<?php
namespace AK\Technologies;

class T21_AncientHebrew extends \AK\Models\Technology
{
  public function __construct($row)
  {
    parent::__construct($row);
    $this->id = 'T21_AncientHebrew';
    $this->type = WRITING;
    $this->number = 21;
    $this->level = 1;
    $this->name = clienttranslate('Ancient Hebrew');

    $this->activation = IMMEDIATE;
    $this->effect = [
      clienttranslate('Choose 1 monument in each of your opponents’ Timelines and add 1 <KNOWLEDGE> to each. Draw 1 card.'),
    ];
  }
}
