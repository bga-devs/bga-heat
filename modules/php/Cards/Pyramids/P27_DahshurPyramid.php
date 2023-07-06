<?php
namespace AK\Cards\Pyramids;

class P27_DahshurPyramid extends \AK\Models\Building
{
  public function __construct($row)
  {
    parent::__construct($row);
    $this->id = 'P27_DahshurPyramid';
    $this->type = PYRAMID;
    $this->number = 27;
    $this->name = clienttranslate('Dahshur Pyramid');
    $this->country = clienttranslate('Egypt');
    $this->text = [
      clienttranslate(
        'The construction of the Dahshur pyramids was an extremely important learning experience for the Egyptians.'
      ),
    ];

    $this->victoryPoint = 1;
    $this->initialKnowledge = 1;
    $this->startingSpace = 2;
    $this->activation = TIMELINE;
    $this->effect = [clienttranslate('Discard 1 <KNOWLEDGE> from each <CITY> adjacent to this card.')];
    $this->implemented = true;
  }

  public function getTimelineEffect()
  {
    $cardIds = [];
    foreach ($this->getAdjacentBuildings() as $card) {
      if ($card->getType() == CITY && $card->getKnowledge() > 0) {
        $cardIds[] = $card->getId();
      }
    }

    return empty($cardIds)
      ? null
      : [
        'action' => REMOVE_KNOWLEDGE,
        'args' => [
          'n' => 1,
          'cardIds' => $cardIds,
          'type' => NODE_SEQ,
        ],
      ];
  }
}
