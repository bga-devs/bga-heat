<?php
namespace AK\Cards\Cities;

class C20_Tiwanaku extends \AK\Models\Building
{
  public function __construct($row)
  {
    parent::__construct($row);
    $this->id = 'C20_Tiwanaku';
    $this->type = CITY;
    $this->number = 20;
    $this->name = clienttranslate('Tiwanaku');
    $this->country = clienttranslate('Bolivia');
    $this->text = [
      clienttranslate('Its two most famous monuments are the seven-step pyramid of Akapana and the famous Gate of the Sun.'),
    ];

    $this->victoryPoint = 2;
    $this->initialKnowledge = 2;
    $this->startingSpace = 2;
    $this->activation = IMMEDIATE;
    $this->effect = [clienttranslate('Discard 1 <KNOWLEDGE> from each of the other <CITY> in your Timeline.')];
    $this->implemented = true;
  }

  public function getImmediateEffect()
  {
    $cardIds = [];
    foreach ($this->getPlayer()->getTimeline() as $card) {
      if ($card->getType() == CITY && $card->getKnowledge() > 0) {
        $cardIds[] = $card->getId();
      }
    }

    return empty($cardIds)
      ? null
      : [
        'action' => REMOVE_KNOWLEDGE,
        'args' => [
          'n' => 1,
          'cardIds' => $cardIds,
          'type' => NODE_SEQ,
        ],
      ];
  }
}
