<?php
namespace AK\Cards\Artefacts;

class A17_GlozelArtifacts extends \AK\Models\Artefact
{
  public function __construct($row)
  {
    parent::__construct($row);
    $this->id = 'A17_GlozelArtifacts';
    $this->type = ARTEFACT;
    $this->number = 17;
    $this->name = clienttranslate('Glozel Artifacts');
    $this->country = clienttranslate('France');
    $this->text = [
      clienttranslate(
        'Covered with indecipherable signs, these tablets radically challenge chronology. Emile Fradin was accused of coutnerfeiting their existance after discovering them in 1924.'
      ),
    ];
    $this->activation = ANYTIME;
    $this->effect = [clienttranslate('Each time you LEARN 1 <WRITING>, draw 2 cards.')];
  }
}
