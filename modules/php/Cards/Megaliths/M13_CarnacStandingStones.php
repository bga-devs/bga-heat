<?php
namespace AK\Cards\Megaliths;

class M13_CarnacStandingStones extends \AK\Models\Building
{
  public function __construct($row)
  {
    parent::__construct($row);
    $this->id = 'M13_CarnacStandingStones';
    $this->type = MEGALITH;
    $this->number = 13;
    $this->name = clienttranslate('Carnac Standing Stones');
    $this->country = clienttranslate('France');
    $this->text = [
      clienttranslate('This alignment is made up of over 4,000 raised stones over a length of more than one kilometer.'),
    ];

    $this->victoryPoint = 0;
    $this->initialKnowledge = 3;
    $this->startingSpace = 6;
    $this->discard = 4;
    $this->lockedSpace = true;
    $this->activation = DECLINE;
    $this->effect = [clienttranslate('If you have at least 20 <LOST_KNOWLEDGE> on your board, discard 15 <LOST_KNOWLEDGE>.')];
    $this->implemented = true;
  }

  public function getDeclineEffect()
  {
    $n = $this->getPlayer()->getLostKnowledge();
    return $n < 20
      ? null
      : [
        'action' => \DISCARD_LOST_KNOWLEDGE,
        'args' => ['n' => 15],
      ];
  }
}
