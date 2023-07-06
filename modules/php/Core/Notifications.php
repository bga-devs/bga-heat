<?php
namespace HEAT\Core;
use HEAT\Managers\Players;
use HEAT\Helpers\Utils;
use HEAT\Helpers\Collection;
use HEAT\Core\Globals;
use HEAT\Managers\Effects;

class Notifications
{
  /*************************
   **** GENERIC METHODS ****
   *************************/
  protected static function notifyAll($name, $msg, $data)
  {
    self::updateArgs($data);
    Game::get()->notifyAllPlayers($name, $msg, $data);
  }

  protected static function notify($player, $name, $msg, $data)
  {
    $pId = is_int($player) ? $player : $player->getId();
    self::updateArgs($data);
    Game::get()->notifyPlayer($pId, $name, $msg, $data);
  }

  public static function message($txt, $args = [])
  {
    self::notifyAll('message', $txt, $args);
  }

  public static function messageTo($player, $txt, $args = [])
  {
    $pId = is_int($player) ? $player : $player->getId();
    self::notify($pId, 'message', $txt, $args);
  }

  public static function newUndoableStep($player, $stepId)
  {
    self::notify($player, 'newUndoableStep', clienttranslate('Undo here'), [
      'stepId' => $stepId,
      'preserve' => ['stepId'],
    ]);
  }

  public static function clearTurn($player, $notifIds)
  {
    self::notifyAll('clearTurn', clienttranslate('${player_name} restarts their turn'), [
      'player' => $player,
      'notifIds' => $notifIds,
    ]);
  }

  public static function refreshUI($datas)
  {
    // // Keep only the thing that matters
    $fDatas = [
      'players' => $datas['players'],
      'cards' => \HEAT\Managers\Cards::getUiData(),
      'techs' => \HEAT\Managers\Technologies::getUiData(),
    ];

    self::notifyAll('refreshUI', '', [
      'datas' => $fDatas,
    ]);
  }

  public static function refreshHand($player, $hand)
  {
    self::notify($player, 'refreshHand', '', [
      'player' => $player,
      'hand' => $hand,
    ]);
  }

  public static function chooseAction($player, $actionName)
  {
    $actions = [
      'archive' => \clienttranslate('Archive'),
      'create' => \clienttranslate('Create'),
      'learn' => \clienttranslate('Learn'),
      'search' => \clienttranslate('Search'),
      'excavate' => \clienttranslate('Excavate'),
    ];

    self::notifyAll('chooseAction', \clienttranslate('${player_name} chooses the action: ${action_name}'), [
      'player' => $player,
      'i18n' => ['action_name'],
      'action_name' => $actions[$actionName],
    ]);
  }

  public static function discardLostKnowledge($player, $knowledge)
  {
    self::notifyAll(
      'discardLostKnowledge',
      clienttranslate('${player_name} discard ${n} <LOST_KNOWLEDGE> and now has ${m} left'),
      [
        'player' => $player,
        'n' => $knowledge,
        'm' => $player->getLostKnowledge(),
      ]
    );
  }

  //////////////////////////////
  //  _____         _
  // |_   _|__  ___| |__  ___
  //   | |/ _ \/ __| '_ \/ __|
  //   | |  __/ (__| | | \__ \
  //   |_|\___|\___|_| |_|___/
  //////////////////////////////

  public static function fillPool($techs)
  {
    self::notifyAll('fillPool', clienttranslate('Technology tiles are filled up with ${card_names}'), [
      'cards' => $techs,
    ]);
  }

  public static function learnTech($player, $tech)
  {
    self::notifyAll('createCard', clienttranslate('${player_name} learns ${card_name}'), [
      'player' => $player,
      'card' => $tech,
    ]);
  }

  ///////////////////////////
  //    ____              _
  //   / ___|__ _ _ __ __| |___
  //  | |   / _` | '__/ _` / __|
  //  | |__| (_| | | | (_| \__ \
  //   \____\__,_|_|  \__,_|___/
  ///////////////////////////

  public static function updateInitialSelection($player, $args)
  {
    self::notify($player, 'updateInitialSelection', '', [
      'args' => ['_private' => $args['_private'][$player->getId()]],
    ]);
  }

  public static function drawCards($player, $cards, $privateMsg = null, $publicMsg = null, $args = [])
  {
    self::notifyAll(
      'drawCards',
      $publicMsg ?? clienttranslate('${player_name} draws ${n} card(s) from the deck'),
      $args + [
        'player' => $player,
        'n' => count($cards),
      ]
    );
    self::notify(
      $player,
      'pDrawCards',
      $privateMsg ?? clienttranslate('You draw ${card_names} from the deck'),
      $args + [
        'player' => $player,
        'cards' => is_array($cards) ? $cards : $cards->toArray(),
      ]
    );
  }

  public static function discardCards($player, $cards, $privateMsg = null, $publicMsg = null, $args = [], $privateArgs = null)
  {
    self::notifyAll(
      'discardCards',
      $publicMsg ?? clienttranslate('${player_name} discards ${n} card(s)'),
      $args + [
        'player' => $player,
        'n' => count($cards),
      ]
    );
    self::notify(
      $player,
      'pDiscardCards',
      $privateMsg ?? clienttranslate('You discard ${card_names}'),
      ($privateArgs ?? $args) + [
        'player' => $player,
        'cards' => $cards->toArray(),
      ]
    );
  }

  public static function createCard($player, $card, $sourceId)
  {
    if (is_null($sourceId)) {
      self::notifyAll('createCard', clienttranslate('${player_name} creates ${card_name}'), [
        'player' => $player,
        'card' => $card,
      ]);
    } else {
      self::notifyAll('createCard', clienttranslate('${player_name} creates ${card_name} (${card2_name})'), [
        'player' => $player,
        'card' => $card,
        'card2' => Effects::get($sourceId),
      ]);
    }
  }

  public static function rotateCards($player, $cards)
  {
    self::notifyAll($player, 'rotateCards', clienttranslate('${player_name} rotates ${card_names} in their past'), [
      'player' => $player,
      'cards' => is_array($cards) ? $cards : $cards->toArray(),
    ]);
  }

  public static function declineSlideLeft($player, $n)
  {
    self::notifyAll(
      'declineSlideLeft',
      \clienttranslate('${player_name} slides their ${n} card(s) on their timeline one space to the left'),
      [
        'player' => $player,
        'n' => $n,
      ]
    );
  }

  public static function declineCard($player, $card, $knowledge)
  {
    $msg =
      $knowledge > 0
        ? clienttranslate('${player_name} moves ${card_name} to the past and gets ${n} <LOST_KNOWLEDGE> as a result')
        : clienttranslate('${player_name} moves ${card_name} to the past');
    self::notifyAll('declineCard', $msg, [
      'player' => $player,
      'card' => $card,
      'n' => $knowledge,
    ]);
  }

  public static function removeKnowledge($player, $total, $cards)
  {
    self::notifyAll('removeKnowledge', \clienttranslate('${player_name} removes ${n} knowledge from ${card_names}'), [
      'player' => $player,
      'n' => $total,
      'cards' => $cards,
    ]);
  }

  ///////////////////////////////////////////////////////////////
  //  _   _           _       _            _
  // | | | |_ __   __| | __ _| |_ ___     / \   _ __ __ _ ___
  // | | | | '_ \ / _` |/ _` | __/ _ \   / _ \ | '__/ _` / __|
  // | |_| | |_) | (_| | (_| | ||  __/  / ___ \| | | (_| \__ \
  //  \___/| .__/ \__,_|\__,_|\__\___| /_/   \_\_|  \__, |___/
  //       |_|                                      |___/
  ///////////////////////////////////////////////////////////////

  /*
   * Automatically adds some standard field about player and/or card
   */
  protected static function updateArgs(&$data)
  {
    if (isset($data['player'])) {
      $data['player_name'] = $data['player']->getName();
      $data['player_id'] = $data['player']->getId();
      unset($data['player']);
    }
    if (isset($data['player2'])) {
      $data['player_name2'] = $data['player2']->getName();
      $data['player_id2'] = $data['player2']->getId();
      unset($data['player2']);
    }
    if (isset($data['players'])) {
      $args = [];
      $logs = [];
      foreach ($data['players'] as $i => $player) {
        $logs[] = '${player_name' . $i . '}';
        $args['player_name' . $i] = $player->getName();
      }
      $data['players_names'] = [
        'log' => join(', ', $logs),
        'args' => $args,
      ];
      $data['i18n'][] = 'players_names';
      unset($data['players']);
    }

    if (isset($data['resources'])) {
      // Get an associative array $resource => $amount
      $resources = Utils::reduceResources($data['resources']);
      $data['resources_desc'] = Utils::resourcesToStr($resources);
    }

    if (isset($data['card'])) {
      $data['card_id'] = $data['card']->getId();
      $data['card_name'] = $data['card']->getName();
      $data['i18n'][] = 'card_name';
      $data['preserve'][] = 'card_id';
    }

    if (isset($data['card2'])) {
      $data['card2_id'] = $data['card2']->getId();
      $data['card2_name'] = $data['card2']->getName();
      $data['i18n'][] = 'card2_name';
      $data['preserve'][] = 'card2_id';
    }

    if (isset($data['cards'])) {
      $args = [];
      $logs = [];
      foreach ($data['cards'] as $i => $card) {
        $logs[] = '${card_name_' . $i . '}';
        $args['i18n'][] = 'card_name_' . $i;
        $args['card_name_' . $i] = [
          'log' => '${card_name}',
          'args' => [
            'i18n' => ['card_name'],
            'card_name' => is_array($card) ? $card['name'] : $card->getName(),
            'card_id' => is_array($card) ? $card['id'] : $card->getId(),
            'preserve' => ['card_id'],
          ],
        ];
      }
      $data['card_names'] = [
        'log' => join(', ', $logs),
        'args' => $args,
      ];
      $data['i18n'][] = 'card_names';
    }
  }
}

?>
