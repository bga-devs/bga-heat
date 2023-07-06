<?php
namespace AK\Models;
use AK\Core\Engine;
use AK\Core\Game;
use AK\Core\Globals;
use AK\Core\Notifications;
use AK\Managers\ZooCards;
use AK\Managers\Players;
use AK\Helpers\Log;
use AK\Helpers\FlowConvertor;

/*
 * Action: base class to handle atomic action
 */
class Action
{
  protected $ctx = null; // Contain ctx information : current node of flow tree
  protected $description = '';
  public function __construct($ctx)
  {
    $this->ctx = $ctx;
  }

  public function isDoable($player)
  {
    return true;
  }

  public function isOptional()
  {
    return false;
  }

  public function isIndependent($player = null)
  {
    return false;
  }

  public function isAutomatic($player = null)
  {
    return false;
  }

  public function isIrreversible($player = null)
  {
    return false;
  }

  public function getDescription()
  {
    return $this->description;
  }

  public function getPlayer()
  {
    $pId = $this->ctx->getPId() ?? Players::getActiveId();
    return Players::get($pId);
  }

  public function getState()
  {
    return null;
  }

  /**
   * Syntaxic sugar
   */
  public function getCtxArgs()
  {
    if ($this->ctx == null) {
      return [];
    } elseif (is_array($this->ctx)) {
      return $this->ctx;
    } else {
      return $this->ctx->getArgs() ?? [];
    }
  }
  public function getCtxArg($v)
  {
    return $this->getCtxArgs()[$v] ?? null;
  }
  // Useful for the 5 actions corresponding to action cards
  public function getStrength()
  {
    return $this->getCtxArg('strength');
  }
  public function getLevel()
  {
    return $this->getCtxArg('lvl');
  }
  public function isUpgraded()
  {
    return $this->getLevel() == 2;
  }

  // Useful for the animals effects
  public function getN()
  {
    return $this->getCtxArg('n');
  }

  public function resolveAction($args = [], $checkpoint = false)
  {
    $player = Players::getActive();
    $args['automatic'] = $this->isAutomatic($player);
    Engine::resolveAction($args, $checkpoint, $this->ctx);
    Engine::proceed();
  }

  /**
   * Insert flow as child of current node
   */
  public function insertAsChild($flow)
  {
    Engine::insertAsChild($flow, $this->ctx);
  }

  /**
   * Insert childs as parallel node childs
   */
  public function pushParallelChild($node)
  {
    $this->pushParallelChilds([$node]);
  }

  public function pushParallelChilds($childs)
  {
    Engine::insertOrUpdateParallelChilds($childs, $this->ctx);
  }

  /**
   * Update the args of current node
   * @param array $args : the keys/values that needs to get updated
   * Warning: resolve action must be call on the side
   */
  public function duplicateAction($args = [], $checkpoint = false)
  {
    // Duplicate the node and update the args
    $node = $this->ctx->toArray();
    $node['type'] = \NODE_LEAF;
    $node['childs'] = [];
    $node['args'] = array_merge($node['args'], $args);
    $node['duplicate'] = true;
    unset($node['mandatory']); // Weird edge case
    $node = Engine::buildTree($node);
    // Insert it as a brother of current node and proceed
    $this->ctx->insertAsBrother($node);
    Engine::save();

    if ($checkpoint) {
      Engine::checkpoint();
    }
    // Engine::proceed();
  }

  public static function checkAction($action, $byPassActiveCheck = false)
  {
    if ($byPassActiveCheck) {
      Game::get()->gamestate->checkPossibleAction($action);
    } else {
      Game::get()->checkAction($action);
      $stepId = Log::step();
      Notifications::newUndoableStep(Players::getCurrent(), $stepId);
    }
  }

  public function getClassName()
  {
    $classname = get_class($this);
    if ($pos = strrpos($classname, '\\')) {
      return substr($classname, $pos + 1);
    }
    return $classname;
  }

  // protected function checkListeners($method, $player, $args = [])
  // {
  //   $event = array_merge(
  //     [
  //       'pId' => $player->getId(),
  //       'type' => 'action',
  //       'action' => $this->getClassName(),
  //       'method' => $method,
  //     ],
  //     $args
  //   );

  //   $reaction = ZooCards::getReaction($event);
  //   $this->pushParallelChilds($reaction);
  // }

  // public function checkAfterListeners($player, $args = [], $duringActionListener = true)
  // {
  //   if ($duringActionListener) {
  //     $this->checkListeners($this->getClassName(), $player, $args);
  //   }
  //   $this->checkListeners('ImmediatelyAfter' . $this->getClassName(), $player, $args);
  //   $this->checkListeners('After' . $this->getClassName(), $player, $args);
  // }

  // public function checkModifiers($method, &$data, $name, $player, $args = [])
  // {
  //   $args[$name] = $data;
  //   if (!isset($args['actionCardId'])) {
  //     $args['actionCardId'] = $this->ctx != null ? $this->ctx->getCardId() : null;
  //   }
  //   ZooCards::applyEffects($player, $method, $args);
  //   $data = $args[$name];
  // }

  // public function checkCostModifiers(&$costs, $player, $args = [])
  // {
  //   $this->checkModifiers('computeCosts' . $this->getClassName(), $costs, 'costs', $player, $args);
  // }

  // public function checkArgsModifiers(&$actionArgs, $player, $args = [])
  // {
  //   $this->checkModifiers('computeArgs' . $this->getClassName(), $actionArgs, 'actionArgs', $player, $args);
  // }
}
