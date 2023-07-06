<?php
namespace AK\Cards\Pyramids;

class P32_ComalcalcoTemple extends \AK\Models\Building
{
  public function __construct($row)
  {
    parent::__construct($row);
    $this->id = 'P32_ComalcalcoTemple';
    $this->type = PYRAMID;
    $this->number = 32;
    $this->name = clienttranslate('Comalcalco Temple');
    $this->country = clienttranslate('Mexico');
    $this->text = [
      clienttranslate(
        'The biggest pyramid of the site is called the "House of the Comales." The entire complex is oriented according to the cardinal points.'
      ),
    ];

    $this->victoryPoint = 1;
    $this->initialKnowledge = 4;
    $this->startingSpace = 4;
    $this->discard = 1;
    $this->activation = ENDGAME;
    $this->effect = [clienttranslate('Gain 1 <VP> for each monument with a <VP> activation in your Past.')];
    $this->implemented = true;
  }

  public function getScore()
  {
    $n = 0;
    foreach ($this->getPlayer()->getPast() as $card) {
      if ($card->getActivation()) {
        $n++;
      }
    }

    return $n;
  }
}
