<?php
namespace AK\Cards\Pyramids;

class P6_GreatZigguratOfUr extends \AK\Models\Building
{
  public function __construct($row)
  {
    parent::__construct($row);
    $this->id = 'P6_GreatZigguratOfUr';
    $this->type = PYRAMID;
    $this->number = 6;
    $this->name = clienttranslate('Great Ziggurat Of Ur');
    $this->country = clienttranslate('Iraq');
    $this->text = [
      clienttranslate('One of the four ziggurats that were built in the main religious centers of the land of Sumer.'),
    ];

    $this->victoryPoint = 1;
    $this->initialKnowledge = 2;
    $this->startingSpace = 5;
    $this->discard = 2;
    $this->activation = ENDGAME;
    $this->effect = [
      clienttranslate(
        'Gain 2 <VP> for each set of 3 different types of monuments (<CITY>, <MEGALITH> et <PYRAMID>) in your Past.'
      ),
    ];
    $this->implemented = true;
  }

  public function getScore()
  {
    $icons = $this->getPlayer()->countIcons(BUILDINGS);
    return 2 * min($icons);
  }
}
