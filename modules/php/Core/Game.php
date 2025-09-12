<?php

namespace HEAT\Core;

use Heat;

/*
 * Game: a wrapper over table object to allow more generic modules
 */

class Game
{
  public static function get(): Heat
  {
    return Heat::get();
  }
}
