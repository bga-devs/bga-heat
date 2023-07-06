<?php
namespace AK\Cards\Monoliths;

class M11_MenhirsOfMonteneuf extends \AK\Models\Building
{
  public function __construct($row)
  {
    parent::__construct($row);
    $this->id = 'M11_MenhirsOfMonteneuf';
    $this->type = MONOLITH;
    $this->number = 11;
    $this->name = clienttranslate('Menhirs Of Monteneuf');
    $this->country = clienttranslate('France');
    $this->text = [clienttranslate('The site consists of more than 400 menhirs made of purple schist.')];

    $this->victoryPoint = 2;
    $this->initialKnowledge = 2;
    $this->startingSpace = 4;
    $this->activation = DECLINE;
    $this->effect = [clienttranslate('You may CREATE 1 monument.')];
  }
}
