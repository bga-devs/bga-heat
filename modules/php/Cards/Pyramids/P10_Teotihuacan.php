<?php
namespace AK\Cards\Pyramids;

class P10_Teotihuacan extends \AK\Models\Building
{
  public function __construct($row)
  {
    parent::__construct($row);
    $this->id = 'P10_Teotihuacan';
    $this->type = PYRAMID;
    $this->number = 10;
    $this->name = clienttranslate('Teotihuacan');
    $this->country = clienttranslate('Mexique');
    $this->text = [
      clienttranslate(
        'This site includes some of the largest Mesoamerican pyramids ever built. The Pyramid of the Sun is 65 meters high.'
      ),
    ];

    $this->startingHand = 3;
    $this->victoryPoint = 0;
    $this->initialKnowledge = 2;
    $this->startingSpace = 6;
    $this->discard = 1;
    $this->lockedSpace = true;
    $this->activation = DECLINE;
    $this->effect = [clienttranslate('You may LEARN up to 2 Technologies if you fulfill their requirements.')];
    $this->implemented = true;
  }

  public function getDeclineEffect()
  {
    return [
      'type' => NODE_SEQ,
      'childs' => [
        [
          'action' => LEARN,
          'optional' => true,
        ],
        [
          'action' => LEARN,
          'optional' => true,
        ],
      ],
    ];
  }
}
