<?php
namespace AK\Cards\Pyramids;

class P11_PyramidOfCoba extends \AK\Models\Building
{
  public function __construct($row)
  {
    parent::__construct($row);
    $this->id = 'P11_PyramidOfCoba';
    $this->type = PYRAMID;
    $this->number = 11;
    $this->name = clienttranslate('Pyramid Of Coba');
    $this->country = clienttranslate('Mexique');
    $this->text = [
      clienttranslate('At 42 meters high, the temple of Nohoch Mul is one of the tallest pyramids in the entire Maya region.'),
    ];

    $this->victoryPoint = 1;
    $this->initialKnowledge = 2;
    $this->startingSpace = 3;
    $this->activation = DECLINE;
    $this->effect = [
      clienttranslate('If you have at least 3 <MEGALITH> in your Past, discard up to 4 <LOST_KNOWLEDGE> from your board.'),
    ];
    $this->implemented = true;
  }

  public function getDeclineEffect()
  {
    $n = $this->getPlayer()->countIcon(MEGALITH);
    return $n < 3
      ? null
      : [
        'action' => \DISCARD_LOST_KNOWLEDGE,
        'args' => ['n' => 4],
      ];
  }
}
