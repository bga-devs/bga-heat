<?php
namespace AK\Cards\Artefacts;

class A35_AssurbanipalsTablet extends \AK\Models\Artefact
{
  public function __construct($row)
  {
    parent::__construct($row);
    $this->id = 'A35_AssurbanipalsTablet';
    $this->type = ARTEFACT;
    $this->number = 35;
    $this->name = clienttranslate('Assurbanipal’s Tablet');
    $this->country = clienttranslate('Iraq');
    $this->text = [
      clienttranslate(
        'The disc represents a celestial planisphere showing the position of the constellations observed at night from January 3 to 4, 650.'
      ),
    ];
    $this->activation = TIMELINE;
    $this->effect = [clienttranslate('If you have 0 or 1 card in your hand, draw 1 card.')];
    $this->implemented = true;
  }

  public function getTimelineEffect()
  {
    $n = $this->getPlayer()
      ->getHand()
      ->count();
    return $n > 1
      ? null
      : [
        'action' => DRAW,
        'args' => ['n' => 1],
      ];
  }
}
