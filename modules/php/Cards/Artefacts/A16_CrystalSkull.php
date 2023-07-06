<?php
namespace AK\Cards\Artefacts;

class A16_CrystalSkull extends \AK\Models\Artefact
{
  public function __construct($row)
  {
    parent::__construct($row);
    $this->id = 'A16_CrystalSkull';
    $this->type = ARTEFACT;
    $this->number = 16;
    $this->name = clienttranslate('Crystal Skull');
    $this->country = clienttranslate('Belize');
    $this->text = [clienttranslate('The pre-Columbian origin of crystal skulls is often questioned.')];
    $this->activation = ANYTIME;
    $this->effect = [
      clienttranslate(
        'Each time you rotate at least 3 monuments during an EXCAVATE action, LEARN 1 Technology if you fulfill its requirements.'
      ),
    ];
  }
}
