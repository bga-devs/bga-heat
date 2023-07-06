<?php
namespace AK\Cards\Cities;

class C15_AjantaCaves extends \AK\Models\Building
{
  public function __construct($row)
  {
    parent::__construct($row);
    $this->id = 'C15_AjantaCaves';
    $this->type = CITY;
    $this->number = 15;
    $this->name = clienttranslate('Ajanta Caves');
    $this->country = clienttranslate('India');
    $this->text = [
      clienttranslate('Carved into the steep face of the ravine, the structures range from ten to forty meters in height.'),
    ];

    $this->victoryPoint = 1;
    $this->initialKnowledge = 2;
    $this->startingSpace = 3;
    $this->activation = DECLINE;
    $this->effect = [clienttranslate('Move another monument to an available space in your Timeline.')];
  }
}
