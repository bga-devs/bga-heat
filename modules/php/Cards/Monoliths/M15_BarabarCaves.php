<?php
namespace AK\Cards\Monoliths;

class M15_BarabarCaves extends \AK\Models\Building
{
  public function __construct($row)
  {
    parent::__construct($row);
    $this->id = 'M15_BarabarCaves';
    $this->type = MONOLITH;
    $this->number = 15;
    $this->name = clienttranslate('Barabar Caves');
    $this->country = clienttranslate('India');
    $this->text = [
      clienttranslate(
        'They are the oldest man-made caves in India, dating back to the Maurya Empire. Their interiors are perfectly polished.'
      ),
    ];

    $this->victoryPoint = 1;
    $this->initialKnowledge = 3;
    $this->startingSpace = 6;
    $this->activation = DECLINE;
    $this->effect = [
      clienttranslate(
        'Choose 1 monument in one of your opponents’ Timelines and place up to 3 <LOST_KNOWLEDGE> from your board onto it.'
      ),
    ];
  }
}
