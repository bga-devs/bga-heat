<?php
namespace AK\Cards\Megaliths;

class M34_MontguyonDolmen extends \AK\Models\Building
{
  public function __construct($row)
  {
    parent::__construct($row);
    $this->id = 'M34_MontguyonDolmen';
    $this->type = MEGALITH;
    $this->number = 34;
    $this->name = clienttranslate('Montguyon Dolmen');
    $this->country = clienttranslate('France');
    $this->text = [
      clienttranslate(
        'The largest capstone weighs more than 30 tons and was extracted from a quarry located more than 2.5 kilometers from the site.'
      ),
    ];

    $this->victoryPoint = 0;
    $this->initialKnowledge = 3;
    $this->startingSpace = 5;
    $this->discard = 3;
    $this->activation = DECLINE;
    $this->effect = [clienttranslate('You may LEARN 1 Technology without fulfilling the requirements.')];
    $this->implemented = true;
  }

  public function getDeclineEffect()
  {
    return [
      'action' => LEARN,
      'args' => ['checkRequirements' => false],
      'optional' => true,
    ];
  }
}
