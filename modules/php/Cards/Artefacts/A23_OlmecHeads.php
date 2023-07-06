<?php
namespace AK\Cards\Artefacts;

class A23_OlmecHeads extends \AK\Models\Artefact
{
  public function __construct($row)
  {
    parent::__construct($row);
    $this->id = 'A23_OlmecHeads';
    $this->type = ARTEFACT;
    $this->number = 23;
    $this->name = clienttranslate('Olmec Heads');
    $this->country = clienttranslate('Mexico');
    $this->text = [clienttranslate('Carved in basalt, the African features of these statues unleashed passions.')];
    $this->activation = ANYTIME;
    $this->startingHand = 4;
    $this->effect = [clienttranslate('Each time you CREATE 1 <MEGALITH>, draw 1 card.')];
  }
}
