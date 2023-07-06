<?php
namespace AK\Cards\Artefacts;

class A21_BaghdadBattery extends \AK\Models\Artefact
{
  public function __construct($row)
  {
    parent::__construct($row);
    $this->id = 'A21_BaghdadBattery';
    $this->type = ARTEFACT;
    $this->number = 21;
    $this->name = clienttranslate('Baghdad Battery');
    $this->country = clienttranslate('Iraq');
    $this->text = [
      clienttranslate(
        'Made of an iron rod and copper cylinder, they could have served as batteries. With reconstructions, researchers obtained very low electrical voltages.'
      ),
    ];
    $this->activation = TIMELINE;
    $this->effect = [
      clienttranslate(
        'You may discard this card from your board. If you do, discard up to 4 <KNOWLEDGE> from one or several of your monuments.'
      ),
    ];
  }
}
