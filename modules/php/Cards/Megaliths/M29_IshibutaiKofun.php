<?php
namespace AK\Cards\Megaliths;

class M29_IshibutaiKofun extends \AK\Models\Building
{
  public function __construct($row)
  {
    parent::__construct($row);
    $this->id = 'M29_IshibutaiKofun';
    $this->type = MEGALITH;
    $this->number = 29;
    $this->name = clienttranslate('Ishibutai Kofun');
    $this->country = clienttranslate('Japan');
    $this->text = [
      clienttranslate('At 54 meters long and composed of 30 stones, this is the largest known megalithic structure in Japan.'),
    ];

    $this->victoryPoint = 1;
    $this->initialKnowledge = 3;
    $this->startingSpace = 4;
    $this->activation = TIMELINE;
    $this->effect = [clienttranslate('If you have at least 5 <LOST_KNOWLEDGE> on your board, discard 1 <LOST_KNOWLEDGE>')];
    $this->implemented = true;
  }

  public function getTimelineEffect()
  {
    $n = $this->getPlayer()->getLostKnowledge();
    return $n < 5
      ? null
      : [
        'action' => \DISCARD_LOST_KNOWLEDGE,
        'args' => ['n' => 1],
      ];
  }
}
