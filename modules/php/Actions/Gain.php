<?php
namespace AK\Actions;
use AK\Managers\Meeples;
use AK\Managers\Players;
use AK\Core\Notifications;
use AK\Core\Stats;
use AK\Helpers\Utils;

class Gain extends \AK\Models\Action
{
  public function getState()
  {
    return ST_GAIN;
  }

  public function getDescription()
  {
    $player = $this->getPlayer();
    $gain = $this->getGain();
    $desc = Utils::resourcesToStr([$gain[0] => $gain[1]], true);

    if ($player->getId() == Players::getActiveId()) {
      return [
        'log' => clienttranslate('Gain ${resources_desc}'),
        'args' => [
          'resources_desc' => $desc,
        ],
      ];
    }
    // The reward is for someone else
    else {
      return [
        'log' => clienttranslate('Let ${player_name} gain ${resources_desc}'),
        'args' => [
          'player_name' => $player->getName(),
          'resources_desc' => $desc,
        ],
      ];
    }
  }

  public function isAutomatic($player = null)
  {
    return true;
  }

  public function isIndependent($player = null)
  {
    list($resource, $amount) = $this->getGain();
    return in_array($resource, [MONEY, XTOKEN]);
  }

  public function getPlayer()
  {
    $args = $this->getCtxArgs();
    $pId = $args['pId'] ?? Players::getActiveId();
    return Players::get($pId);
  }

  public function getGain()
  {
    $args = $this->getCtxArgs();
    foreach ($args as $resource => $amount) {
      if (in_array($resource, ['cardId', 'pId', 'sourceId', 'source', 'income'])) {
        continue;
      }

      if (!in_array($resource, RESOURCES)) {
        die('GAIN: unrecognized resource' . $resource);
      }

      // // Dynamic gain
      // if (in_array($amount, ALL_PREREQUISITES)) {
      //   $player = $this->getPlayer();
      //   $amount = $player->countCardIcon($amount);
      // }

      return [$resource, $amount];
    }
    die('GAIN: resource not found');
  }

  public function stGain()
  {
    $player = $this->getPlayer();
    $args = $this->getCtxArgs();
    $source = $this->ctx->getSource() ?? null;
    $sourceId = $this->ctx->getSourceId() ?? null;
    // if (is_null($source) && !is_null($sourceId)) {
    //   $source = ZooCards::getSingle($sourceId);
    // }

    // Increase resource and notify
    list($resource, $amount) = $this->getGain();
    // Get the previous amount
    $getMethod = $resource == 'xtoken' ? 'getXToken' : 'get' . ucfirst($resource);
    $previousAmount = $player->$getMethod();

    $method = 'inc' . ucfirst($resource);
    $bonuses = $player->$method($amount, false);
    unset($args['pId']);
    unset($args['income']);

    // Get the new amount and update the real bonus
    $newAmount = $player->$getMethod();
    $args[$resource] = $newAmount - $previousAmount;

    // Notify
    Notifications::gain($player, $args, $source);

    $this->checkAfterListeners($player, ['gain' => $args]);
    $this->resolveAction();
  }
}
