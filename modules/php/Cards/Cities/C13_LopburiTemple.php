<?php
namespace AK\Cards\Cities;

class C13_LopburiTemple extends \AK\Models\Building
{
  public function __construct($row)
  {
    parent::__construct($row);
    $this->id = 'C13_LopburiTemple';
    $this->type = CITY;
    $this->number = 13;
    $this->name = clienttranslate('Lopburi Temple');
    $this->country = clienttranslate('Thailand');
    $this->text = [clienttranslate('This temple has three towers connected to each other by a corridor, on a north-south axis.')];

    $this->victoryPoint = 0;
    $this->initialKnowledge = 1;
    $this->startingSpace = 4;
    $this->activation = IMMEDIATE;
    $this->effect = [clienttranslate('Swap this monument with another monument of your Timeline.')];
  }
}
