<?php
namespace AK\Technologies;

class T20_RongorongoGlyphs extends \AK\Models\Technology
{
  public function __construct($row)
  {
    parent::__construct($row);
    $this->id = 'T20_RongorongoGlyphs';
    $this->type = WRITING;
    $this->number = 20;
    $this->level = 1;
    $this->name = clienttranslate('Rongorongo Glyphs');

    $this->activation = IMMEDIATE;
    $this->effect = [clienttranslate('Discard 1 <KNOWLEDGE> from each <MEGALITH> in your Timeline.')];
    $this->implemented = true;
  }

  public function getImmediateEffect()
  {
    $cardIds = $this->getPlayer()
      ->getTimeline(MEGALITH)
      ->getIds();

    return [
      'action' => REMOVE_KNOWLEDGE,
      'args' => [
        'n' => 1,
        'cardIds' => $cardIds,
        'type' => NODE_SEQ,
      ],
    ];
  }
}
