<?php
namespace AK\Cards\Artefacts;

class A31_SaqqaraVases extends \AK\Models\Artefact
{
  public function __construct($row)
  {
    parent::__construct($row);
    $this->id = 'A31_SaqqaraVases';
    $this->type = ARTEFACT;
    $this->number = 31;
    $this->name = clienttranslate('Saqqara Vases');
    $this->country = clienttranslate('Egypt');
    $this->text = [
      clienttranslate(
        'Thousands of vases and containers were unearthed under the pyramid of Saqqara. Made of very hard stone, some are only a few centimeters high.'
      ),
    ];
    $this->activation = TIMELINE;
    $this->effect = [
      clienttranslate('You may discard this card from your board. If you do, move one monument to another available space.'),
    ];
  }
}
