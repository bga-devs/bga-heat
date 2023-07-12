<?php
namespace HEAT\Models;

class Circuit
{
  protected $corners = [];
  protected $startingCells = [];
  protected $cells = [];

  public function getStartingCells()
  {
    return $this->startingCells;
  }
}
