<?php
namespace AK\Cards\Pyramids;

class P28_PyramidOfMenkaure extends \AK\Models\Building
{
  public function __construct($row)
  {
    parent::__construct($row);
    $this->id = 'P28_PyramidOfMenkaure';
    $this->type = PYRAMID;
    $this->number = 28;
    $this->name = clienttranslate('Pyramid Of Menkaure');
    $this->country = clienttranslate('Egypt');
    $this->text = [clienttranslate('It is the smallest of the three great pyramids on the Giza plateau at 63 meters high.')];

    $this->victoryPoint = 1;
    $this->initialKnowledge = 2;
    $this->startingSpace = 3;
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
