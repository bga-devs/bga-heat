<?php

/**
 *------
 * BGA framework: © Gregory Isabelli <gisabelli@boardgamearena.com> & Emmanuel Colin <ecolin@boardgamearena.com>
 * HeatChampionship implementation : © Timothée Pecatte <tim.pecatte@gmail.com>, Guy Baudin <guy.thoun@gmail.com>
 *
 * This code has been produced on the BGA studio platform for use on https://boardgamearena.com.
 * See http://en.doc.boardgamearena.com/Studio for more information.
 * -----
 *
 * heatchampionship.action.php
 *
 * HeatChampionship main action entry point
 *
 *
 * In this file, you are describing all the methods that can be called from your
 * user interface logic (javascript).
 *
 * If you define a method "myAction" here, then you can call it from your javascript code with:
 * this.ajaxcall( "/heatchampionship/heatchampionship/myAction.html", ...)
 *
 */

class action_heatchampionship extends APP_GameAction
{
  // Constructor: please do not modify
  public function __default()
  {
    if (self::isArg('notifwindow')) {
      $this->view = 'common_notifwindow';
      $this->viewArgs['table'] = self::getArg('table', AT_posint, true);
    } else {
      $this->view = 'heatchampionship_heatchampionship';
      self::trace('Complete reinitialization of board game');
    }
  }

  public function actUploadCircuit()
  {
    self::setAjaxMode();
    $circuit = self::getArg('circuit', AT_json, true);
    $this->game->actUploadCircuit($circuit);
    self::ajaxResponse();
  }

  public function actChooseUpgrade()
  {
    self::setAjaxMode();
    $cardId = self::getArg('cardId', AT_int, true);
    $this->game->actChooseUpgrade($cardId);
    self::ajaxResponse();
  }

  public function actSnakeDiscard()
  {
    self::setAjaxMode();
    $cardId = self::getArg('cardId', AT_int, true);
    $this->game->actSnakeDiscard($cardId);
    self::ajaxResponse();
  }

  public function actSwapUpgrade()
  {
    self::setAjaxMode();
    $marketCardId = self::getArg('marketCardId', AT_int, true);
    $ownedCardId = self::getArg('ownedCardId', AT_int, true);
    $this->game->actSwapUpgrade($marketCardId, $ownedCardId);
    self::ajaxResponse();
  }

  public function actPassSwapUpgrade()
  {
    self::setAjaxMode();
    $this->game->actPassSwapUpgrade();
    self::ajaxResponse();
  }

  public function actPlan()
  {
    self::setAjaxMode();
    $cardIds = self::getArg('cardIds', AT_json, true);
    $this->validateJSonAlphaNum($cardIds, 'cardIds');
    $this->game->actPlan($cardIds);
    self::ajaxResponse();
  }

  public function actCancelSelection()
  {
    self::setAjaxMode();
    $this->game->actCancelPlan();
    self::ajaxResponse();
  }

  public function actChooseSpeed()
  {
    self::setAjaxMode();
    $speed = self::getArg('speed', AT_posint, true);
    $this->game->actChooseSpeed($speed);
    self::ajaxResponse();
  }

  public function actPassReact()
  {
    self::setAjaxMode();
    $this->game->actPassReact();
    self::ajaxResponse();
  }

  public function actReact()
  {
    self::setAjaxMode();
    $symbol = self::getArg('symbol', AT_alphanum_dash, true);
    $arg = self::getArg('arg', AT_alphanum_dash, false, '');
    $this->game->actReact($symbol, $arg);
    self::ajaxResponse();
  }

  public function actCryCauseNotEnoughHeatToPay()
  {
    self::setAjaxMode();
    $this->game->actCryCauseNotEnoughHeatToPay();
    self::ajaxResponse();
  }

  public function actPayHeats()
  {
    self::setAjaxMode();
    $cardIds = self::getArg('cardIds', AT_json, true);
    $this->validateJSonAlphaNum($cardIds, 'cardIds');
    $this->game->actPayHeats($cardIds);
    self::ajaxResponse();
  }

  public function actSalvage()
  {
    self::setAjaxMode();
    $cardIds = self::getArg('cardIds', AT_json, true);
    $this->validateJSonAlphaNum($cardIds, 'cardIds');
    $this->game->actSalvage($cardIds);
    self::ajaxResponse();
  }

  public function actSuperCool()
  {
    self::setAjaxMode();
    $n = self::getArg('n', AT_posint, true);
    $this->game->actSuperCool($n);
    self::ajaxResponse();
  }

  public function actRefresh()
  {
    self::setAjaxMode();
    $cardId = self::getArg('cardId', AT_posint, true);
    $this->game->actRefresh($cardId);
    self::ajaxResponse();
  }

  public function actDiscard()
  {
    self::setAjaxMode();
    $cardIds = self::getArg('cardIds', AT_json, true);
    $this->validateJSonAlphaNum($cardIds, 'cardIds');
    $this->game->actDiscard($cardIds);
    self::ajaxResponse();
  }

  public function actSlipstream()
  {
    self::setAjaxMode();
    $speed = self::getArg('speed', AT_posint, false);
    $this->game->actSlipstream($speed);
    self::ajaxResponse();
  }

  public function actConfirmResults()
  {
    self::setAjaxMode();
    $this->game->actConfirmResults();
    self::ajaxResponse();
  }

  public function actQuitGame()
  {
    self::setAjaxMode();
    $this->game->actQuitGame();
    self::ajaxResponse();
  }

  public function actGiveUp()
  {
    self::setAjaxMode();
    $this->game->actGiveUp();
    self::ajaxResponse();
  }

  //////////////////
  ///// UTILS  /////
  //////////////////
  public function actChangePref()
  {
    self::setAjaxMode();
    $pref = self::getArg('pref', AT_posint, false);
    $value = self::getArg('value', AT_posint, false);
    $this->game->actChangePreference($pref, $value);
    self::ajaxResponse();
  }

  public function validateJSonAlphaNum($value, $argName = 'unknown')
  {
    if (is_array($value)) {
      foreach ($value as $key => $v) {
        $this->validateJSonAlphaNum($key, $argName);
        $this->validateJSonAlphaNum($v, $argName);
      }
      return true;
    }
    if (is_int($value)) {
      return true;
    }
    $bValid = preg_match('/^[_0-9a-zA-Z- ]*$/', $value) === 1;
    if (!$bValid) {
      throw new feException("Bad value for: $argName", true, true, FEX_bad_input_argument);
    }
    return true;
  }

  //////////////////
  ///// DEBUG  /////
  //////////////////
  public function loadBugSQL()
  {
    self::setAjaxMode();
    $reportId = (int) self::getArg('report_id', AT_int, true);
    $this->game->loadBugSQL($reportId);
    self::ajaxResponse();
  }
}
