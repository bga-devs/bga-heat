<?php
namespace HEAT\States;
use HEAT\Core\Globals;
use HEAT\Core\Notifications;
use HEAT\Core\Stats;
use HEAT\Helpers\Log;
use HEAT\Managers\Constructors;
use HEAT\Managers\Cards;

trait RaceTrait
{
  function getCircuit()
  {
    if (!isset($this->circuit)) {
      $names = [
        'usa' => 'USA',
        'italia' => 'Italia',
        'gb' => 'GB',
        'france' => 'France',
      ];
      $className = '\\HEAT\\Circuits\\' . $names[Globals::getCircuit()];
      $this->circuit = new $className();
    }

    return $this->circuit;
  }

  function stStartRace()
  {
    $circuit = $this->getCircuit();
    $cells = $circuit->getStartingCells();
    foreach (Constructors::getTurnOrder() as $i => $cId) {
      $constructor = Constructors::get($cId);
      $constructor->setCarCell($cells[$i]);
      $constructor->setTurn(-1);
      $constructor->setGear(1);
    }

    $this->gamestate->setAllPlayersMultiactive();
    $this->gamestate->nextState('planification');
  }

  function argsPlanification()
  {
    return [];
  }
}
