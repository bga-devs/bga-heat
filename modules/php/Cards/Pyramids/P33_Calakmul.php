<?php
namespace AK\Cards\Pyramids;

class P33_Calakmul extends \AK\Models\Building
{
  public function __construct($row)
  {
    parent::__construct($row);
    $this->id = 'P33_Calakmul';
    $this->type = PYRAMID;
    $this->number = 33;
    $this->name = clienttranslate('Calakmul');
    $this->country = clienttranslate('Mexico');
    $this->text = [
      clienttranslate(
        'This mighty Mayan city was inhabited for more than a millennium, before being being abandonned and swallowed up by the jungle.'
      ),
    ];

    $this->victoryPoint = 1;
    $this->initialKnowledge = 1;
    $this->startingSpace = 1;
    $this->discard = 2;
    $this->activation = DECLINE;
    $this->effect = [
      clienttranslate("Draw cards until you reveal 2 <CITY>. 
• add the 2 <CITY> to your hand;
• and discard the other revealed cards."),
    ];
  }
}
