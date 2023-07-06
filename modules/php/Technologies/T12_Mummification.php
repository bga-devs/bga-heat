<?php
namespace AK\Technologies;

class T12_Mummification extends \AK\Models\Technology
{
  public function __construct($row)
  {
    parent::__construct($row);
    $this->id = 'T12_Mummification';
    $this->type = SECRET;
    $this->number = 12;
    $this->level = 1;
    $this->name = clienttranslate('Mummification');

    $this->activation = IMMEDIATE;
    $this->effect = [
      clienttranslate('Discard as many <KNOWLEDGE> from your Timeline as the number of <ARTEFACT> on your board.'),
    ];
    $this->implemented = true;
  }

  public function getImmediateEffect()
  {
    $n = $this->countIcon(\ARTEFACT);

    return $n == 0
      ? null
      : [
        'action' => REMOVE_KNOWLEDGE,
        'args' => [
          'n' => $n,
        ],
      ];
  }
}
