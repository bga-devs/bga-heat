<?php
namespace AK\Cards\Artefacts;

class A11_ParacasCandelabra extends \AK\Models\Artefact
{
  public function __construct($row)
  {
    parent::__construct($row);
    $this->id = 'A11_ParacasCandelabra';
    $this->type = ARTEFACT;
    $this->number = 11;
    $this->name = clienttranslate('Paracas Candelabra');
    $this->country = clienttranslate('Peru');
    $this->text = [
      clienttranslate(
        'The function of this geoglyph remains unknown. It is almost oriented North-South at 180 meters long and 70 meters wide.'
      ),
    ];
    $this->activation = TIMELINE;
    $this->effect = [
      clienttranslate(
        'If you have at least 3 <PYRAMID> in your Timeline, discard up to 2 <KNOWLEDGE> from one or several of your monuments.'
      ),
    ];
  }

  public function getTimelineEffect()
  {
    return null;
  }
}
