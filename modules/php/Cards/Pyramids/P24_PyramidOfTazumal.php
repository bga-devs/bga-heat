<?php
namespace AK\Cards\Pyramids;

class P24_PyramidOfTazumal extends \AK\Models\Building
{
  public function __construct($row)
  {
    parent::__construct($row);
    $this->id = 'P24_PyramidOfTazumal';
    $this->type = PYRAMID;
    $this->number = 24;
    $this->name = clienttranslate('Pyramid Of Tazumal');
    $this->country = clienttranslate('El Salvador');
    $this->text = [clienttranslate('The main pyramid of the complex has a base that is 73 by 87 meters wide.')];

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
