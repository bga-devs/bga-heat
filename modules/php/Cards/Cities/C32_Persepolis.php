<?php
namespace AK\Cards\Cities;

class C32_Persepolis extends \AK\Models\Building
{
  public function __construct($row)
  {
    parent::__construct($row);
    $this->id = 'C32_Persepolis';
    $this->type = CITY;
    $this->number = 32;
    $this->name = clienttranslate('Persepolis');
    $this->country = clienttranslate('Iran');
    $this->text = [clienttranslate('This former capital of the Persian Achaemenid Empire was built in 521 BC.')];

    $this->victoryPoint = 3;
    $this->initialKnowledge = 3;
    $this->startingSpace = 3;
    $this->activation = IMMEDIATE;
    $this->effect = [clienttranslate('You may take an ARCHIVE action.')];
    $this->implemented = true;
  }

  public function getImmediateEffect()
  {
    return [
      'action' => ARCHIVE,
      'optional' => true,
    ];
  }
}
