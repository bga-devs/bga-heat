<?php
namespace AK\Cards\Pyramids;

class P29_PyramidOfDjoser extends \AK\Models\Building
{
  public function __construct($row)
  {
    parent::__construct($row);
    $this->id = 'P29_PyramidOfDjoser';
    $this->type = PYRAMID;
    $this->number = 29;
    $this->name = clienttranslate('Pyramid Of Djoser');
    $this->country = clienttranslate('Egypt');
    $this->text = [clienttranslate('In the history of Egyptian architecture, this is the second work built out of cut stone.')];

    $this->victoryPoint = 2;
    $this->initialKnowledge = 3;
    $this->startingSpace = 5;
    $this->activation = TIMELINE;
    $this->effect = [
      clienttranslate(
        'If you have 4 <LOST_KNOWLEDGE> or less on your board and at least 1 monument in your Past, discard 1 <KNOWLEDGE> from any of your monument.'
      ),
    ];
    $this->implemented = true;
  }

  public function getTimelineEffect()
  {
    $player = $this->getPlayer();
    return $player->getLostKnowledge() < 4 || $player->getPast()->empty()
      ? null
      : [
        'action' => \REMOVE_KNOWLEDGE,
        'args' => ['n' => 1],
      ];
  }
}
