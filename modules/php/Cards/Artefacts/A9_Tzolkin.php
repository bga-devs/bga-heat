<?php
namespace AK\Cards\Artefacts;

class A9_Tzolkin extends \AK\Models\Artefact
{
  public function __construct($row)
  {
    parent::__construct($row);
    $this->id = 'A9_Tzolkin';
    $this->type = ARTEFACT;
    $this->number = 9;
    $this->name = clienttranslate('Tzolk’in');
    $this->country = clienttranslate('Mexique');
    $this->text = [
      clienttranslate('This ritual calendar of 260 days is shared by all the pre-Columbian civilizations of Mesoamerica.'),
    ];
    $this->activation = TIMELINE;
    $this->startingHand = 2;
    $this->effect = [
      clienttranslate(
        'If you have 3 or less <LOST_KNOWLEDGE> on your board and at least 1 monument in your Past, you may discard 1 <KNOWLEDGE> from any of your monuments.'
      ),
    ];
    $this->implemented = true;
  }

  public function getTimelineEffect()
  {
    $player = $this->getPlayer();
    return $player->getLostKnowledge() < 3 || $player->getPast()->empty()
      ? null
      : [
        'action' => \REMOVE_KNOWLEDGE,
        'args' => ['n' => 1],
      ];
  }
}
