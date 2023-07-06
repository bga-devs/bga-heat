<?php
namespace AK\Cards\Pyramids;

class P9_Caral extends \AK\Models\Building
{
  public function __construct($row)
  {
    parent::__construct($row);
    $this->id = 'P9_Caral';
    $this->type = PYRAMID;
    $this->number = 9;
    $this->name = clienttranslate('Caral');
    $this->country = clienttranslate('Peru');
    $this->text = [
      clienttranslate(
        'Estimated to be around 5,000 years old, whereas urban development  in the rest of the Americas began 1,500 years later.'
      ),
    ];

    $this->victoryPoint = 2;
    $this->initialKnowledge = 2;
    $this->startingSpace = 4;
    $this->activation = DECLINE;
    $this->effect = [clienttranslate('You may LEARN 1 Technology if you fulfill its requirements.')];
    $this->implemented = true;
  }

  public function getDeclineEffect()
  {
    return [
      'action' => LEARN,
      'optional' => true,
    ];
  }
}
