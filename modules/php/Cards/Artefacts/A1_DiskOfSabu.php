<?php
namespace AK\Cards\Artefacts;

class A1_DiskOfSabu extends \AK\Models\Artefact
{
  public function __construct($row)
  {
    parent::__construct($row);
    $this->id = 'A1_DiskOfSabu';
    $this->type = ARTEFACT;
    $this->number = 1;
    $this->name = clienttranslate('Disk Of Sabu');
    $this->country = clienttranslate('Egypt');
    $this->text = [clienttranslate('Discovered in the tomb of Sabu, its function and meaning remain unknown.')];
    $this->activation = TIMELINE;
    $this->effect = [
      clienttranslate('If you have at least 4 <MEGALITH> in your Past, discard 1 <LOST_KNOWLEDGE> from your board.'),
    ];
    $this->implemented = true;
  }

  public function getImmediateEffect()
  {
    $n = $this->getPlayer()->countIcon(MEGALITH);
    return $n < 3
      ? null
      : [
        'action' => \DISCARD_LOST_KNOWLEDGE,
        'args' => ['n' => 1],
      ];
  }
}
