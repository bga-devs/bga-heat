<?php
namespace AK\Cards\Artefacts;

class A14_KlerksdorpSpheres extends \AK\Models\Artefact
{
  public function __construct($row)
  {
    parent::__construct($row);
    $this->id = 'A14_KlerksdorpSpheres';
    $this->type = ARTEFACT;
    $this->number = 14;
    $this->name = clienttranslate('Klerksdorp Spheres');
    $this->country = clienttranslate('South Africa');
    $this->text = [
      clienttranslate(
        '3 billion years old, these spheres are the source of several debates. Are their polished forms and aesthetic aspects natural?'
      ),
    ];
    $this->activation = TIMELINE;
    $this->startingHand = 4;
    $this->effect = [clienttranslate('If you have at least 5 <LOST_KNOWLEDGE> on your board, draw 1 card.')];
    $this->implemented = true;
  }

  public function getTimelineEffect()
  {
    $n = $this->getPlayer()->getLostKnowledge();
    return $n < 5
      ? null
      : [
        'action' => DRAW,
        'args' => ['n' => 1],
      ];
  }
}
