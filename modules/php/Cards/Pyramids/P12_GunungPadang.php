<?php
namespace AK\Cards\Pyramids;

class P12_GunungPadang extends \AK\Models\Building
{
  public function __construct($row)
  {
    parent::__construct($row);
    $this->id = 'P12_GunungPadang';
    $this->type = PYRAMID;
    $this->number = 12;
    $this->name = clienttranslate('Gunung Padang');
    $this->country = clienttranslate('Indonesia');
    $this->text = [clienttranslate('The geologist Natawidjaja revealed the presence of chambers within it using radar.')];

    $this->victoryPoint = 1;
    $this->initialKnowledge = 2;
    $this->startingSpace = 3;
    $this->activation = DECLINE;
    $this->effect = [clienttranslate('Move 1 another monument in your Timeline to any other available space.')];
  }
}
