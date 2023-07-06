<?php
namespace AK\Cards\Pyramids;

class P18_PyramideDeNice extends \AK\Models\Building
{
  public function __construct($row)
  {
    parent::__construct($row);
    $this->id = 'P18_PyramideDeNice';
    $this->type = PYRAMID;
    $this->number = 18;
    $this->name = clienttranslate('Pyramide De Nice');
    $this->country = clienttranslate('France');
    $this->text = [
      clienttranslate(
        'It was destroyed in the 1970s to build a road interchange. It was over 200 meters long and 50 meters high.'
      ),
    ];

    $this->startingHand = 1;
    $this->victoryPoint = 0;
    $this->initialKnowledge = 2;
    $this->startingSpace = 1;
    $this->activation = IMMEDIATE;
    $this->effect = [clienttranslate('Discard 1 <KNOWLEDGE> from any of your monuments.')];
    $this->implemented = true;
  }

  public function getImmediateEffect()
  {
    return [
      'action' => \REMOVE_KNOWLEDGE,
      'args' => ['n' => 1],
    ];
  }
}
