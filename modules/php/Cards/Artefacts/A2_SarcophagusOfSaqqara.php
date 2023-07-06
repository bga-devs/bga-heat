<?php
namespace AK\Cards\Artefacts;

class A2_SarcophagusOfSaqqara extends \AK\Models\Artefact
{
  public function __construct($row)
  {
    parent::__construct($row);
    $this->id = 'A2_SarcophagusOfSaqqara';
    $this->type = ARTEFACT;
    $this->number = 2;
    $this->name = clienttranslate('Sarcophagus Of Saqqara');
    $this->country = clienttranslate('Egypt');
    $this->text = [clienttranslate('Built in honor of the god Apis, the serapeum contained more than 20 granite sarcophagi.')];
    $this->activation = TIMELINE;
    $this->effect = [
      clienttranslate("If you have at least 3 <CITY> in your Timeline:
• discard 1 <KNOWLEDGE> from any of your monument;
• and draw 1 card."),
    ];
  }

  public function getTimelineEffect()
  {
    return null;
  }
}
