<?php
namespace AK\Cards\Megaliths;

class M8_DolmenOfGochang extends \AK\Models\Building
{
  public function __construct($row)
  {
    parent::__construct($row);
    $this->id = 'M8_DolmenOfGochang';
    $this->type = MEGALITH;
    $this->number = 8;
    $this->name = clienttranslate('Dolmen Of Gochang');
    $this->country = clienttranslate('Corée du Sud');
    $this->text = [
      clienttranslate(
        'In the largest sizes, the cover slabs measure between 1m and 5.8 meters and can weigh from 10 to 30 tons.'
      ),
    ];

    $this->victoryPoint = 1;
    $this->initialKnowledge = 3;
    $this->startingSpace = 4;
    $this->activation = DECLINE;
    $this->effect = [clienttranslate('If you have 5 <MEGALITH> in your Past, discard 7 <LOST_KNOWLEDGE> from your board.')];
    $this->implemented = true;
  }

  public function getImmediateEffect()
  {
    $n = $this->getPlayer()->countIcon(MEGALITH);
    return $n != 5
      ? null
      : [
        'action' => \DISCARD_LOST_KNOWLEDGE,
        'args' => ['n' => 7],
      ];
  }
}
