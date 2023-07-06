<?php
namespace AK\Cards\Artefacts;

class A29_PhaistosDisc extends \AK\Models\Artefact
{
  public function __construct($row)
  {
    parent::__construct($row);
    $this->id = 'A29_PhaistosDisc';
    $this->type = ARTEFACT;
    $this->number = 29;
    $this->name = clienttranslate('Phaistos Disc');
    $this->country = clienttranslate('Greece');
    $this->text = [
      clienttranslate('Both sides of the disc show 241 signs. Its use, meaning, and even origin are hotly debated.'),
    ];
    $this->activation = ANYTIME;
    $this->effect = [clienttranslate('Each time you rotate a card during an EXCAVATE action, draw 3 cards instead of 2.')];
  }
}
