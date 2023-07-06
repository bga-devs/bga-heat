<?php
namespace AK\Cards\Cities;

class C16_Heracleion extends \AK\Models\Building
{
  public function __construct($row)
  {
    parent::__construct($row);
    $this->id = 'C16_Heracleion';
    $this->type = CITY;
    $this->number = 16;
    $this->name = clienttranslate('Heracleion');
    $this->country = clienttranslate('Egypt');
    $this->text = [
      clienttranslate(
        'It was discovered in 20001, submerged in the bay of Aboukir, during underwater archaeological excavations.'
      ),
    ];

    $this->victoryPoint = 2;
    $this->initialKnowledge = 2;
    $this->startingSpace = 2;
    $this->discard = 2;
    $this->activation = DECLINE;
    $this->effect = [clienttranslate('Draw 4 cards.')];
    $this->implemented = true;
  }

  public function getDeclineEffect()
  {
    return [
      'action' => DRAW,
      'args' => ['n' => 4],
    ];
  }
}
