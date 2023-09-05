<?php
namespace HEAT\Circuits;

$circuitDatas = [
  'id' => 'Italia',
  'name' => clienttranslate('Italia'),
  'assets' => [
    'jpg' => 'circuits/italia.jpg',
  ],
  'nbrLaps' => 3,
  'stressCards' => 3,
  'heatCards' => 6,
  'startingCells' => [983, 981, 971, 969, 963, 961, 955, 951],
  'podium' => ['x' => 1488, 'y' => 108, 'a' => 0],
  'corners' => [
    10 => ['speed' => 5, 'lane' => 1, 'x' => 0, 'y' => 0],
    19 => ['speed' => 2, 'lane' => 2, 'x' => 0, 'y' => 0],
    26 => ['speed' => 3, 'lane' => 1, 'x' => 0, 'y' => 0],
  ],
  'cells' => [
    '905' => [
      'lane' => 2,
      'position' => 45,
      'x' => 829,
      'y' => 67,
      'a' => 0,
    ],
    '909' => [
      'lane' => 2,
      'position' => 44,
      'x' => 758,
      'y' => 68,
      'a' => -3,
    ],
    '911' => [
      'lane' => 2,
      'position' => 46,
      'x' => 899,
      'y' => 70,
      'a' => 11,
    ],
    '913' => [
      'lane' => 2,
      'position' => 47,
      'x' => 970,
      'y' => 78,
      'a' => 7,
    ],
    '915' => [
      'lane' => 2,
      'position' => 43,
      'x' => 685,
      'y' => 77,
      'a' => -9,
    ],
    '917' => [
      'lane' => 2,
      'position' => 48,
      'x' => 1041,
      'y' => 93,
      'a' => 14,
    ],
    '919' => [
      'lane' => 1,
      'position' => 45,
      'x' => 828,
      'y' => 102,
      'a' => 1,
    ],
    '921' => [
      'lane' => 1,
      'position' => 44,
      'x' => 760,
      'y' => 103,
      'a' => -3,
    ],
    '923' => [
      'lane' => 1,
      'position' => 46,
      'x' => 896,
      'y' => 105,
      'a' => 11,
    ],
    '925' => [
      'lane' => 2,
      'position' => 42,
      'x' => 613,
      'y' => 97,
      'a' => -18,
    ],
    '927' => [
      'lane' => 1,
      'position' => 43,
      'x' => 691,
      'y' => 111,
      'a' => -12,
    ],
    '929' => [
      'lane' => 1,
      'position' => 47,
      'x' => 963,
      'y' => 113,
      'a' => 10,
    ],
    '931' => [
      'lane' => 2,
      'position' => 49,
      'x' => 1111,
      'y' => 119,
      'a' => 26,
    ],
    '933' => [
      'lane' => 1,
      'position' => 48,
      'x' => 1030,
      'y' => 126,
      'a' => 14,
    ],
    '935' => [
      'lane' => 1,
      'position' => 42,
      'x' => 626,
      'y' => 129,
      'a' => -20,
    ],
    '937' => [
      'lane' => 2,
      'position' => 41,
      'x' => 547,
      'y' => 129,
      'a' => -30,
    ],
    '939' => [
      'lane' => 1,
      'position' => 49,
      'x' => 1094,
      'y' => 150,
      'a' => 26,
    ],
    '941' => [
      'lane' => 1,
      'position' => 41,
      'x' => 565,
      'y' => 160,
      'a' => -32,
    ],
    '943' => [
      'lane' => 2,
      'position' => 50,
      'x' => 1176,
      'y' => 164,
      'a' => 41,
    ],
    '945' => [
      'lane' => 2,
      'position' => 40,
      'x' => 488,
      'y' => 173,
      'a' => -41,
    ],
    '947' => [
      'lane' => 1,
      'position' => 50,
      'x' => 1152,
      'y' => 189,
      'a' => 39,
    ],
    '949' => [
      'lane' => 1,
      'position' => 40,
      'x' => 512,
      'y' => 201,
      'a' => -44,
    ],
    '951' => [
      'lane' => 2,
      'position' => 51,
      'x' => 1228,
      'y' => 221,
      'a' => 54,
    ],
    '953' => [
      'lane' => 2,
      'position' => 39,
      'x' => 437,
      'y' => 227,
      'a' => -46,
    ],
    '955' => [
      'lane' => 1,
      'position' => 51,
      'x' => 1198,
      'y' => 241,
      'a' => 54,
    ],
    '959' => [
      'lane' => 1,
      'position' => 39,
      'x' => 465,
      'y' => 251,
      'a' => -50,
    ],
    '961' => [
      'lane' => 2,
      'position' => 52,
      'x' => 1265,
      'y' => 281,
      'a' => 62,
    ],
    '963' => [
      'lane' => 1,
      'position' => 52,
      'x' => 1233,
      'y' => 296,
      'a' => 62,
    ],
    '965' => [
      'lane' => 2,
      'position' => 38,
      'x' => 394,
      'y' => 294,
      'a' => -65,
    ],
    '967' => [
      'lane' => 1,
      'position' => 38,
      'x' => 427,
      'y' => 309,
      'a' => -64,
    ],
    '969' => [
      'lane' => 2,
      'position' => 53,
      'x' => 1293,
      'y' => 341,
      'a' => 66,
    ],
    '971' => [
      'lane' => 1,
      'position' => 53,
      'x' => 1261,
      'y' => 354,
      'a' => 67,
    ],
    '973' => [
      'lane' => 2,
      'position' => 37,
      'x' => 372,
      'y' => 369,
      'a' => -80,
    ],
    '979' => [
      'lane' => 1,
      'position' => 37,
      'x' => 407,
      'y' => 374,
      'a' => -80,
    ],
    '981' => [
      'lane' => 2,
      'position' => 54,
      'x' => 1317,
      'y' => 403,
      'a' => 72,
    ],
    '983' => [
      'lane' => 1,
      'position' => 54,
      'x' => 1284,
      'y' => 413,
      'a' => 71,
    ],
    '985' => [
      'lane' => 1,
      'position' => 20,
      'x' => 649,
      'y' => 428,
      'a' => 166,
    ],
    '987' => [
      'lane' => 1,
      'position' => 36,
      'x' => 404,
      'y' => 441,
      'a' => 266,
    ],
    '989' => [
      'lane' => 2,
      'position' => 36,
      'x' => 368,
      'y' => 443,
      'a' => 267,
    ],
    '991' => [
      'lane' => 2,
      'position' => 20,
      'x' => 655,
      'y' => 459,
      'a' => 164,
    ],
    '993' => [
      'lane' => 2,
      'position' => 1,
      'x' => 1335,
      'y' => 475,
      'a' => 79,
    ],
    '995' => [
      'lane' => 1,
      'position' => 1,
      'x' => 1301,
      'y' => 482,
      'a' => 80,
    ],
    '997' => [
      'lane' => 1,
      'position' => 19,
      'x' => 742,
      'y' => 468,
      'a' => 255,
    ],
    '999' => [
      'lane' => 2,
      'position' => 19,
      'x' => 715,
      'y' => 489,
      'a' => 253,
    ],
    '1001' => [
      'lane' => 1,
      'position' => 35,
      'x' => 415,
      'y' => 506,
      'a' => 257,
    ],
    '1003' => [
      'lane' => 2,
      'position' => 35,
      'x' => 380,
      'y' => 513,
      'a' => 255,
    ],
    '1005' => [
      'lane' => 2,
      'position' => 21,
      'x' => 622,
      'y' => 510,
      'a' => 75,
    ],
    '1007' => [
      'lane' => 1,
      'position' => 21,
      'x' => 588,
      'y' => 507,
      'a' => 76,
    ],
    '1009' => [
      'lane' => 1,
      'position' => 2,
      'x' => 1307,
      'y' => 547,
      'a' => 89,
    ],
    '1011' => [
      'lane' => 2,
      'position' => 2,
      'x' => 1342,
      'y' => 545,
      'a' => 87,
    ],
    '1013' => [
      'lane' => 1,
      'position' => 18,
      'x' => 763,
      'y' => 548,
      'a' => 256,
    ],
    '1015' => [
      'lane' => 2,
      'position' => 18,
      'x' => 730,
      'y' => 556,
      'a' => 255,
    ],
    '1017' => [
      'lane' => 1,
      'position' => 34,
      'x' => 430,
      'y' => 569,
      'a' => 255,
    ],
    '1019' => [
      'lane' => 2,
      'position' => 34,
      'x' => 396,
      'y' => 577,
      'a' => 256,
    ],
    '1021' => [
      'lane' => 2,
      'position' => 22,
      'x' => 642,
      'y' => 590,
      'a' => 76,
    ],
    '1023' => [
      'lane' => 1,
      'position' => 22,
      'x' => 609,
      'y' => 598,
      'a' => 75,
    ],
    '1025' => [
      'lane' => 1,
      'position' => 17,
      'x' => 778,
      'y' => 612,
      'a' => 256,
    ],
    '1027' => [
      'lane' => 2,
      'position' => 17,
      'x' => 744,
      'y' => 619,
      'a' => 256,
    ],
    '1029' => [
      'lane' => 1,
      'position' => 3,
      'x' => 1303,
      'y' => 615,
      'a' => 97,
    ],
    '1031' => [
      'lane' => 2,
      'position' => 3,
      'x' => 1337,
      'y' => 621,
      'a' => 99,
    ],
    '1033' => [
      'lane' => 1,
      'position' => 33,
      'x' => 444,
      'y' => 630,
      'a' => 257,
    ],
    '1035' => [
      'lane' => 2,
      'position' => 33,
      'x' => 411,
      'y' => 640,
      'a' => 258,
    ],
    '1037' => [
      'lane' => 1,
      'position' => 16,
      'x' => 792,
      'y' => 673,
      'a' => 256,
    ],
    '1039' => [
      'lane' => 2,
      'position' => 23,
      'x' => 663,
      'y' => 670,
      'a' => 76,
    ],
    '1041' => [
      'lane' => 2,
      'position' => 16,
      'x' => 759,
      'y' => 681,
      'a' => 256,
    ],
    '1043' => [
      'lane' => 1,
      'position' => 23,
      'x' => 630,
      'y' => 678,
      'a' => 74,
    ],
    '1045' => [
      'lane' => 1,
      'position' => 4,
      'x' => 1282,
      'y' => 681,
      'a' => 112,
    ],
    '1047' => [
      'lane' => 1,
      'position' => 32,
      'x' => 459,
      'y' => 692,
      'a' => 257,
    ],
    '1049' => [
      'lane' => 2,
      'position' => 32,
      'x' => 426,
      'y' => 701,
      'a' => 256,
    ],
    '1051' => [
      'lane' => 2,
      'position' => 4,
      'x' => 1315,
      'y' => 696,
      'a' => 112,
    ],
    '1053' => [
      'lane' => 1,
      'position' => 15,
      'x' => 807,
      'y' => 736,
      'a' => 256,
    ],
    '1055' => [
      'lane' => 1,
      'position' => 5,
      'x' => 1244,
      'y' => 737,
      'a' => 132,
    ],
    '1057' => [
      'lane' => 2,
      'position' => 15,
      'x' => 774,
      'y' => 744,
      'a' => 256,
    ],
    '1059' => [
      'lane' => 2,
      'position' => 24,
      'x' => 683,
      'y' => 744,
      'a' => 71,
    ],
    '1061' => [
      'lane' => 1,
      'position' => 31,
      'x' => 474,
      'y' => 755,
      'a' => 253,
    ],
    '1063' => [
      'lane' => 1,
      'position' => 24,
      'x' => 649,
      'y' => 753,
      'a' => 73,
    ],
    '1065' => [
      'lane' => 2,
      'position' => 5,
      'x' => 1271,
      'y' => 759,
      'a' => 133,
    ],
    '1067' => [
      'lane' => 2,
      'position' => 31,
      'x' => 440,
      'y' => 763,
      'a' => 253,
    ],
    '1069' => [
      'lane' => 1,
      'position' => 6,
      'x' => 1197,
      'y' => 785,
      'a' => 136,
    ],
    '1071' => [
      'lane' => 1,
      'position' => 14,
      'x' => 822,
      'y' => 800,
      'a' => 257,
    ],
    '1073' => [
      'lane' => 2,
      'position' => 14,
      'x' => 789,
      'y' => 807,
      'a' => 254,
    ],
    '1075' => [
      'lane' => 2,
      'position' => 6,
      'x' => 1221,
      'y' => 809,
      'a' => 131,
    ],
    '1077' => [
      'lane' => 1,
      'position' => 30,
      'x' => 489,
      'y' => 818,
      'a' => 256,
    ],
    '1079' => [
      'lane' => 2,
      'position' => 25,
      'x' => 706,
      'y' => 820,
      'a' => 68,
    ],
    '1081' => [
      'lane' => 1,
      'position' => 25,
      'x' => 672,
      'y' => 824,
      'a' => 71,
    ],
    '1083' => [
      'lane' => 1,
      'position' => 7,
      'x' => 1148,
      'y' => 830,
      'a' => 135,
    ],
    '1085' => [
      'lane' => 2,
      'position' => 30,
      'x' => 456,
      'y' => 828,
      'a' => 256,
    ],
    '1087' => [
      'lane' => 2,
      'position' => 7,
      'x' => 1171,
      'y' => 855,
      'a' => 137,
    ],
    '1089' => [
      'lane' => 1,
      'position' => 13,
      'x' => 835,
      'y' => 865,
      'a' => 259,
    ],
    '1091' => [
      'lane' => 1,
      'position' => 8,
      'x' => 1098,
      'y' => 874,
      'a' => 134,
    ],
    '1093' => [
      'lane' => 2,
      'position' => 13,
      'x' => 803,
      'y' => 875,
      'a' => 257,
    ],
    '1095' => [
      'lane' => 1,
      'position' => 29,
      'x' => 507,
      'y' => 883,
      'a' => 250,
    ],
    '1097' => [
      'lane' => 2,
      'position' => 8,
      'x' => 1121,
      'y' => 899,
      'a' => 138,
    ],
    '1099' => [
      'lane' => 1,
      'position' => 26,
      'x' => 672,
      'y' => 895,
      'a' => 107,
    ],
    '1101' => [
      'lane' => 2,
      'position' => 29,
      'x' => 477,
      'y' => 899,
      'a' => 249,
    ],
    '1103' => [
      'lane' => 1,
      'position' => 9,
      'x' => 1051,
      'y' => 919,
      'a' => 140,
    ],
    '1105' => [
      'lane' => 2,
      'position' => 26,
      'x' => 701,
      'y' => 908,
      'a' => 107,
    ],
    '1107' => [
      'lane' => 1,
      'position' => 12,
      'x' => 865,
      'y' => 926,
      'a' => 225,
    ],
    '1109' => [
      'lane' => 1,
      'position' => 28,
      'x' => 550,
      'y' => 937,
      'a' => 210,
    ],
    '1111' => [
      'lane' => 1,
      'position' => 27,
      'x' => 620,
      'y' => 945,
      'a' => 162,
    ],
    '1113' => [
      'lane' => 2,
      'position' => 9,
      'x' => 1073,
      'y' => 943,
      'a' => 137,
    ],
    '1115' => [
      'lane' => 1,
      'position' => 10,
      'x' => 997,
      'y' => 956,
      'a' => 154,
    ],
    '1117' => [
      'lane' => 1,
      'position' => 11,
      'x' => 925,
      'y' => 963,
      'a' => 192,
    ],
    '1119' => [
      'lane' => 2,
      'position' => 12,
      'x' => 841,
      'y' => 948,
      'a' => 226,
    ],
    '1121' => [
      'lane' => 2,
      'position' => 28,
      'x' => 534,
      'y' => 965,
      'a' => 215,
    ],
    '1123' => [
      'lane' => 2,
      'position' => 27,
      'x' => 630,
      'y' => 976,
      'a' => 162,
    ],
    '1127' => [
      'lane' => 2,
      'position' => 10,
      'x' => 1008,
      'y' => 987,
      'a' => 169,
    ],
    '1129' => [
      'lane' => 2,
      'position' => 11,
      'x' => 916,
      'y' => 995,
      'a' => 196,
    ],
  ],
];
