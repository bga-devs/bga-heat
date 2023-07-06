<?php
namespace AK\Cards\Megaliths;

class M7_CirclesOfMpumalanga extends \AK\Models\Building
{
  public function __construct($row)
  {
    parent::__construct($row);
    $this->id = 'M7_CirclesOfMpumalanga';
    $this->type = MEGALITH;
    $this->number = 7;
    $this->name = clienttranslate('Circles Of Mpumalanga');
    $this->country = clienttranslate('South Africa');
    $this->text = [
      clienttranslate(
        'Controversial researcher Michael Tellinger has unearthed hundreds of such constructions. Their functions remain unknown.'
      ),
    ];

    $this->victoryPoint = 0;
    $this->initialKnowledge = 3;
    $this->startingSpace = 5;
    $this->discard = 2;
    $this->activation = ENDGAME;
    $this->effect = [clienttranslate('Gain 1 <VP> for each <MEGALITH> in your past.')];
    $this->implemented = true;
  }

  public function getScore()
  {
    return $this->getPlayer()->countIcon(MEGALITH);
  }
}
