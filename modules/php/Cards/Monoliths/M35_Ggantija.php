<?php
namespace AK\Cards\Monoliths;

class M35_Ggantija extends \AK\Models\Building
{
  public function __construct($row)
  {
    parent::__construct($row);
    $this->id = 'M35_Ggantija';
    $this->type = MONOLITH;
    $this->number = 35;
    $this->name = clienttranslate('Ġgantija');
    $this->country = clienttranslate('Malta');
    $this->text = [
      clienttranslate('Made up of 2 megalithic temples, this complex is known for its impressive area (50 × 35 meters).'),
    ];

    $this->victoryPoint = 1;
    $this->initialKnowledge = 1;
    $this->startingSpace = 2;
    $this->activation = ENDTURN;
    $this->effect = [clienttranslate('Discard 1 <KNOWLEDGE> from each <CITY> adjacent to this card.')];
  }
}
