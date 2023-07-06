<?php
namespace AK\Cards\Cities;

class C26_MachuPicchu extends \AK\Models\Building
{
  public function __construct($row)
  {
    parent::__construct($row);
    $this->id = 'C26_MachuPicchu';
    $this->type = CITY;
    $this->number = 26;
    $this->name = clienttranslate('Machu Picchu');
    $this->country = clienttranslate('Peru');
    $this->text = [clienttranslate('Its name comes from Quechua (machu: old and pikchu: mountain, summit).')];

    $this->victoryPoint = 7;
    $this->initialKnowledge = 7;
    $this->startingSpace = 3;
    $this->activation = DECLINE;
    $this->effect = [clienttranslate('If this monument has at least 1 <KNOWLEDGE>, discard this card immediately.')];
    $this->implemented = true;
  }

  public function getDeclineEffect()
  {
    return $this->getKnowledge() == 0
      ? null
      : [
        'action' => DESTROY,
        'args' => ['cardId' => $this->id],
      ];
  }
}
