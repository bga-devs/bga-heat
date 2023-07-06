<?php
namespace AK\Cards\Monoliths;

class M28_MegalithsOfCauria extends \AK\Models\Building
{
  public function __construct($row)
  {
    parent::__construct($row);
    $this->id = 'M28_MegalithsOfCauria';
    $this->type = MONOLITH;
    $this->number = 28;
    $this->name = clienttranslate('Megaliths Of Cauria');
    $this->country = clienttranslate('France');
    $this->text = [
      clienttranslate('These Corsican statue-menhirs are considered a particularity within Neolithic anthropomorphic art.'),
    ];

    $this->victoryPoint = 0;
    $this->initialKnowledge = 2;
    $this->startingSpace = 1;
    $this->activation = IMMEDIATE;
    $this->effect = [clienttranslate('Add 1 <KNOWLEDGE> from the reserve to any monument in each of your opponents’ Timelines.')];
  }
}
