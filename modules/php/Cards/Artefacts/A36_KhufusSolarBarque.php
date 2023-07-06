<?php
namespace AK\Cards\Artefacts;

class A36_KhufusSolarBarque extends \AK\Models\Artefact
{
  public function __construct($row)
  {
    parent::__construct($row);
    $this->id = 'A36_KhufusSolarBarque';
    $this->type = ARTEFACT;
    $this->number = 36;
    $this->name = clienttranslate('Khufu’s Solar Barque');
    $this->country = clienttranslate('Egypt');
    $this->text = [
      clienttranslate(
        'A symbolic object of Egyptian mythology, it is stored disassembled in a pit at the foot of the Pyramid of Khufu.'
      ),
    ];
    $this->activation = ANYTIME;
    $this->effect = [clienttranslate('Your <PYRAMID> enter play with 1 <KNOWLEDGE> less.')];
    $this->implemented = true;
  }

  public function getKnowledgeReduction($card)
  {
    return $card->getType() == \PYRAMID ? 1 : 0;
  }
}
