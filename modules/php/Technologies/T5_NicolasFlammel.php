<?php
namespace AK\Technologies;

class T5_NicolasFlammel extends \AK\Models\Technology
{
  public function __construct($row)
  {
    parent::__construct($row);
    $this->id = 'T5_NicolasFlammel';
    $this->type = ANCIENT;
    $this->number = 5;
    $this->level = 1;
    $this->name = clienttranslate('Nicolas Flammel');

    $this->activation = IMMEDIATE;
    $this->effect = [clienttranslate('Discard 1 <LOST_KNOWLEDGE> from your board and draw 1 card.')];
    $this->implemented = true;
  }

  public function getImmediateEffect()
  {
    return [
      'type' => \NODE_SEQ,
      'childs' => [
        [
          'action' => \DISCARD_LOST_KNOWLEDGE,
          'args' => ['n' => 1],
        ],
        [
          'action' => DRAW,
          'args' => ['n' => 3],
        ],
      ],
    ];
  }
}
