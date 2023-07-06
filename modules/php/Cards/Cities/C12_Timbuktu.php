<?php
namespace AK\Cards\Cities;

class C12_Timbuktu extends \AK\Models\Building
{
  public function __construct($row)
  {
    parent::__construct($row);
    $this->id = 'C12_Timbuktu';
    $this->type = CITY;
    $this->number = 12;
    $this->name = clienttranslate('Timbuktu');
    $this->country = clienttranslate('Mali');
    $this->text = [clienttranslate('Nicknamed "The City of 333 Saints" or "The Pearl of the Desert."')];

    $this->victoryPoint = 0;
    $this->initialKnowledge = 2;
    $this->startingSpace = 1;
    $this->activation = IMMEDIATE;
    $this->effect = [clienttranslate('Discard 1 <LOST_KNOWLEDGE> from your board.')];
    $this->implemented = true;
  }

  public function getImmediateEffect()
  {
    return [
      'action' => \DISCARD_LOST_KNOWLEDGE,
      'args' => ['n' => 1],
    ];
  }
}
