<?php

namespace Bga\Games\Heat\Helpers;

abstract class Utils
{
  public static function filter(&$data, $filter)
  {
    $data = array_values(array_filter($data, $filter));
  }

  public static function rand($array, $n = 1)
  {
    $keys = array_rand($array, $n);
    if ($n == 1) {
      $keys = [$keys];
    }
    $entries = [];
    foreach ($keys as $key) {
      $entries[] = $array[$key];
    }
    shuffle($entries);
    return $entries;
  }

  static function search($array, $test)
  {
    $found = false;
    $iterator = new \ArrayIterator($array);

    while ($found === false && $iterator->valid()) {
      if ($test($iterator->current())) {
        $found = $iterator->key();
      }
      $iterator->next();
    }

    return $found;
  }

  public static function die($args = null)
  {
    throw new \BgaVisibleSystemException(json_encode($args));
  }
}

function array_uunique($array, $comparator)
{
  $unique_array = [];
  do {
    $element = array_shift($array);
    $unique_array[] = $element;

    $array = array_udiff($array, [$element], $comparator);
  } while (count($array) > 0);

  return $unique_array;
}
