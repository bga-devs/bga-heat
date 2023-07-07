<?php
namespace HEAT\States;
use HEAT\Core\Globals;
use HEAT\Core\Notifications;
use HEAT\Core\Engine;
use HEAT\Core\Stats;
use HEAT\Core\Preferences;
use HEAT\Managers\Players;
use HEAT\Managers\Cards;
use HEAT\Managers\Constructors;
use HEAT\Managers\Actions;
use HEAT\Helpers\Utils;
use HEAT\Helpers\Log;

trait SetupTrait
{
  /*
   * setupNewGame:
   */
  protected function setupNewGame($players, $options = [])
  {
    Globals::setupNewGame($players, $options);
    Players::setupNewGame($players, $options);
    // Preferences::setupNewGame($players, $this->player_preferences);
    Cards::setupNewGame($players, $options);

    // Setup constructors
    $gameInfos = self::getGameinfos();
    $colors = $gameInfos['player_colors'];

    $i = 1;
    $constructors = [];
    foreach (Players::getAll() as $pId => $player) {
      $cId = array_search($player->getColor(), $colors);
      $constructors[] = $cId;
      Constructors::assignConstructor($player, $cId);
      $i++;
    }
    $this->reloadPlayersBasicInfos();

    // Handle Legends
    $nAutoma = 0;
    for (; $i <= Constructors::count(); $i++) {
      $cId = min(array_diff(CONSTRUCTORS, $constructors));
      $fakePId = ($nAutoma + 1) * -5;
      $company = Constructors::assignConstructorAutoma($fakePId, $cId);
      $nAutoma++;
    }

    $this->setGameStateInitialValue('logging', true);
    $this->activeNextPlayer();
  }

  public function stSetupBranch()
  {
    $this->gamestate->nextState('done');
    // if (Globals::isStartingHands()) {
    // } else {
    //   Cards::initialDraw();
    //   $this->gamestate->setAllPlayersMultiactive();
    //   $this->gamestate->nextState('selection');
    // }
  }
}
