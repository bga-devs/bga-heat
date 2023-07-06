<?php
namespace AK\Technologies;

class T11_TheNumberPi extends \AK\Models\Technology
{
  public function __construct($row)
  {
    parent::__construct($row);
    $this->id = 'T11_TheNumberPi';
    $this->type = SECRET;
    $this->number = 11;
    $this->level = 1;
    $this->name = clienttranslate('The Number Pi');

    $this->activation = IMMEDIATE;
    $this->effect = [clienttranslate('Discard 1 <KNOWLEDGE> from each <CITY> in your Timeline.')];
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
