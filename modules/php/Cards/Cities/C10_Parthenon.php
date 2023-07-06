<?php
namespace AK\Cards\Cities;

class C10_Parthenon extends \AK\Models\Building
{
  public function __construct($row)
  {
    parent::__construct($row);
    $this->id = 'C10_Parthenon';
    $this->type = CITY;
    $this->number = 10;
    $this->name = clienttranslate('Parthenon');
    $this->country = clienttranslate('Greece');
    $this->text = [
      clienttranslate('Made entirely of Pentelic marble, the Parthenon is a temple dedicated to the goddess Athena.'),
    ];

    $this->victoryPoint = 0;
    $this->initialKnowledge = 4;
    $this->startingSpace = 3;
    $this->activation = TIMELINE;
    $this->effect = [
      clienttranslate(
        'If you have at least 11 <KNOWLEDGE> in your Timeline, discard up to 2 <KNOWLEDGE> from one or several of your monuments.'
      ),
    ];
    $this->implemented = true;
  }

  public function getTimelineEffect()
  {
    $n = $this->getPlayer()->countKnowledgeOnTimeline();
    return $n < 11
      ? null
      : [
        'action' => REMOVE_KNOWLEDGE,
        'args' => [
          'n' => 2,
        ],
      ];
  }
}
