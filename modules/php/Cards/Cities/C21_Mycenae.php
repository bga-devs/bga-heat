<?php
namespace AK\Cards\Cities;

class C21_Mycenae extends \AK\Models\Building
{
  public function __construct($row)
  {
    parent::__construct($row);
    $this->id = 'C21_Mycenae';
    $this->type = CITY;
    $this->number = 21;
    $this->name = clienttranslate('Mycenae');
    $this->country = clienttranslate('Greece');
    $this->text = [
      clienttranslate(
        'Mycenae is said to have been founded by Perseus after the accidental homicide of Acrisios, king of Argos.'
      ),
    ];

    $this->victoryPoint = 0;
    $this->initialKnowledge = 4;
    $this->startingSpace = 6;
    $this->lockedSpace = true;
    $this->discard = 1;
    $this->activation = DECLINE;
    $this->effect = [clienttranslate('Discard a total of 7 <KNOWLEDGE> or less from one or several of your other monuments.')];
    $this->implemented = true;
  }

  public function getDeclineEffect()
  {
    return [
      'action' => \REMOVE_KNOWLEDGE,
      'args' => ['n' => 7],
    ];
  }
}
