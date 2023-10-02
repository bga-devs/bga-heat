
-- ------
-- BGA framework: © Gregory Isabelli <gisabelli@boardgamearena.com> & Emmanuel Colin <ecolin@boardgamearena.com>
-- HeatChampionship implementation : © Timothée Pecatte <tim.pecatte@gmail.com>, Guy Baudin <guy.thoun@gmail.com>
-- 
-- This code has been produced on the BGA studio platform for use on http://boardgamearena.com.
-- See http://en.boardgamearena.com/#!doc/Studio for more information.
-- -----

-- dbmodel.sql

------------------- HIDDEN COPIES ------------------
CREATE TABLE IF NOT EXISTS `constructors2` (
  `id` int(10) NOT NULL,
  `name` varchar(50) NOT NULL,
  `no` int(10),
  `player_id` int(10),
  `score` int(10) NOT NULL DEFAULT 0,
  `gear` int(10),
  `car_cell` varchar(32),
  `speed` int(10),
  `turn` int(10),
  `paths` JSON,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE IF NOT EXISTS `cards2` (
  `card_id` int(10) NOT NULL,
  `card_location` varchar(32) NOT NULL,
  `card_state` int(10),
  `type` int(10) NOT NULL DEFAULT 0,
  PRIMARY KEY (`card_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;


CREATE TABLE IF NOT EXISTS `global_variables2` (
  `name` varchar(255) NOT NULL,
  `value` JSON,
  PRIMARY KEY (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
-----------------------------------------------------


CREATE TABLE IF NOT EXISTS `constructors` (
  `id` int(10) NOT NULL,
  `name` varchar(50) NOT NULL,
  `no` int(10),
  `player_id` int(10),
  `score` int(10) NOT NULL DEFAULT 0,
  `gear` int(10),
  `car_cell` varchar(32),
  `speed` int(10),
  `turn` int(10),
  `paths` JSON,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- PIECES TABLES
CREATE TABLE IF NOT EXISTS `cards` (
  `card_id` int(10) NOT NULL AUTO_INCREMENT,
  `card_location` varchar(32) NOT NULL,
  `card_state` int(10),
  `type` int(10) NOT NULL DEFAULT 0,
  PRIMARY KEY (`card_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;


-- CORE TABLES --
CREATE TABLE IF NOT EXISTS `global_variables` (
  `name` varchar(255) NOT NULL,
  `value` JSON,
  PRIMARY KEY (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE IF NOT EXISTS `user_preferences` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `player_id` int(10) NOT NULL,
  `pref_id` int(10) NOT NULL,
  `pref_value` int(10) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE IF NOT EXISTS `log` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `move_id` int(10) NOT NULL,
  `table` varchar(32) NOT NULL,
  `primary` varchar(32) NOT NULL,
  `type` varchar(32) NOT NULL,
  `affected` JSON,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
