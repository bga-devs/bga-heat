<?php
/**
 *------
 * BGA framework: © Gregory Isabelli <gisabelli@boardgamearena.com> & Emmanuel Colin <ecolin@boardgamearena.com>
 * Heat implementation : © Timothée Pecatte <tim.pecatte@gmail.com>, Guy Baudin <guy.thoun@gmail.com>
 *
 * This code has been produced on the BGA studio platform for use on https://boardgamearena.com.
 * See http://en.doc.boardgamearena.com/Studio for more information.
 * -----
 *
 * heat.action.php
 *
 * Heat main action entry point
 *
 *
 * In this file, you are describing all the methods that can be called from your
 * user interface logic (javascript).
 *
 * If you define a method "myAction" here, then you can call it from your javascript code with:
 * this.ajaxcall( "/heat/heat/myAction.html", ...)
 *
 */

class action_heat extends APP_GameAction
{
  // Constructor: please do not modify
  public function __default()
  {
    if (self::isArg('notifwindow')) {
      $this->view = 'common_notifwindow';
      $this->viewArgs['table'] = self::getArg('table', AT_posint, true);
    } else {
      $this->view = 'heat_heat';
      self::trace('Complete reinitialization of board game');
    }
  }

  public function actPlan()
  {
    self::setAjaxMode();
    $cardIds = self::getArg('cardIds', AT_json, true);
    $this->validateJSonAlphaNum($cardIds, 'cardIds');
    $this->game->actPlan($cardIds);
    self::ajaxResponse();
  }

  public function actCancelPlan()
  {
    self::setAjaxMode();
    $this->game->actCancelPlan();
    self::ajaxResponse();
  }

  public function actChooseSpeed()
  {
    self::setAjaxMode();
    $speed = self::getArg('speed', AT_posint, false);
    $this->game->actChooseSpeed($speed);
    self::ajaxResponse();
  }

  public function actPassReact()
  {
    self::setAjaxMode();
    $this->game->actPassReact();
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
