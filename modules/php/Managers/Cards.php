<?php
namespace HEAT\Managers;

use BgaVisibleSystemException;
use HEAT\Core\Stats;
use HEAT\Core\Globals;
use HEAT\Core\Notifications;
use HEAT\Helpers\UserException;
use HEAT\Helpers\Collection;

/* Class to manage all the cards for Heat */

class Cards extends \HEAT\Helpers\Pieces
{
  protected static $table = 'cards';
  protected static $prefix = 'card_';
  protected static $customFields = ['type'];
  protected static $autoIncrement = false;
  protected static $autoremovePrefix = false;
  protected static $autoreshuffle = true;
  protected static $autoreshuffleCustom = ['deck' => 'discard'];

  protected static function cast($card)
  {
    return $card;
  }

  ///////////////////////////////////
  //  ____       _
  // / ___|  ___| |_ _   _ _ __
  // \___ \ / _ \ __| | | | '_ \
  //  ___) |  __/ |_| |_| | |_) |
  // |____/ \___|\__|\__,_| .__/
  //                      |_|
  ///////////////////////////////////

  /* Creation of the cards */
  public static function setupNewGame($players, $options)
  {
    // $cards = [];
    // // Create cards
    // foreach ($cardIds as $cId) {
    //   $data = [
    //     'id' => $cId,
    //     'location' => 'deck',
    //   ];

    //   if ($isPreMadeHands) {
    //     $card = self::getCardInstance($cId);
    //     $n = $card->getStartingHand();
    //     if (array_key_exists($n, $mapping)) {
    //       $data['location'] = 'hand';
    //       $data['player_id'] = $mapping[$n];
    //     }
    //   }

    //   $cards[$cId] = $data;
    // }

    // // Create the cards
    // self::create($cards, null);
    // self::shuffle('deck');
  }
}
