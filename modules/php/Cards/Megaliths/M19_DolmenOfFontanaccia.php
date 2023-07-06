<?php
namespace AK\Cards\Megaliths;

class M19_DolmenOfFontanaccia extends \AK\Models\Building
{
  public function __construct($row)
  {
    parent::__construct($row);
    $this->id = 'M19_DolmenOfFontanaccia';
    $this->type = MEGALITH;
    $this->number = 19;
    $this->name = clienttranslate('Dolmen Of Fontanaccia');
    $this->country = clienttranslate('France');
    $this->text = [
      clienttranslate(
        'Located in Corsica, it is made up of six standing stones, three of which came from the same cracked slab.'
      ),
    ];

    $this->victoryPoint = 0;
    $this->initialKnowledge = 1;
    $this->startingSpace = 4;
    $this->discard = 1;
    $this->activation = ENDGAME;
    $this->effect = [clienttranslate('If you have at least 10 <LOST_KNOWLEDGE> on your board, gain 4 <VP>.')];
    $this->implemented = true;
  }

  public function getScore()
  {
    return $this->getPlayer()->getLostKnowledge() >= 10 ? 4 : 0;
  }
}
