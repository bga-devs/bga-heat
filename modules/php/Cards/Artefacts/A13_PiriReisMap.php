<?php
namespace AK\Cards\Artefacts;

class A13_PiriReisMap extends \AK\Models\Artefact
{
  public function __construct($row)
  {
    parent::__construct($row);
    $this->id = 'A13_PiriReisMap';
    $this->type = ARTEFACT;
    $this->number = 13;
    $this->name = clienttranslate('Piri Reis Map');
    $this->country = clienttranslate('Türkiye');
    $this->text = [
      clienttranslate(
        'It was drawn by the pirate Piri Reis in 1513. The continent at the bottom of the map could be Antarctica.'
      ),
    ];
    $this->activation = TIMELINE;
    $this->effect = [
      clienttranslate('You may move a monument in your Timeline with 0 <KNOWLEDGE> to any other available space.'),
    ];
  }

  public function getTimelineEffect()
  {
    return null;
  }
}
