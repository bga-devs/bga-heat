<?php
namespace AK\Cards\Cities;

class C7_LuxorTemple extends \AK\Models\Building
{
  public function __construct($row)
  {
    parent::__construct($row);
    $this->id = 'C7_LuxorTemple';
    $this->type = CITY;
    $this->number = 7;
    $this->name = clienttranslate('Luxor Temple');
    $this->country = clienttranslate('Egypt');
    $this->text = [
      clienttranslate(
        'This Egyptian temple dedicated to the worship of Amun is one of the best preserved buildings from the New Kingdom.'
      ),
    ];

    $this->victoryPoint = 7;
    $this->initialKnowledge = 10;
    $this->startingSpace = 3;
    $this->activation = TIMELINE;
    $this->effect = [
      clienttranslate('If this monument is adjacent to at least 2 <PYRAMID>, discard 3 <KNOWLEDGE> from this monument.'),
    ];
    $this->implemented = true;
  }

  public function getTimelineEffect()
  {
    $icons = $this->countAdjacentBuildingTypes();
    return $icons[PYRAMID] < 2
      ? null
      : [
        'action' => REMOVE_KNOWLEDGE,
        'args' => [
          'n' => 3,
          'cardIds' => [$this->id],
        ],
      ];
  }
}
