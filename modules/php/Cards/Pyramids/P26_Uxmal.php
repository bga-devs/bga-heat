<?php
namespace AK\Cards\Pyramids;

class P26_Uxmal extends \AK\Models\Building
{
  public function __construct($row)
  {
    parent::__construct($row);
    $this->id = 'P26_Uxmal';
    $this->type = PYRAMID;
    $this->number = 26;
    $this->name = clienttranslate('Uxmal');
    $this->country = clienttranslate('Mexico');
    $this->text = [
      clienttranslate('The levels of the Pyramid of the Magician are unusual: they are oval rather than rectangular or square.'),
    ];

    $this->victoryPoint = 1;
    $this->initialKnowledge = 1;
    $this->startingSpace = 2;
    $this->activation = TIMELINE;
    $this->effect = [clienttranslate('Discard 1 <KNOWLEDGE> from each <MEGALITH> adjacent to this card.')];
    $this->implemented = true;
  }

  public function getTimelineEffect()
  {
    $cardIds = [];
    foreach ($this->getAdjacentBuildings() as $card) {
      if ($card->getType() == MEGALITH && $card->getKnowledge() > 0) {
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
