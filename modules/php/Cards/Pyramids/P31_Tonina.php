<?php
namespace AK\Cards\Pyramids;

class P31_Tonina extends \AK\Models\Building
{
  public function __construct($row)
  {
    parent::__construct($row);
    $this->id = 'P31_Tonina';
    $this->type = PYRAMID;
    $this->number = 31;
    $this->name = clienttranslate('ToninÁ');
    $this->country = clienttranslate('Mexico');
    $this->text = [
      clienttranslate(
        'This complex consists of 7 terraces for a total height of about 80 meters, flanked by 13 temples and 8 palaces.'
      ),
    ];

    $this->startingHand = 1;
    $this->victoryPoint = 0;
    $this->initialKnowledge = 4;
    $this->startingSpace = 4;
    $this->activation = TIMELINE;
    $this->effect = [clienttranslate('Draw 1 card.')];
    $this->implemented = true;
  }

  public function getTimelineEffect()
  {
    return [
      'action' => DRAW,
      'args' => ['n' => 1],
    ];
  }
}
