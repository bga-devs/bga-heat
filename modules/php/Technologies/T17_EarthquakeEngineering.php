<?php
namespace AK\Technologies;

class T17_EarthquakeEngineering extends \AK\Models\Technology
{
  public function __construct($row)
  {
    parent::__construct($row);
    $this->id = 'T17_EarthquakeEngineering';
    $this->type = SECRET;
    $this->number = 17;
    $this->level = 1;
    $this->name = clienttranslate('Earthquake Engineering');

    $this->activation = IMMEDIATE;
    $this->effect = [clienttranslate('Discard up to 3 cards, then draw 1 card for each discarded card.')];
  }
}
