<?php
namespace AK\Cards\Artefacts;

class A15_LudditeFlute extends \AK\Models\Artefact
{
  public function __construct($row)
  {
    parent::__construct($row);
    $this->id = 'A15_LudditeFlute';
    $this->type = ARTEFACT;
    $this->number = 15;
    $this->name = clienttranslate('Luddite Flute');
    $this->country = clienttranslate('Bolivia');
    $this->text = [clienttranslate('The sound vibration from these stone flutes is exactly the same as our brain waves.')];
    $this->activation = TIMELINE;
    $this->effect = [
      clienttranslate('You may discard this card from your board. If you do, straighten up to 4 monuments from your Past.'),
    ];
  }

  public function getTimelineEffect()
  {
    return null;
  }
}
