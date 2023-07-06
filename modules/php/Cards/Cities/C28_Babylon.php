<?php
namespace AK\Cards\Cities;

class C28_Babylon extends \AK\Models\Building
{
  public function __construct($row)
  {
    parent::__construct($row);
    $this->id = 'C28_Babylon';
    $this->type = CITY;
    $this->number = 28;
    $this->name = clienttranslate('Babylon');
    $this->country = clienttranslate('Iraq');
    $this->text = [clienttranslate('It was undoubtedly the first city to have over 200,000 inhabitants.')];

    $this->victoryPoint = 10;
    $this->initialKnowledge = 9;
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
