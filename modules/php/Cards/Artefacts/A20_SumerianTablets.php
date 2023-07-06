<?php
namespace AK\Cards\Artefacts;

class A20_SumerianTablets extends \AK\Models\Artefact
{
  public function __construct($row)
  {
    parent::__construct($row);
    $this->id = 'A20_SumerianTablets';
    $this->type = ARTEFACT;
    $this->number = 20;
    $this->name = clienttranslate('Sumerian Tablets');
    $this->country = clienttranslate('Iraq');
    $this->text = [
      clienttranslate(
        'Some tablets tell the story of a race of gods from another world, the Annunaki, who brought advanced knowledge to the planet.'
      ),
    ];
    $this->activation = ANYTIME;
    $this->effect = [clienttranslate('Each time you LEARN 1 Technology (<WRITING>, <ANCIENT> or |secret]), draw 1 card.')];
  }
}
