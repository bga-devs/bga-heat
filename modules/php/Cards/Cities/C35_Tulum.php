<?php
namespace AK\Cards\Cities;

class C35_Tulum extends \AK\Models\Building
{
  public function __construct($row)
  {
    parent::__construct($row);
    $this->id = 'C35_Tulum';
    $this->type = CITY;
    $this->number = 35;
    $this->name = clienttranslate('Tulum');
    $this->country = clienttranslate('Mexico');
    $this->text = [
      clienttranslate('As a trader fort, it seems to have been a major Mayan site dedicated to worshipping the Diving god.'),
    ];

    $this->victoryPoint = 6;
    $this->initialKnowledge = 1;
    $this->startingSpace = 4;
    $this->lockedSpace = true;
    $this->activation = TIMELINE;
    $this->effect = [clienttranslate('Discard 1 card from your hand.')];
    $this->implemented = true;
  }

  public function getTimelineEffect()
  {
    return [
      'action' => DISCARD,
      'args' => ['n' => 1],
    ];
  }
}
