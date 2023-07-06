<?php
namespace AK\Cards\Cities;

class C14_Bagan extends \AK\Models\Building
{
  public function __construct($row)
  {
    parent::__construct($row);
    $this->id = 'C14_Bagan';
    $this->type = CITY;
    $this->number = 14;
    $this->name = clienttranslate('Bagan');
    $this->country = clienttranslate('Myanmar');
    $this->text = [clienttranslate('There are 2834 monuments found on this 50 square km site, many of which are in ruins.')];

    $this->victoryPoint = 0;
    $this->initialKnowledge = 2;
    $this->startingSpace = 5;
    $this->activation = IMMEDIATE;
    $this->effect = [clienttranslate('Swap this monument with another monument of your Timeline.')];
  }
}
