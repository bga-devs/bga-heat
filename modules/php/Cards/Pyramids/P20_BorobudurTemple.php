<?php
namespace AK\Cards\Pyramids;

class P20_BorobudurTemple extends \AK\Models\Building
{
  public function __construct($row)
  {
    parent::__construct($row);
    $this->id = 'P20_BorobudurTemple';
    $this->type = PYRAMID;
    $this->number = 20;
    $this->name = clienttranslate('Borobudur Temple');
    $this->country = clienttranslate('Indonesia');
    $this->text = [clienttranslate('The temple is lined with 72 stupas which have openwork stone bells housing bodhisattvas.')];

    $this->victoryPoint = 0;
    $this->initialKnowledge = 4;
    $this->startingSpace = 3;
    $this->lockedSpace = true;
    $this->activation = ANYTIME;
    $this->effect = [
      clienttranslate('Each time you CREATE 1 <ARTEFACT> , you may LEARN 1 Technology if you fulfill its requirements.'),
    ];
  }
}
