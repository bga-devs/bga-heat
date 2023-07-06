<?php
namespace AK\Cards\Megaliths;

class M20_ColossiOfMemnon extends \AK\Models\Building
{
  public function __construct($row)
  {
    parent::__construct($row);
    $this->id = 'M20_ColossiOfMemnon';
    $this->type = MEGALITH;
    $this->number = 20;
    $this->name = clienttranslate('Colossi Of Memnon');
    $this->country = clienttranslate('Egypt');
    $this->text = [
      clienttranslate(
        'These are the last vestiges of the gigantic temple of Amenhotep III. Each colossus weighs more than 1300 tons.'
      ),
    ];

    $this->victoryPoint = 2;
    $this->initialKnowledge = 2;
    $this->startingSpace = 5;
    $this->activation = ANYTIME;
    $this->effect = [clienttranslate('Your other <MEGALITH> enter play with 1 <KNOWLEDGE> less.')];
    $this->implemented = true;
  }

  public function getKnowledgeReduction($card)
  {
    return $card->getType() == MEGALITH ? 1 : 0;
  }
}
