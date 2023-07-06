<?php
namespace HEAT\Actions;
use HEAT\Managers\Meeples;
use HEAT\Managers\Players;
use HEAT\Managers\Technologies;
use HEAT\Core\Notifications;
use HEAT\Core\Stats;
use HEAT\Helpers\Utils;

class Learn extends \HEAT\Models\Action
{
  public function getState()
  {
    return ST_LEARN;
  }

  public function getDescription()
  {
    return clienttranslate('Learn');
  }

  public function getPlayableTechs($player, $isDoable = false)
  {
    $pool = Technologies::getPool();
    $techs = [];
    $check = $this->getCtxArg('checkRequirements') ?? true;
    foreach ($pool as $tId => $tech) {
      if ($check && !$tech->canBePlayed($player)) {
        continue;
      }

      if ($isDoable) {
        return true;
      }
      $techs[] = $tId;
    }

    return $isDoable ? false : $techs;
  }

  public function argsLearn()
  {
    $player = Players::getActive();
    return [
      'techs' => $this->getPlayableTechs($player),
    ];
  }

  public function actLearn($techId)
  {
    // Sanity checks
    self::checkAction('actLearn');
    $player = Players::getActive();
    $techs = $this->argsLearn()['techs'];
    if (!in_array($techId, $techs)) {
      throw new \BgaVisibleSystemException('Invalid tech to learn. Should not happen');
    }

    // Move Tech
    $tech = Technologies::getSingle($techId);
    $tech->setLocation('inPlay');
    $tech->setPId($player->getId());
    Notifications::learnTech($player, $tech);

    // Check immediate effect
    // if ($tech->getActivation() == \IMMEDIATE) {
    //   die('TODO: immediate effect of created card');
    // }

    // Check listener
    // TODO

    $this->resolveAction(['techId' => $techId]);
  }
}
