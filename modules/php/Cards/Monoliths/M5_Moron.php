<?php
namespace AK\Cards\Monoliths;

class M5_Moron extends \AK\Models\Building
{
  public function __construct($row)
  {
    parent::__construct($row);
    $this->id = 'M5_Moron';
    $this->type = MONOLITH;
    $this->number = 5;
    $this->name = clienttranslate('MÖrÖn');
    $this->country = clienttranslate('Mongolie');
    $this->text = [clienttranslate('The stones of this megalithic site present strange indecipherable engravings.')];

    $this->victoryPoint = 0;
    $this->initialKnowledge = 4;
    $this->startingSpace = 4;
    $this->discard = 1;
    $this->activation = ENDGAME;
    $this->effect = [
      clienttranslate("• If you have 3 <ANCIENT> or 4 <ANCIENT>, gain 4 <VP>.
• or, if you have 5 <ANCIENT> or more, gain 7 <VP>."),
    ];
  }
}
