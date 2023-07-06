<?php
namespace AK\Cards\Megaliths;

class M30_LeshanGiantBuddha extends \AK\Models\Building
{
  public function __construct($row)
  {
    parent::__construct($row);
    $this->id = 'M30_LeshanGiantBuddha';
    $this->type = MEGALITH;
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
    $this->activation = TIMELINE;
    $this->effect = [
      clienttranslate('If you have at least 3 <MEGALITH> in your Past, discard 1 <LOST_KNOWLEDGE> from your board.'),
    ];
    $this->implemented = true;
  }

  public function getTimelineEffect()
  {
    $n = $this->getPlayer()->countIcon(MEGALITH);
    return $n < 3
      ? null
      : [
        'action' => \DISCARD_LOST_KNOWLEDGE,
        'args' => ['n' => 1],
      ];
  }
}
