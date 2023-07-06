<?php
namespace AK\Cards\Cities;

class C9_Petra extends \AK\Models\Building
{
  public function __construct($row)
  {
    parent::__construct($row);
    $this->id = 'C9_Petra';
    $this->type = CITY;
    $this->number = 9;
    $this->name = clienttranslate('Petra');
    $this->country = clienttranslate('Jordan');
    $this->text = [
      clienttranslate('Its monumental facades were carved directly into the rock, but its construction date is still debated.'),
    ];

    $this->victoryPoint = 1;
    $this->initialKnowledge = 1;
    $this->startingSpace = 4;
    $this->activation = TIMELINE;
    $this->effect = [
      clienttranslate('If you have 2 <LOST_KNOWLEDGE> or less on your board and at least 1 monument in your Past, draw 1 card.'),
    ];
    $this->implemented = true;
  }

  public function getTimelineEffect()
  {
    $player = $this->getPlayer();
    return $player->getLostKnowledge() > 3 || max($player->countIcons(BUILDINGS)) == 0
      ? null
      : [
        'action' => DRAW,
        'args' => ['n' => 1],
      ];
  }
}
