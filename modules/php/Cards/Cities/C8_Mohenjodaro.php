<?php
namespace AK\Cards\Cities;

class C8_Mohenjodaro extends \AK\Models\Building
{
  public function __construct($row)
  {
    parent::__construct($row);
    $this->id = 'C8_Mohenjodaro';
    $this->type = CITY;
    $this->number = 8;
    $this->name = clienttranslate('Mohenjo-daro');
    $this->country = clienttranslate('Pakistan');
    $this->text = [clienttranslate('The remains of one of the largest cities of the Indian Bronze Age are found here.')];

    $this->victoryPoint = 5;
    $this->initialKnowledge = 9;
    $this->startingSpace = 5;
    $this->activation = TIMELINE;
    $this->effect = [
      clienttranslate(
        'If this monument is adjacent to at least 2 monuments of the same type (2 <CITY>, 2 <MEGALITH> or 2 <PYRAMID>), discard 2 <KNOWLEDGE> from this monument.'
      ),
    ];
    $this->implemented = true;
  }

  public function getTimelineEffect()
  {
    $icons = $this->countAdjacentBuildingTypes();
    return max($icons) < 2
      ? null
      : [
        'action' => REMOVE_KNOWLEDGE,
        'args' => [
          'n' => 2,
          'cardIds' => [$this->id],
        ],
      ];
  }
}
