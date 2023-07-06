<?php
namespace AK\Cards\Artefacts;

class A6_AntikytheraMechanism extends \AK\Models\Artefact
{
  public function __construct($row)
  {
    parent::__construct($row);
    $this->id = 'A6_AntikytheraMechanism';
    $this->type = ARTEFACT;
    $this->number = 6;
    $this->name = clienttranslate('Antikythera Mechanism');
    $this->country = clienttranslate('Greece');
    $this->text = [clienttranslate('This mechanism is considered the first astronomical position calculator.')];
    $this->activation = TIMELINE;
    $this->effect = [
      clienttranslate(
        'If one of your monuments in the [n°1] space of your Timeline has at least 4 <KNOWLEDGE>, move it to [n°3] if possible. Otherwise nothing happens.'
      ),
    ];
  }

  public function getTimelineEffect()
  {
    return null;
  }
}
