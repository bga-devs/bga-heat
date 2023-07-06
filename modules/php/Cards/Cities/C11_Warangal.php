<?php
namespace AK\Cards\Cities;

class C11_Warangal extends \AK\Models\Building
{
  public function __construct($row)
  {
    parent::__construct($row);
    $this->id = 'C11_Warangal';
    $this->type = CITY;
    $this->number = 11;
    $this->name = clienttranslate('Warangal');
    $this->country = clienttranslate('India');
    $this->text = [clienttranslate('This city has many Hindu temple, including the famous temple of a thousand pillars.')];

    $this->startingHand = 3;
    $this->victoryPoint = 1;
    $this->initialKnowledge = 2;
    $this->startingSpace = 5;
    $this->activation = ANYTIME;
    $this->effect = [
      clienttranslate('Each time you LEARN 1 <SECRET> :'),
      clienttranslate('• discard 1 <KNOWLEDGE> from any of your monuments;'),
      clienttranslate('• and draw 1 card.'),
    ];
  }
}
