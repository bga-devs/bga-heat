<?php
namespace HEAT\Core;
use Heat;
use HeatChampionship;

/*
 * Game: a wrapper over table object to allow more generic modules
 */
class Game
{
  public static function get()
  {
    return HeatChampionship::get();
  }
}
