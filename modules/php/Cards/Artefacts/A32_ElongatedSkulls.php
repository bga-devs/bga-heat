<?php
namespace AK\Cards\Artefacts;

class A32_ElongatedSkulls extends \AK\Models\Artefact
{
  public function __construct($row)
  {
    parent::__construct($row);
    $this->id = 'A32_ElongatedSkulls';
    $this->type = ARTEFACT;
    $this->number = 32;
    $this->name = clienttranslate('Elongated Skulls');
    $this->country = clienttranslate('Peru');
    $this->text = [
      clienttranslate(
        'The atypical shape of the skull comes from mechanical stress processes combining wooden frames and fabric or leather. This practice is customary in many countries around the world.'
      ),
    ];
    $this->activation = ANYTIME;
    $this->startingHand = 4;
    $this->effect = [
      clienttranslate(
        'For each set of 3 <KNOWLEDGE> becoming <LOST_KNOWLEDGE> during your DECLINE PHASE this turn, draw 2 cards.'
      ),
    ];
  }
}
