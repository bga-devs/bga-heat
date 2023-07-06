<?php
namespace AK\Cards\Monoliths;

class M33_MerchantsTable extends \AK\Models\Building
{
  public function __construct($row)
  {
    parent::__construct($row);
    $this->id = 'M33_MerchantsTable';
    $this->type = MONOLITH;
    $this->number = 33;
    $this->name = clienttranslate('Merchants’ Table');
    $this->country = clienttranslate('France');
    $this->text = [
      clienttranslate(
        'With a north-south orientation, this monument has a length of about 12 meters, while the corridor measures 7 meters long and 2.5 meters high.'
      ),
    ];

    $this->victoryPoint = 1;
    $this->initialKnowledge = 2;
    $this->startingSpace = 2;
    $this->discard = 1;
    $this->activation = ENDGAME;
    $this->effect = [clienttranslate('Gain 1 extra <VP> for each monument still in your Timeline.')];
  }
}
