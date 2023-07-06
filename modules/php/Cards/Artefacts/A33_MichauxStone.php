<?php
namespace AK\Cards\Artefacts;

class A33_MichauxStone extends \AK\Models\Artefact
{
  public function __construct($row)
  {
    parent::__construct($row);
    $this->id = 'A33_MichauxStone';
    $this->type = ARTEFACT;
    $this->number = 33;
    $this->name = clienttranslate('Michaux Stone');
    $this->country = clienttranslate('Iraq');
    $this->text = [
      clienttranslate(
        'Written in the Babylonian language using cuneiform signs, the text describes a contract for the gift of agricultural land from a father to his daughter.'
      ),
    ];
    $this->discard = 3;
    $this->activation = TIMELINE;
    $this->effect = [
      clienttranslate(
        'If you have at least 17 <LOST_KNOWLEDGE> on your board, you may LEARN 1 Technology if you fulfill its requirements.'
      ),
    ];
  }
}
