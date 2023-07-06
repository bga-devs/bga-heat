<?php
namespace AK\Cards\Artefacts;

class A3_PlanetaryStone extends \AK\Models\Artefact
{
  public function __construct($row)
  {
    parent::__construct($row);
    $this->id = 'A3_PlanetaryStone';
    $this->type = ARTEFACT;
    $this->number = 3;
    $this->name = clienttranslate('Planetary Stone');
    $this->country = clienttranslate('Ecuador');
    $this->text = [clienttranslate('Discovered in 1984, this stone has the contours of a world map.')];
    $this->activation = TIMELINE;
    $this->startingHand = 2;
    $this->effect = [
      clienttranslate(
        'You may discard 2 cards from your hand. If you do, discard up to 3 <KNOWLEDGE> from one or several of your monuments.'
      ),
    ];
    $this->implemented = true;
  }

  public function getTimelineEffect()
  {
    return [
      'type' => \NODE_SEQ,
      'optional' => true,
      'childs' => [
        [
          'action' => DISCARD,
          'args' => ['n' => 2],
        ],
        [
          'action' => \REMOVE_KNOWLEDGE,
          'args' => ['n' => 3],
        ],
      ],
    ];
  }
}
