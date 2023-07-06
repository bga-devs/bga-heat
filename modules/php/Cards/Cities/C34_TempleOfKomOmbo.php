<?php
namespace AK\Cards\Cities;

class C34_TempleOfKomOmbo extends \AK\Models\Building
{
  public function __construct($row)
  {
    parent::__construct($row);
    $this->id = 'C34_TempleOfKomOmbo';
    $this->type = CITY;
    $this->number = 34;
    $this->name = clienttranslate('Temple Of Kom Ombo');
    $this->country = clienttranslate('Egypt');
    $this->text = [
      clienttranslate(
        'This temple was dedicated to worshipping two deities venerated on equal footing: Horus, the hawk-headed god and Sobek, the crocodile god.'
      ),
    ];

    $this->victoryPoint = 2;
    $this->initialKnowledge = 2;
    $this->startingSpace = 5;
    $this->activation = ANYTIME;
    $this->effect = [clienttranslate('Your <PYRAMID> enter play with 1 <KNOWLEDGE> less.')];
    $this->implemented = true;
  }

  public function getKnowledgeReduction($card)
  {
    return $card->getType() == PYRAMID ? 1 : 0;
  }
}
