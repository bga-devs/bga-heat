<?php
namespace AK\Cards\Pyramids;

class P34_PyramidsOfPlaineMagnien extends \AK\Models\Building
{
  public function __construct($row)
  {
    parent::__construct($row);
    $this->id = 'P34_PyramidsOfPlaineMagnien';
    $this->type = PYRAMID;
    $this->number = 34;
    $this->name = clienttranslate('Pyramids Of Plaine Magnien');
    $this->country = clienttranslate('Mauritius');
    $this->text = [
      clienttranslate(
        'Measuring less than 12 meters high, there are 7 of them on the island. Simple heaps of stones or thoughtful constructions?'
      ),
    ];

    $this->startingHand = 2;
    $this->victoryPoint = 0;
    $this->initialKnowledge = 0;
    $this->startingSpace = 2;
    $this->activation = DECLINE;
    $this->effect = [
      clienttranslate("Secretly look at the top 8 cards of the Builder deck:
• add 1 to your hand;
• and discard the other 7 cards."),
    ];
  }
}
