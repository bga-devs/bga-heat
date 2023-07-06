<?php
namespace AK\Technologies;

class T10_PlanetaryGrid extends \AK\Models\Technology
{
  public function __construct($row)
  {
    parent::__construct($row);
    $this->id = 'T10_PlanetaryGrid';
    $this->type = SECRET;
    $this->number = 10;
    $this->level = 1;
    $this->name = clienttranslate('Planetary Grid');

    $this->activation = IMMEDIATE;
    $this->effect = [clienttranslate('Move 1 monument in your Timeline to any other available space.')];
  }
}
