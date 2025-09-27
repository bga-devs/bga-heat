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


  ///////////////////////////////////
  /// LEGACY

  public function actOldReact()
  {
    self::setAjaxMode();
    $symbol = self::getArg('symbol', AT_alphanum_dash, true);
    $arg = self::getArg('arg', AT_alphanum_dash, false, '');
    $this->game->actOldReact($symbol, $arg);
    self::ajaxResponse();
  }
}
