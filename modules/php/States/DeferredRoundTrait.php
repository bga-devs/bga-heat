<?php

namespace HEAT\States;

use HEAT\Core\Globals;
use HEAT\Core\Notifications;
use HEAT\Core\Stats;
use HEAT\Helpers\Log;
use HEAT\Helpers\Utils;
use HEAT\Helpers\UserException;
use HEAT\Managers\Constructors;
use HEAT\Managers\Players;
use HEAT\Managers\Cards;
use HEAT\Models\Constructor;

trait DeferredRoundTrait
{
  function shouldUsedDeferredDB()
  {
    if (!Globals::isDeferredRoundsActive()) {
      return false;
    }

    try {
      $pId = Players::getCurrentId();
      $currentConstructor = Constructors::getOfPlayer($pId);
      if (is_null($currentConstructor)) {
        return true;
      }
      if ($currentConstructor->isFinished()) {
        return false;
      }

      $activeConstructor = Constructors::getActive();
      // Someone before in turn order is active => hide
      if ($activeConstructor->getNo() < $currentConstructor->getNo()) {
        return true;
      }
      // Someone after in turn order is active => show
      else if ($activeConstructor->getNo() > $currentConstructor->getNo()) {
        return false;
      }

      // Current constructor is active => check whether some cards were played or not
      if ($currentConstructor->getId() == $activeConstructor->getId()) {
        $planificationDone = Globals::getPlanificationRevealed();
        // FALLBACK CODE, REMOVE A BIT LATTER
        if (empty($planificationDone)) {
          return !is_null($this->gamestate) && $this->gamestate->state_id() == ST_PLANIFICATION;
        } else {
          return !($planificationDone[$currentConstructor->getId()] ?? false);
        }
      }
    } catch (\Exception $e) {
      return true;
    }

    return true;
  }

  function stInitDeferredRound()
  {
    Globals::setDeferredRoundsActive(true);
    Globals::setPendingNotifications([]);
    Globals::checkDeferredIfNeeded();

    // Flush notif and store current packet it
    $this->sendNotifications();
    // $packetId = self::getUniqueValueFromDB("SELECT MAX( gamelog_packet_id) FROM gamelog");
    // Globals::setLastPacketId($packetId);

    self::DbQuery("DELETE FROM `cards2`");
    self::DbQuery("DELETE FROM `constructors2`");
    self::DbQuery("DELETE FROM `global_variables2`");
    self::DbQuery("INSERT INTO `cards2` SELECT * FROM `cards`");
    self::DbQuery("INSERT INTO `constructors2` SELECT * FROM `constructors`");
    self::DbQuery("INSERT INTO `global_variables2` SELECT * FROM `global_variables`");

    // Go in turn order to take deferred round
    // => keep the name "reveal" so that it works out of the box with legends
    $this->initCustomTurnOrder('reveal', null, 'stDeferredRound', 'stEndRound');
  }

  function stDeferredRound()
  {
    $constructor = Constructors::getActive();
    if ($constructor->isAI()) {
      $this->stLegendTurn();
      return;
    }
    // Might happens if player give up
    if ($constructor->isFinished()) {
      $this->nextPlayerCustomOrder('reveal');
      return;
    }

    $this->gamestate->setPlayersMultiactive([$constructor->getPId()], '', true);
    $this->gamestate->jumpToState(ST_PLANIFICATION);
  }

  function stEndOfDeferredPlanification()
  {
    $constructor = Constructors::getActive();
    $planificationDone = Globals::getPlanificationRevealed();
    $planificationDone[$constructor->getId()] = true;
    Globals::setPlanificationRevealed($planificationDone);
    Globals::checkDeferredIfNeeded(false);

    // Send missing notif, possible faster ??
    $pId = $constructor->getPId();
    $pendingNotifs = Globals::getPendingNotifications();
    foreach ($pendingNotifs as $notif) {
      Notifications::notify($pId, $notif['name'], $notif['msg'], $notif['data']);
    }

    $this->stReveal();
  }
}
