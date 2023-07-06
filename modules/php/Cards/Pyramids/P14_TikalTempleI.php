<?php
namespace AK\Cards\Pyramids;

class P14_TikalTempleI extends \AK\Models\Building
{
  public function __construct($row)
  {
    parent::__construct($row);
    $this->id = 'P14_TikalTempleI';
    $this->type = PYRAMID;
    $this->number = 14;
    $this->name = clienttranslate('Tikal Temple I');
    $this->country = clienttranslate('Guatemala');
    $this->text = [
      clienttranslate('One of the largest archaeological sites and urban centers of the pre-Columbian Maya civilization.'),
    ];

    $this->startingHand = 3;
    $this->victoryPoint = 2;
    $this->initialKnowledge = 4;
    $this->startingSpace = 3;
    $this->activation = IMMEDIATE;
    $this->effect = [clienttranslate('You may LEARN 1 Technology if you fulfill its requirements.')];
    $this->implemented = true;
  }

  public function getImmediateEffect()
  {
    return [
      'action' => LEARN,
      'optional' => true,
    ];
  }
}
