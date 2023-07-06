<?php
namespace AK\Cards\Monoliths;

class M26_ChabolaDeLaHechicera extends \AK\Models\Building
{
  public function __construct($row)
  {
    parent::__construct($row);
    $this->id = 'M26_ChabolaDeLaHechicera';
    $this->type = MONOLITH;
    $this->number = 26;
    $this->name = clienttranslate('Chabola De La Hechicera');
    $this->country = clienttranslate('Spain');
    $this->text = [
      clienttranslate(
        'One of the most important dolmens in the Basque Country, its chamber is made up of 9 rough stones that form a polygonal figure'
      ),
    ];

    $this->startingHand = 2;
    $this->victoryPoint = 1;
    $this->initialKnowledge = 3;
    $this->startingSpace = 6;
    $this->activation = ANYTIME;
    $this->effect = [
      clienttranslate("Each time you CREATE 1 <ARTEFACT> :
• discard 1 <KNOWLEDGE> from any of your monuments;
• and draw 1 card."),
    ];
  }
}
