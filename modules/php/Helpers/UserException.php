<?php

namespace Bga\Games\Heat\Helpers;

class UserException extends \Bga\GameFramework\UserException
{
  public function __construct($str)
  {
    parent::__construct($str);
  }
}
