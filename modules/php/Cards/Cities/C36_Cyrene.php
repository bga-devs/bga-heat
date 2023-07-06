<?php
namespace AK\Cards\Cities;

class C36_Cyrene extends \AK\Models\Building
{
  public function __construct($row)
  {
    parent::__construct($row);
    $this->id = 'C36_Cyrene';
    $this->type = CITY;
    $this->number = 36;
    $this->name = clienttranslate('Cyrene');
    $this->country = clienttranslate('Libya');
    $this->text = [clienttranslate('Cyrene was founded by Greeks from Thera following the advice of the Oracle of Delphi.')];

    $this->victoryPoint = 7;
    $this->initialKnowledge = 8;
    $this->startingSpace = 3;
    $this->activation = TIMELINE;
    $this->effect = [clienttranslate('If you have at least 4 <CITY> in your Past, discard 2 <KNOWLEDGE> from this monument.')];
    $this->implemented = true;
  }

  public function getTimelineEffect()
  {
    $n = $this->countIcon(CITY);
    return $n < 4
      ? null
      : [
        'action' => REMOVE_KNOWLEDGE,
        'args' => [
          'n' => 2,
          'cardIds' => [$this->id],
        ],
      ];
  }
}
