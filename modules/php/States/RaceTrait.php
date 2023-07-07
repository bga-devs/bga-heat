<?php
namespace HEAT\States;
use HEAT\Core\Globals;
use HEAT\Core\Notifications;
use HEAT\Core\Stats;
use HEAT\Helpers\Log;
use HEAT\Managers\Players;
use HEAT\Managers\Cards;

trait RaceTrait
{
  function stStartRace()
  {
    $this->gamestate->setAllPlayersMultiactive();
    $this->gamestate->nextState('planification');
  }

  function argsPlanification()
  {
    return [];
  }
}
