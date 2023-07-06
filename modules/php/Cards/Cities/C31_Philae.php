<?php
namespace AK\Cards\Cities;

class C31_Philae extends \AK\Models\Building
{
  public function __construct($row)
  {
    parent::__construct($row);
    $this->id = 'C31_Philae';
    $this->type = CITY;
    $this->number = 31;
    $this->name = clienttranslate('Philae');
    $this->country = clienttranslate('Egypt');
    $this->text = [clienttranslate('This is one of the major shrines of the goddess Isis in Egypt.')];

    $this->victoryPoint = 2;
    $this->initialKnowledge = 3;
    $this->startingSpace = 3;
    $this->activation = IMMEDIATE;
    $this->effect = [
      clienttranslate('If you have at least 4 <CITY> in your Timeline, choose 2 <CITY> and discard 3 <KNOWLEDGE> from them.'),
    ];
  }
}
