<?php
namespace AK\Cards\Pyramids;

class P13_Yonaguni extends \AK\Models\Building
{
  public function __construct($row)
  {
    parent::__construct($row);
    $this->id = 'P13_Yonaguni';
    $this->type = PYRAMID;
    $this->number = 13;
    $this->name = clienttranslate('Yonaguni');
    $this->country = clienttranslate('Japan');
    $this->text = [clienttranslate('Gigantic underwater pyramid or natural formation?')];

    $this->victoryPoint = 8;
    $this->initialKnowledge = 14;
    $this->startingSpace = 4;
    $this->activation = IMMEDIATE;
    $this->effect = [
      clienttranslate(
        'You may discard as many <ARTEFACT> from your board as you wish. Discard 4 <KNOWLEDGE> from this monument for each <ARTEFACT> you discard.'
      ),
    ];
  }
}
