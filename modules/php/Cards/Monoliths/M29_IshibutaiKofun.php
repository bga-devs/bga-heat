<?php
namespace AK\Cards\Monoliths;

class M29_IshibutaiKofun extends \AK\Models\Building
{
  public function __construct($row)
  {
    parent::__construct($row);
    $this->id = 'M29_IshibutaiKofun';
    $this->type = MONOLITH;
    $this->number = 29;
    $this->name = clienttranslate('Ishibutai Kofun');
    $this->country = clienttranslate('Japan');
    $this->text = [
      clienttranslate('At 54 meters long and composed of 30 stones, this is the largest known megalithic structure in Japan.'),
    ];

    $this->victoryPoint = 1;
    $this->initialKnowledge = 3;
    $this->startingSpace = 4;
    $this->activation = ENDTURN;
    $this->effect = [clienttranslate('If you have at least 5 <LOST_KNOWLEDGE> on your board, discard 1 <LOST_KNOWLEDGE>')];
  }
}
