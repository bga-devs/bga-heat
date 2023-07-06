<?php
namespace AK\Cards\Monoliths;

class M14_MenhirOfKerloas extends \AK\Models\Building
{
  public function __construct($row)
  {
    parent::__construct($row);
    $this->id = 'M14_MenhirOfKerloas';
    $this->type = MONOLITH;
    $this->number = 14;
    $this->name = clienttranslate('Menhir Of Kerloas');
    $this->country = clienttranslate('France');
    $this->text = [clienttranslate('It is considered the tallest menhir currently standing at 9.50 meters above ground.')];

    $this->victoryPoint = 1;
    $this->initialKnowledge = 3;
    $this->startingSpace = 3;
    $this->lockedSpace = true;
    $this->activation = DECLINE;
    $this->effect = [clienttranslate('Look at one of your opponents’ hands and take 1 card of your choice from them.')];
  }
}
