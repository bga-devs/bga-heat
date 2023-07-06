<?php
namespace AK\Cards\Pyramids;

class P23_PyramidsOfXian extends \AK\Models\Building
{
  public function __construct($row)
  {
    parent::__construct($row);
    $this->id = 'P23_PyramidsOfXian';
    $this->type = PYRAMID;
    $this->number = 23;
    $this->name = clienttranslate('Pyramids Of Xi’an');
    $this->country = clienttranslate('China');
    $this->text = [clienttranslate('Made of only clay and earth, they measure between 25 and 100 meters high.')];

    $this->victoryPoint = 0;
    $this->initialKnowledge = 1;
    $this->startingSpace = 4;
    $this->activation = IMMEDIATE;
    $this->effect = [clienttranslate('Swap this monument with another monument of your Timeline.')];
  }
}
