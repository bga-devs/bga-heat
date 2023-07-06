<?php
namespace AK\Cards\Megaliths;

class M35_Ggantija extends \AK\Models\Building
{
  public function __construct($row)
  {
    parent::__construct($row);
    $this->id = 'M35_Ggantija';
    $this->type = MEGALITH;
    $this->number = 35;
    $this->name = clienttranslate('Ġgantija');
    $this->country = clienttranslate('Malta');
    $this->text = [
      clienttranslate('Made up of 2 megalithic temples, this complex is known for its impressive area (50 × 35 meters).'),
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
    $childs = [];
    foreach ($this->getAdjacentBuildings() as $card) {
      if ($card->getType() == CITY && $card->getKnowledge() > 0) {
        $childs[] = [
          'action' => \REMOVE_KNOWLEDGE,
          'args' => [
            'n' => 1,
            'cardIds' => [$card->getId()],
          ],
        ];
      }
    }

    return empty($childs)
      ? null
      : [
        'type' => NODE_SEQ,
        'childs' => $childs,
      ];
  }
}
