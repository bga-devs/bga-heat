<?php
namespace AK\Cards\Artefacts;

class A26_NebraSkyDisc extends \AK\Models\Artefact
{
  public function __construct($row)
  {
    parent::__construct($row);
    $this->id = 'A26_NebraSkyDisc';
    $this->type = ARTEFACT;
    $this->number = 26;
    $this->name = clienttranslate('Nebra Sky Disc');
    $this->country = clienttranslate('Germany');
    $this->text = [
      clienttranslate(
        'This disc is considered the oldest known representation of the celestial vault. Its perimeter is 1 meter around.'
      ),
    ];
    $this->activation = ANYTIME;
    $this->effect = [clienttranslate('Your <MEGALITH> enter play with 1 <KNOWLEDGE> less.')];
    $this->implemented = true;
  }

  public function getKnowledgeReduction($card)
  {
    return $card->getType() == MEGALITH ? 1 : 0;
  }
}
