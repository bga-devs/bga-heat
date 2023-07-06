<?php
namespace AK\Cards\Pyramids;

class P30_PyramidOfNeferirkare extends \AK\Models\Building
{
  public function __construct($row)
  {
    parent::__construct($row);
    $this->id = 'P30_PyramidOfNeferirkare';
    $this->type = PYRAMID;
    $this->number = 30;
    $this->name = clienttranslate('Pyramid Of Neferirkare');
    $this->country = clienttranslate('Egypt');
    $this->text = [
      clienttranslate(
        'It seems that the premature death of King Neferirkare put a stop to the project and his successors completed the funerary complex.'
      ),
    ];

    $this->victoryPoint = 0;
    $this->initialKnowledge = 4;
    $this->startingSpace = 5;
    $this->activation = TIMELINE;
    $this->effect = [clienttranslate('Discard 1 <KNOWLEDGE> from any other monument.')];
    $this->implemented = true;
  }

  public function getTimelineEffect()
  {
    return [
      'action' => REMOVE_KNOWLEDGE,
      'args' => [
        'n' => 1,
        'except' => $this->id,
      ],
    ];
  }
}
