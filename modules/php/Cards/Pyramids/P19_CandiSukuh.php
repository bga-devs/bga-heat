<?php
namespace AK\Cards\Pyramids;

class P19_CandiSukuh extends \AK\Models\Building
{
  public function __construct($row)
  {
    parent::__construct($row);
    $this->id = 'P19_CandiSukuh';
    $this->type = PYRAMID;
    $this->number = 19;
    $this->name = clienttranslate('Candi Sukuh');
    $this->country = clienttranslate('Indonesia');
    $this->text = [clienttranslate('One of the 5 terraced pyramids of Indonesia. Its base is trapezoidal.')];

    $this->victoryPoint = 0;
    $this->initialKnowledge = 4;
    $this->startingSpace = 4;
    $this->lockedSpace = true;
    $this->activation = ANYTIME;
    $this->effect = [
      clienttranslate(
        'When you LEARN, you may reduce one of the values of the Technology requirements by 1 (to a minimum of 0).'
      ),
    ];
  }
}
