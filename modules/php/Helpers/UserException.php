<?php

namespace Bga\Games\Heat\Helpers;

use Bga\Games\Heat\Game;

class UserException extends \BgaUserException
{
  public function __construct($str)
  {
    parent::__construct(Game::get()->translate($str));
  }
}
