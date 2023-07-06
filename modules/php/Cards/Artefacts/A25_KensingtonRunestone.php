<?php
namespace AK\Cards\Artefacts;

class A25_KensingtonRunestone extends \AK\Models\Artefact
{
  public function __construct($row)
  {
    parent::__construct($row);
    $this->id = 'A25_KensingtonRunestone';
    $this->type = ARTEFACT;
    $this->number = 25;
    $this->name = clienttranslate('Kensington Runestone');
    $this->country = clienttranslate('United States');
    $this->text = [
      clienttranslate('This stone suggests that Scandinavian explorers reached the center of North America in the 14th century.'),
    ];
    $this->activation = ANYTIME;
    $this->effect = [
      clienttranslate(
        'When you EXCAVATE, if you rotate exactly 2 cards in your Past, you may discard up to 6 <KNOWLEDGE> from one or several of your monuments, instead of drawing cards.'
      ),
    ];
  }
}
