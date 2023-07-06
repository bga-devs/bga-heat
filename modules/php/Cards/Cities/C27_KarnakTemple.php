<?php
namespace AK\Cards\Cities;

class C27_KarnakTemple extends \AK\Models\Building
{
  public function __construct($row)
  {
    parent::__construct($row);
    $this->id = 'C27_KarnakTemple';
    $this->type = CITY;
    $this->number = 27;
    $this->name = clienttranslate('Karnak Temple');
    $this->country = clienttranslate('Egypt');
    $this->text = [
      clienttranslate(
        'Constructed over 2,000 years by successive pharaohs, it extends more than two square km, and is made up of three enclosures.'
      ),
    ];

    $this->victoryPoint = 8;
    $this->initialKnowledge = 8;
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
