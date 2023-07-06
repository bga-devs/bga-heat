<?php
namespace AK\Cards\Artefacts;

class A27_IronPillarOfDelhi extends \AK\Models\Artefact
{
  public function __construct($row)
  {
    parent::__construct($row);
    $this->id = 'A27_IronPillarOfDelhi';
    $this->type = ARTEFACT;
    $this->number = 27;
    $this->name = clienttranslate('Iron Pillar Of Delhi');
    $this->country = clienttranslate('India');
    $this->text = [
      clienttranslate(
        'It is known for having a strong resistance to rust, due to a uniform layer of crystalline iron hydrogen phosphate which protects it from environmental effects.'
      ),
    ];
    $this->activation = TIMELINE;
    $this->effect = [
      clienttranslate("If you have 2 monuments in space [n°1]:
• Discard 1 <KNOWLEDGE> from any of your monument;
• and draw 1 card."),
    ];
  }
}
