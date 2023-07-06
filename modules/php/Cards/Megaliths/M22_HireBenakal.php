<?php
namespace AK\Cards\Megaliths;

class M22_HireBenakal extends \AK\Models\Building
{
  public function __construct($row)
  {
    parent::__construct($row);
    $this->id = 'M22_HireBenakal';
    $this->type = MEGALITH;
    $this->number = 22;
    $this->name = clienttranslate('Hire Benakal');
    $this->country = clienttranslate('India');
    $this->text = [clienttranslate('Made up of more than 400 funerary monuments, the highest dolmen is 3 meters high.')];

    $this->startingHand = 3;
    $this->victoryPoint = 1;
    $this->initialKnowledge = 2;
    $this->startingSpace = 5;
    $this->activation = ANYTIME;
    $this->effect = [
      clienttranslate("Each time you LEARN 1 <WRITING> : 
• discard 1 <KNOWLEDGE> from any of your monuments;
• and draw 1 card."),
    ];
  }
}
