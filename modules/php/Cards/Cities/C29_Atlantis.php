<?php
namespace AK\Cards\Cities;

class C29_Atlantis extends \AK\Models\Building
{
  public function __construct($row)
  {
    parent::__construct($row);
    $this->id = 'C29_Atlantis';
    $this->type = CITY;
    $this->number = 29;
    $this->name = clienttranslate('Atlantis');
    $this->country = clienttranslate('Unknown');
    $this->text = [
      clienttranslate(
        "The story of Atlantis originates from two of Athenian philospher Plato's Dialogues. Its existence has never been proven."
      ),
    ];

    $this->victoryPoint = 12;
    $this->initialKnowledge = 10;
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
