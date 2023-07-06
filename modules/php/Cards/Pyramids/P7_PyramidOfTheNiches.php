<?php
namespace AK\Cards\Pyramids;

class P7_PyramidOfTheNiches extends \AK\Models\Building
{
  public function __construct($row)
  {
    parent::__construct($row);
    $this->id = 'P7_PyramidOfTheNiches';
    $this->type = PYRAMID;
    $this->number = 7;
    $this->name = clienttranslate('Pyramid Of The Niches');
    $this->country = clienttranslate('Mexico');
    $this->text = [
      clienttranslate('At 18 meters high, this pyramid covers an earlier construction that had similar architecture.'),
    ];

    $this->victoryPoint = 1;
    $this->initialKnowledge = 3;
    $this->startingSpace = 3;
    $this->activation = DECLINE;
    $this->effect = [
      clienttranslate("Secretly look at the top 7 Technology [II] cards of the deck:
• LEARN1 if you fulfill its requirements;
• and put the remaining cards on the bottom of the deck, in any order."),
    ];
  }
}
