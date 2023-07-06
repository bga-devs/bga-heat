<?php
namespace AK\Cards\Artefacts;

class A4_DisksOfBayanKaraUla extends \AK\Models\Artefact
{
  public function __construct($row)
  {
    parent::__construct($row);
    $this->id = 'A4_DisksOfBayanKaraUla';
    $this->type = ARTEFACT;
    $this->number = 4;
    $this->name = clienttranslate('Disks Of Bayan Kara Ula');
    $this->country = clienttranslate('China');
    $this->text = [
      clienttranslate('These stone discs have scriptures telling the story of beings crashing on Earth 12,000 years ago.'),
    ];
    $this->activation = TIMELINE;
    $this->startingHand = 1;
    $this->effect = [
      clienttranslate(
        'If you have at least 1 monument of each type in your Timeline (<CITY>, <MEGALITH> and <PYRAMID>), discard 1 <KNOWLEDGE> from any of your monuments.'
      ),
    ];
  }

  public function getTimelineEffect()
  {
    return null;
  }
}
