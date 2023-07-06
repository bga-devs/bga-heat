<?php
namespace AK\Cards\Artefacts;

class A30_NimrudLens extends \AK\Models\Artefact
{
  public function __construct($row)
  {
    parent::__construct($row);
    $this->id = 'A30_NimrudLens';
    $this->type = ARTEFACT;
    $this->number = 30;
    $this->name = clienttranslate('Nimrud Lens');
    $this->country = clienttranslate('Iraq');
    $this->text = [clienttranslate('It may be the oldest optical lens ever discovered, but its use continues to be debated.')];
    $this->activation = ANYTIME;
    $this->discard = 1;
    $this->effect = [
      clienttranslate(
        'Each time you LEARN a Technology (<ANCIENT>, <WRITING>, <SECRET>), you may discard 1 <KNOWLEDGE> from any of your monuments.'
      ),
    ];
  }
}
