<?php
namespace AK\Cards\Pyramids;

class P21_Phimeanakas extends \AK\Models\Building
{
  public function __construct($row)
  {
    parent::__construct($row);
    $this->id = 'P21_Phimeanakas';
    $this->type = PYRAMID;
    $this->number = 21;
    $this->name = clienttranslate('Phimeanakas');
    $this->country = clienttranslate('Cambodia');
    $this->text = [
      clienttranslate(
        'It is the royal Hindu temple within the grounds of the royal palace of the ancient city Angkor Thom in Angkor.'
      ),
    ];

    $this->startingHand = 3;
    $this->victoryPoint = 1;
    $this->initialKnowledge = 2;
    $this->startingSpace = 5;
    $this->activation = ANYTIME;
    $this->effect = [
      clienttranslate("Each time you LEARN 1 <ANCIENT> :
• discard 1 <KNOWLEDGE> from any of your monuments;
• and draw 1 card."),
    ];
  }
}
