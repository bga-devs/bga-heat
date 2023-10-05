<?php
namespace HEAT\Circuits;

$circuitDatas = [
  'id' => 'GB',
  'name' => clienttranslate('Great Britain'),
  'jpgUrl' => 'circuits/gb.jpg',
  'nbrLaps' => 2,
  'stressCards' => 3,
  'heatCards' => 6,
  'startingCells' => [889, 887, 897, 895, 905, 903, 911, 913],
  'podium' => ['x' => 148, 'y' => 122, 'a' => 0],
  'corners' => [
    [
      'position' => 15,
      'speed' => 10,
      'lane' => 1,
      'legend' => 2,
      'x' => 1517,
      'y' => 54,
      'tentX' => 1582,
      'tentY' => 94,
      'sectorTentX' => 1595,
      'sectorTentY' => 636,
    ],
    [
      'position' => 30,
      'speed' => 6,
      'lane' => 1,
      'legend' => 21,
      'x' => 1187,
      'y' => 1057,
      'tentX' => 1098,
      'tentY' => 1040,
      'sectorTentX' => 1198,
      'sectorTentY' => 797,
    ],
    [
      'position' => 37,
      'speed' => 5,
      'lane' => 2,
      'legend' => 30,
      'x' => 1223,
      'y' => 479,
      'tentX' => 1275,
      'tentY' => 536,
      'sectorTentX' => 882,
      'sectorTentY' => 462,
    ],
    [
      'position' => 43,
      'speed' => 4,
      'lane' => 2,
      'legend' => 37,
      'x' => 658,
      'y' => 558,
      'tentX' => 707,
      'tentY' => 497,
      'sectorTentX' => 870,
      'sectorTentY' => 669,
    ],
    [
      'position' => 48,
      'speed' => 3,
      'lane' => 1,
      'legend' => 43,
      'x' => 915,
      'y' => 863,
      'tentX' => 1023,
      'tentY' => 988,
      'sectorTentX' => 529,
      'sectorTentY' => 512,
    ],
  ],
  'weatherCardPos' => ['x' => 87, 'y' => 585],
  'cells' => [
    '817' => [
      'lane' => 2,
      'position' => 5,
      'x' => 784,
      'y' => 62,
      'a' => 0,
    ],
    '821' => [
      'lane' => 2,
      'position' => 6,
      'x' => 850,
      'y' => 63,
      'a' => 0,
    ],
    '823' => [
      'lane' => 2,
      'position' => 8,
      'x' => 981,
      'y' => 64,
      'a' => 0,
    ],
    '825' => [
      'lane' => 2,
      'position' => 7,
      'x' => 916,
      'y' => 63,
      'a' => 0,
    ],
    '827' => [
      'lane' => 2,
      'position' => 9,
      'x' => 1045,
      'y' => 64,
      'a' => 0,
    ],
    '829' => [
      'lane' => 2,
      'position' => 11,
      'x' => 1172,
      'y' => 65,
      'a' => 0,
    ],
    '831' => [
      'lane' => 2,
      'position' => 10,
      'x' => 1108,
      'y' => 65,
      'a' => 0,
    ],
    '833' => [
      'lane' => 2,
      'position' => 12,
      'x' => 1237,
      'y' => 65,
      'a' => 0,
    ],
    '835' => [
      'lane' => 2,
      'position' => 13,
      'x' => 1301,
      'y' => 66,
      'a' => 0,
    ],
    '837' => [
      'lane' => 2,
      'position' => 14,
      'x' => 1371,
      'y' => 66,
      'a' => 1,
    ],
    '839' => [
      'lane' => 2,
      'position' => 4,
      'x' => 715,
      'y' => 64,
      'a' => -5,
    ],
    '841' => [
      'lane' => 2,
      'position' => 3,
      'x' => 641,
      'y' => 79,
      'a' => -18,
    ],
    '843' => [
      'lane' => 2,
      'position' => 15,
      'x' => 1446,
      'y' => 83,
      'a' => 20,
    ],
    '845' => [
      'lane' => 1,
      'position' => 5,
      'x' => 785,
      'y' => 96,
      'a' => 1,
    ],
    '847' => [
      'lane' => 1,
      'position' => 6,
      'x' => 850,
      'y' => 97,
      'a' => 0,
    ],
    '849' => [
      'lane' => 1,
      'position' => 7,
      'x' => 916,
      'y' => 97,
      'a' => 0,
    ],
    '851' => [
      'lane' => 1,
      'position' => 9,
      'x' => 1045,
      'y' => 98,
      'a' => 1,
    ],
    '853' => [
      'lane' => 1,
      'position' => 8,
      'x' => 981,
      'y' => 98,
      'a' => 0,
    ],
    '855' => [
      'lane' => 1,
      'position' => 10,
      'x' => 1108,
      'y' => 99,
      'a' => 0,
    ],
    '857' => [
      'lane' => 1,
      'position' => 11,
      'x' => 1172,
      'y' => 99,
      'a' => 0,
    ],
    '859' => [
      'lane' => 1,
      'position' => 12,
      'x' => 1237,
      'y' => 99,
      'a' => 0,
    ],
    '861' => [
      'lane' => 1,
      'position' => 13,
      'x' => 1302,
      'y' => 100,
      'a' => 0,
    ],
    '863' => [
      'lane' => 1,
      'position' => 4,
      'x' => 720,
      'y' => 98,
      'a' => -5,
    ],
    '865' => [
      'lane' => 1,
      'position' => 14,
      'x' => 1367,
      'y' => 100,
      'a' => 2,
    ],
    '867' => [
      'lane' => 1,
      'position' => 3,
      'x' => 653,
      'y' => 112,
      'a' => -17,
    ],
    '869' => [
      'lane' => 1,
      'position' => 15,
      'x' => 1433,
      'y' => 114,
      'a' => 19,
    ],
    '871' => [
      'lane' => 2,
      'position' => 2,
      'x' => 569,
      'y' => 114,
      'a' => -34,
    ],
    '873' => [
      'lane' => 2,
      'position' => 16,
      'x' => 1516,
      'y' => 129,
      'a' => 45,
    ],
    '875' => [
      'lane' => 1,
      'position' => 2,
      'x' => 589,
      'y' => 143,
      'a' => -35,
    ],
    '877' => [
      'lane' => 1,
      'position' => 16,
      'x' => 1491,
      'y' => 153,
      'a' => 45,
    ],
    '879' => [
      'lane' => 2,
      'position' => 1,
      'x' => 511,
      'y' => 170,
      'a' => -53,
    ],
    '881' => [
      'lane' => 1,
      'position' => 1,
      'x' => 539,
      'y' => 191,
      'a' => -53,
    ],
    '883' => [
      'lane' => 2,
      'position' => 17,
      'x' => 1561,
      'y' => 197,
      'a' => 67,
    ],
    '885' => [
      'lane' => 1,
      'position' => 17,
      'x' => 1530,
      'y' => 210,
      'a' => 67,
    ],
    '887' => [
      'lane' => 2,
      'position' => 63,
      'x' => 468,
      'y' => 242,
      'a' => -63,
    ],
    '889' => [
      'lane' => 1,
      'position' => 63,
      'x' => 500,
      'y' => 256,
      'a' => -63,
    ],
    '891' => [
      'lane' => 2,
      'position' => 18,
      'x' => 1577,
      'y' => 273,
      'a' => 89,
    ],
    '893' => [
      'lane' => 1,
      'position' => 18,
      'x' => 1543,
      'y' => 277,
      'a' => 87,
    ],
    '895' => [
      'lane' => 2,
      'position' => 62,
      'x' => 440,
      'y' => 309,
      'a' => -70,
    ],
    '897' => [
      'lane' => 1,
      'position' => 62,
      'x' => 475,
      'y' => 320,
      'a' => -71,
    ],
    '899' => [
      'lane' => 1,
      'position' => 19,
      'x' => 1541,
      'y' => 344,
      'a' => 94,
    ],
    '901' => [
      'lane' => 2,
      'position' => 19,
      'x' => 1576,
      'y' => 345,
      'a' => 92,
    ],
    '903' => [
      'lane' => 2,
      'position' => 61,
      'x' => 420,
      'y' => 381,
      'a' => -76,
    ],
    '905' => [
      'lane' => 1,
      'position' => 61,
      'x' => 456,
      'y' => 387,
      'a' => -78,
    ],
    '907' => [
      'lane' => 1,
      'position' => 20,
      'x' => 1533,
      'y' => 411,
      'a' => 97,
    ],
    '909' => [
      'lane' => 2,
      'position' => 20,
      'x' => 1570,
      'y' => 415,
      'a' => 98,
    ],
    '911' => [
      'lane' => 1,
      'position' => 60,
      'x' => 448,
      'y' => 456,
      'a' => 271,
    ],
    '913' => [
      'lane' => 2,
      'position' => 60,
      'x' => 411,
      'y' => 454,
      'a' => -86,
    ],
    '915' => [
      'lane' => 1,
      'position' => 39,
      'x' => 1039,
      'y' => 462,
      'a' => 163,
    ],
    '917' => [
      'lane' => 1,
      'position' => 21,
      'x' => 1522,
      'y' => 477,
      'a' => 99,
    ],
    '919' => [
      'lane' => 1,
      'position' => 38,
      'x' => 1134,
      'y' => 474,
      'a' => 215,
    ],
    '921' => [
      'lane' => 2,
      'position' => 21,
      'x' => 1559,
      'y' => 483,
      'a' => 99,
    ],
    '923' => [
      'lane' => 2,
      'position' => 39,
      'x' => 1048,
      'y' => 493,
      'a' => 158,
    ],
    '925' => [
      'lane' => 2,
      'position' => 38,
      'x' => 1117,
      'y' => 501,
      'a' => 211,
    ],
    '927' => [
      'lane' => 1,
      'position' => 40,
      'x' => 966,
      'y' => 503,
      'a' => 143,
    ],
    '929' => [
      'lane' => 1,
      'position' => 41,
      'x' => 905,
      'y' => 533,
      'a' => 167,
    ],
    '931' => [
      'lane' => 1,
      'position' => 42,
      'x' => 830,
      'y' => 536,
      'a' => 184,
    ],
    '933' => [
      'lane' => 1,
      'position' => 59,
      'x' => 451,
      'y' => 524,
      'a' => 261,
    ],
    '935' => [
      'lane' => 2,
      'position' => 59,
      'x' => 414,
      'y' => 528,
      'a' => 264,
    ],
    '937' => [
      'lane' => 2,
      'position' => 40,
      'x' => 984,
      'y' => 533,
      'a' => 138,
    ],
    '939' => [
      'lane' => 1,
      'position' => 22,
      'x' => 1510,
      'y' => 540,
      'a' => 101,
    ],
    '941' => [
      'lane' => 2,
      'position' => 22,
      'x' => 1546,
      'y' => 548,
      'a' => 103,
    ],
    '943' => [
      'lane' => 2,
      'position' => 41,
      'x' => 914,
      'y' => 567,
      'a' => 167,
    ],
    '945' => [
      'lane' => 2,
      'position' => 42,
      'x' => 834,
      'y' => 571,
      'a' => 185,
    ],
    '947' => [
      'lane' => 1,
      'position' => 43,
      'x' => 744,
      'y' => 559,
      'a' => 148,
    ],
    '949' => [
      'lane' => 2,
      'position' => 37,
      'x' => 1154,
      'y' => 563,
      'a' => 263,
    ],
    '951' => [
      'lane' => 1,
      'position' => 37,
      'x' => 1187,
      'y' => 559,
      'a' => 266,
    ],
    '953' => [
      'lane' => 2,
      'position' => 43,
      'x' => 763,
      'y' => 585,
      'a' => 147,
    ],
    '955' => [
      'lane' => 1,
      'position' => 58,
      'x' => 467,
      'y' => 588,
      'a' => 250,
    ],
    '957' => [
      'lane' => 2,
      'position' => 58,
      'x' => 431,
      'y' => 600,
      'a' => 249,
    ],
    '959' => [
      'lane' => 1,
      'position' => 23,
      'x' => 1494,
      'y' => 604,
      'a' => 108,
    ],
    '961' => [
      'lane' => 2,
      'position' => 23,
      'x' => 1530,
      'y' => 614,
      'a' => 104,
    ],
    '963' => [
      'lane' => 2,
      'position' => 36,
      'x' => 1136,
      'y' => 632,
      'a' => -56,
    ],
    '965' => [
      'lane' => 1,
      'position' => 36,
      'x' => 1169,
      'y' => 644,
      'a' => -57,
    ],
    '967' => [
      'lane' => 2,
      'position' => 44,
      'x' => 724,
      'y' => 647,
      'a' => 94,
    ],
    '969' => [
      'lane' => 1,
      'position' => 57,
      'x' => 493,
      'y' => 650,
      'a' => 243,
    ],
    '971' => [
      'lane' => 1,
      'position' => 44,
      'x' => 692,
      'y' => 643,
      'a' => 97,
    ],
    '973' => [
      'lane' => 1,
      'position' => 24,
      'x' => 1474,
      'y' => 667,
      'a' => 109,
    ],
    '975' => [
      'lane' => 2,
      'position' => 57,
      'x' => 460,
      'y' => 667,
      'a' => 243,
    ],
    '977' => [
      'lane' => 2,
      'position' => 24,
      'x' => 1509,
      'y' => 681,
      'a' => 110,
    ],
    '979' => [
      'lane' => 2,
      'position' => 35,
      'x' => 1099,
      'y' => 697,
      'a' => -65,
    ],
    '981' => [
      'lane' => 1,
      'position' => 56,
      'x' => 530,
      'y' => 707,
      'a' => 228,
    ],
    '983' => [
      'lane' => 1,
      'position' => 35,
      'x' => 1133,
      'y' => 711,
      'a' => -66,
    ],
    '985' => [
      'lane' => 2,
      'position' => 45,
      'x' => 747,
      'y' => 712,
      'a' => 46,
    ],
    '987' => [
      'lane' => 2,
      'position' => 46,
      'x' => 808,
      'y' => 742,
      'a' => 5,
    ],
    '989' => [
      'lane' => 1,
      'position' => 25,
      'x' => 1449,
      'y' => 729,
      'a' => 113,
    ],
    '991' => [
      'lane' => 2,
      'position' => 56,
      'x' => 503,
      'y' => 732,
      'a' => 232,
    ],
    '993' => [
      'lane' => 1,
      'position' => 45,
      'x' => 723,
      'y' => 734,
      'a' => 44,
    ],
    '995' => [
      'lane' => 2,
      'position' => 25,
      'x' => 1483,
      'y' => 744,
      'a' => 110,
    ],
    '997' => [
      'lane' => 1,
      'position' => 55,
      'x' => 584,
      'y' => 751,
      'a' => 214,
    ],
    '999' => [
      'lane' => 2,
      'position' => 47,
      'x' => 883,
      'y' => 760,
      'a' => 22,
    ],
    '1001' => [
      'lane' => 1,
      'position' => 46,
      'x' => 799,
      'y' => 774,
      'a' => 6,
    ],
    '1003' => [
      'lane' => 2,
      'position' => 34,
      'x' => 1076,
      'y' => 766,
      'a' => -76,
    ],
    '1005' => [
      'lane' => 1,
      'position' => 34,
      'x' => 1111,
      'y' => 775,
      'a' => -76,
    ],
    '1007' => [
      'lane' => 2,
      'position' => 55,
      'x' => 563,
      'y' => 781,
      'a' => 216,
    ],
    '1009' => [
      'lane' => 1,
      'position' => 54,
      'x' => 644,
      'y' => 787,
      'a' => 211,
    ],
    '1011' => [
      'lane' => 1,
      'position' => 47,
      'x' => 873,
      'y' => 793,
      'a' => 25,
    ],
    '1013' => [
      'lane' => 1,
      'position' => 26,
      'x' => 1420,
      'y' => 787,
      'a' => 117,
    ],
    '1015' => [
      'lane' => 2,
      'position' => 48,
      'x' => 965,
      'y' => 801,
      'a' => 25,
    ],
    '1017' => [
      'lane' => 2,
      'position' => 26,
      'x' => 1453,
      'y' => 805,
      'a' => 120,
    ],
    '1019' => [
      'lane' => 2,
      'position' => 54,
      'x' => 628,
      'y' => 818,
      'a' => 206,
    ],
    '1021' => [
      'lane' => 1,
      'position' => 53,
      'x' => 707,
      'y' => 819,
      'a' => 205,
    ],
    '1023' => [
      'lane' => 1,
      'position' => 48,
      'x' => 940,
      'y' => 825,
      'a' => 24,
    ],
    '1025' => [
      'lane' => 1,
      'position' => 52,
      'x' => 770,
      'y' => 850,
      'a' => 204,
    ],
    '1027' => [
      'lane' => 2,
      'position' => 53,
      'x' => 693,
      'y' => 851,
      'a' => 206,
    ],
    '1029' => [
      'lane' => 1,
      'position' => 27,
      'x' => 1385,
      'y' => 843,
      'a' => 124,
    ],
    '1031' => [
      'lane' => 1,
      'position' => 33,
      'x' => 1102,
      'y' => 843,
      'a' => -88,
    ],
    '1033' => [
      'lane' => 2,
      'position' => 33,
      'x' => 1068,
      'y' => 844,
      'a' => -86,
    ],
    '1035' => [
      'lane' => 2,
      'position' => 27,
      'x' => 1415,
      'y' => 864,
      'a' => 126,
    ],
    '1037' => [
      'lane' => 2,
      'position' => 52,
      'x' => 756,
      'y' => 880,
      'a' => 204,
    ],
    '1039' => [
      'lane' => 1,
      'position' => 51,
      'x' => 833,
      'y' => 879,
      'a' => 204,
    ],
    '1041' => [
      'lane' => 1,
      'position' => 28,
      'x' => 1345,
      'y' => 894,
      'a' => 128,
    ],
    '1043' => [
      'lane' => 1,
      'position' => 49,
      'x' => 959,
      'y' => 887,
      'a' => 116,
    ],
    '1045' => [
      'lane' => 2,
      'position' => 51,
      'x' => 819,
      'y' => 909,
      'a' => 205,
    ],
    '1047' => [
      'lane' => 1,
      'position' => 50,
      'x' => 900,
      'y' => 910,
      'a' => 204,
    ],
    '1049' => [
      'lane' => 1,
      'position' => 32,
      'x' => 1116,
      'y' => 911,
      'a' => 241,
    ],
    '1051' => [
      'lane' => 2,
      'position' => 28,
      'x' => 1372,
      'y' => 918,
      'a' => 132,
    ],
    '1053' => [
      'lane' => 2,
      'position' => 49,
      'x' => 987,
      'y' => 899,
      'a' => 120,
    ],
    '1055' => [
      'lane' => 2,
      'position' => 50,
      'x' => 898,
      'y' => 945,
      'a' => 207,
    ],
    '1057' => [
      'lane' => 2,
      'position' => 32,
      'x' => 1086,
      'y' => 926,
      'a' => 242,
    ],
    '1059' => [
      'lane' => 1,
      'position' => 29,
      'x' => 1298,
      'y' => 942,
      'a' => 142,
    ],
    '1061' => [
      'lane' => 1,
      'position' => 31,
      'x' => 1165,
      'y' => 962,
      'a' => 208,
    ],
    '1063' => [
      'lane' => 1,
      'position' => 30,
      'x' => 1236,
      'y' => 973,
      'a' => 170,
    ],
    '1065' => [
      'lane' => 2,
      'position' => 29,
      'x' => 1318,
      'y' => 969,
      'a' => 140,
    ],
    '1067' => [
      'lane' => 2,
      'position' => 31,
      'x' => 1149,
      'y' => 991,
      'a' => 209,
    ],
    '1069' => [
      'lane' => 2,
      'position' => 30,
      'x' => 1241,
      'y' => 1005,
      'a' => 170,
    ],
  ],
];
