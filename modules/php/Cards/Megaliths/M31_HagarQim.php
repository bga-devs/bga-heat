<?php
namespace AK\Cards\Megaliths;

class M31_HagarQim extends \AK\Models\Building
{
  public function __construct($row)
  {
    parent::__construct($row);
    $this->id = 'M31_HagarQim';
    $this->type = MEGALITH;
    $this->number = 31;
    $this->name = clienttranslate('ĦaĠar Qim');
    $this->country = clienttranslate('Malta');
    $this->text = [clienttranslate('This is a huge complex made up of four temples built over a period of a thousand years.')];

    $this->victoryPoint = 2;
    $this->initialKnowledge = 3;
    $this->startingSpace = 2;
    $this->activation = TIMELINE;
    $this->effect = [clienttranslate('Discard 1 <LOST_KNOWLEDGE> from your board.')];
    $this->implemented = true;
  }

  public function getTimelineEffect()
  {
    return [
      'action' => \DISCARD_LOST_KNOWLEDGE,
      'args' => ['n' => 1],
    ];
  }
}
