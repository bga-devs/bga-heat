<?php
namespace HEAT\Actions;
use HEAT\Managers\Cards;
use HEAT\Managers\Players;
use HEAT\Core\Notifications;
use HEAT\Core\Stats;
use HEAT\Helpers\Utils;

class Create extends \HEAT\Models\Action
{
  public function getState()
  {
    return ST_CREATE;
  }

  public function getDescription()
  {
    return clienttranslate('Create');
  }

  public function getPlayableCards($player, $isDoable = false)
  {
    $freeSlots = $player->getFreeSlots();
    $freeArtefactSlot = $player->getFreeArtefactSlot();
    $constraint = $this->getCtxArg('constraint');
    $hand = $player->getHand();
    $cards = [];
    foreach ($hand as $card) {
      // Do we have any constraint ?
      if (!is_null($constraint) && !in_array($card->getType(), $constraint)) {
        continue;
      }

      // Must be able to discard enough cards
      $discard = $card->getDiscard();
      if ($discard >= $hand->count()) {
        continue;
      }

      $slots = [];
      // Artefact => just take the first slot available, if any
      if ($card->isArtefact()) {
        if (!is_null($freeArtefactSlot)) {
          $slots[$freeArtefactSlot] = $discard;
        }
      }
      // Buildings => check all the slots, unless locked
      else {
        $available = $card->isLocked() ? [$card->getStartingSpace()] : [1, 2, 3, 4, 5, 6];
        foreach ($available as $time) {
          // Enough card ?
          $totalToDiscard = $discard + abs($time - $card->getStartingSpace());
          if ($totalToDiscard >= $hand->count()) {
            continue;
          }
          // Free slot at that time ?
          $freeSlot = $freeSlots[$time] ?? null;
          if (is_null($freeSlot)) {
            continue;
          }

          $slots[$freeSlot] = $totalToDiscard;
        }
      }

      // At least one playable slots => ok
      if (!empty($slots)) {
        if ($isDoable) {
          return true;
        }

        $cards[$card->getId()] = $slots;
      }
    }

    return $isDoable ? false : $cards;
  }

  public function argsCreate()
  {
    $player = Players::getActive();
    return [
      '_private' => [
        'active' => [
          'cards' => $this->getPlayableCards($player),
        ],
      ],
    ];
  }

  public function actCreate($cardId, $slot, $cardIdsToDiscard)
  {
    // Sanity checks
    self::checkAction('actCreate');
    $player = Players::getActive();
    $cards = $this->argsCreate()['_private']['active']['cards'];
    $slots = $cards[$cardId] ?? null;
    if (is_null($slots)) {
      throw new \BgaVisibleSystemException('Invalid card. Should not happen');
    }
    if (!array_key_exists($slot, $slots)) {
      throw new \BgaVisibleSystemException('Invalid place. Should not happen');
    }
    if (count($cardIdsToDiscard) != $slots[$slot]) {
      throw new \BgaVisibleSystemException('Invalid number of cards to discard. Should not happen');
    }
    if (!empty(array_diff($cardIdsToDiscard, $player->getHand()->getIds()))) {
      throw new \BgaVisibleSystemException('Invalid cards to discard. Should not happen');
    }

    // Discard cards
    if (count($cardIdsToDiscard) > 0) {
      $cards = Cards::getMany($cardIdsToDiscard);
      Cards::discard($cardIdsToDiscard);
      Notifications::discardCards($player, $cards);
    }

    // Move card
    $card = Cards::getSingle($cardId);
    $card->setLocation($slot);
    if (!$card->isArtefact()) {
      $knowledge = $card->getInitialKnowledge();
      $knowledge -= $card->getInitialKnowledgeDiscount();
      $card->setKnowledge($knowledge);
    }
    $sourceId = $this->ctx->getSourceId();
    Notifications::createCard($player, $card, $sourceId);

    // Check immediate effect
    if ($card->getActivation() == \IMMEDIATE) {
      $this->insertAsChild([
        'action' => \ACTIVATE_CARD,
        'args' => ['cardId' => $card->getId(), 'activation' => IMMEDIATE],
      ]);
    }

    // Check listener
    // TODO

    $this->resolveAction(['cardId' => $cardId, 'slot' => $slot]);
  }
}
