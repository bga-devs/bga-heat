<?php
namespace AK\Cards\Artefacts;

class A19_VoynichManuscript extends \AK\Models\Artefact
{
  public function __construct($row)
  {
    parent::__construct($row);
    $this->id = 'A19_VoynichManuscript';
    $this->type = ARTEFACT;
    $this->number = 19;
    $this->name = clienttranslate('Voynich Manuscript');
    $this->country = clienttranslate('Italy');
    $this->text = [
      clienttranslate(
        'Written in an undeciphered script and an unidentified language, it is one of the most famous documents in the history of cryptography.'
      ),
    ];
    $this->activation = ANYTIME;
    $this->effect = [clienttranslate('Each time you LEARN 1 <SECRET>, draw 2 cards.')];
  }
}
