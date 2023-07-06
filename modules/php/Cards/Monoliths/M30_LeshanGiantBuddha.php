<?php
namespace AK\Cards\Monoliths;

class M30_LeshanGiantBuddha extends \AK\Models\Building
{
  public function __construct($row)
  {
    parent::__construct($row);
    $this->id = 'M30_LeshanGiantBuddha';
    $this->type = MONOLITH;
    $this->number = 30;
    $this->name = clienttranslate('Leshan Giant Buddha');
    $this->country = clienttranslate('China');
    $this->text = [
      clienttranslate(
        'According to legend, it was created by a Buddhist monk who wanted to protect sailors traveling along the perilous confluence of 3 rivers.'
      ),
    ];

    $this->victoryPoint = 2;
    $this->initialKnowledge = 3;
    $this->startingSpace = 5;
    $this->activation = ENDTURN;
    $this->effect = [
      clienttranslate('If you have at least 3 <MONOLITH> in your Past, discard 1 <LOST_KNOWLEDGE> from your board.'),
    ];
  }
}
