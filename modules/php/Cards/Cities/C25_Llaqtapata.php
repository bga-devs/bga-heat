<?php
namespace AK\Cards\Cities;

class C25_Llaqtapata extends \AK\Models\Building
{
  public function __construct($row)
  {
    parent::__construct($row);
    $this->id = 'C25_Llaqtapata';
    $this->type = CITY;
    $this->number = 25;
    $this->name = clienttranslate('Llaqtapata');
    $this->country = clienttranslate('Peru');
    $this->text = [clienttranslate('This was a rest stop on the Inca Trail.')];

    $this->victoryPoint = 6;
    $this->initialKnowledge = 6;
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
