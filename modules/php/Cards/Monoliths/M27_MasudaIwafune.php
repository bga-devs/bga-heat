<?php
namespace AK\Cards\Monoliths;

class M27_MasudaIwafune extends \AK\Models\Building
{
  public function __construct($row)
  {
    parent::__construct($row);
    $this->id = 'M27_MasudaIwafune';
    $this->type = MONOLITH;
    $this->number = 27;
    $this->name = clienttranslate('Masuda Iwafune');
    $this->country = clienttranslate('Japan');
    $this->text = [clienttranslate('The origin and function of this 900 ton monolith are unknown.')];

    $this->victoryPoint = 2;
    $this->initialKnowledge = 2;
    $this->startingSpace = 3;
    $this->activation = IMMEDIATE;
    $this->effect = [clienttranslate('You may CREATE 1 <MONOLITH>.')];
  }
}
