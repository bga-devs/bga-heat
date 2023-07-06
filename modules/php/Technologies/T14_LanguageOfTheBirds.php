<?php
namespace AK\Technologies;

class T14_LanguageOfTheBirds extends \AK\Models\Technology
{
  public function __construct($row)
  {
    parent::__construct($row);
    $this->id = 'T14_LanguageOfTheBirds';
    $this->type = SECRET;
    $this->number = 14;
    $this->level = 1;
    $this->name = clienttranslate('Language Of The Birds');

    $this->activation = IMMEDIATE;
    $this->effect = [
      clienttranslate('Choose 1 monument in your Timeline with at least 5 <KNOWLEDGE>. Discard 3 <KNOWLEDGE> from it.'),
    ];
  }
}
