<?php
namespace AK\Cards\Artefacts;

class A24_GeneticDisk extends \AK\Models\Artefact
{
  public function __construct($row)
  {
    parent::__construct($row);
    $this->id = 'A24_GeneticDisk';
    $this->type = ARTEFACT;
    $this->number = 24;
    $this->name = clienttranslate('Genetic Disk');
    $this->country = clienttranslate('Colombia');
    $this->text = [clienttranslate('This disc represents genetic elements only visible under a microscope.')];
    $this->activation = ANYTIME;
    $this->startingHand = 3;
    $this->effect = [
      clienttranslate(
        'Each time you play a monument on space [n°5] or [n°6], you may discard up to 2 <KNOWLEDGE> from one or several of your monuments.'
      ),
    ];
  }
}
