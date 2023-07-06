<?php
namespace AK\Cards\Megaliths;

class M12_StatuesOfRamesses extends \AK\Models\Building
{
  public function __construct($row)
  {
    parent::__construct($row);
    $this->id = 'M12_StatuesOfRamesses';
    $this->type = MEGALITH;
    $this->number = 12;
    $this->name = clienttranslate('Statues Of Ramesses II');
    $this->country = clienttranslate('Egypt');
    $this->text = [clienttranslate('This 10 meter tall colossus located in the Luxor Temple has impressive facial symmetry.')];

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
