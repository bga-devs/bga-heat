<?php

namespace HEAT\Circuits;

$circuitDatas = [
  "id"             => "Japan",
  "name"           => clienttranslate("Japan"),
  "jpgUrl"         => 'circuits/japan.jpg',
  "nbrLaps"        => 2,
  "stressCards"    => 3,
  "heatCards"      => 7,
  "startingCells"  => [
    1003,
    987,
    995,
    985,
    993,
    979,
    981,
    969
  ],
  "podium"         => [
    "x" => 0,
    "y" => 0,
    "a" => 0
  ],
  "weatherCardPos" => [
    "x" => 81,
    "y" => 187
  ],
  "corners"        => [
    [
      "position"    => 10,
      "speed"       => 4,
      "x"           => 1610,
      "y"           => 700,
      "lane"        => 2,
      "legend"      => 3,
      "tentX"       => 1567,
      "tentY"       => 537,
      "sectorTentX" => 1275,
      "sectorTentY" => 360
    ],
    [
      "position"    => 12,
      "speed"       => 4,
      "x"           => 1330,
      "y"           => 613,
      "lane"        => 1,
      "legend"      => 10,
      "tentX"       => 1568,
      "tentY"       => 535,
      "sectorTentX" => 0,
      "sectorTentY" => 0,
      "chicane"     => 0
    ],
    [
      "position"    => 18,
      "speed"       => 2,
      "x"           => 1502,
      "y"           => 134,
      "lane"        => 2,
      "legend"      => 13,
      "tentX"       => 1396,
      "tentY"       => 200,
      "sectorTentX" => 955,
      "sectorTentY" => 941
    ],
    [
      "position"    => 45,
      "speed"       => 5,
      "x"           => 42,
      "y"           => 783,
      "lane"        => 1,
      "legend"      => 37,
      "tentX"       => 222,
      "tentY"       => 805,
      "sectorTentX" => 362,
      "sectorTentY" => 613
    ],
    [
      "position"    => 53,
      "speed"       => 3,
      "x"           => 427,
      "y"           => 203,
      "lane"        => 1,
      "legend"      => 47,
      "tentX"       => 418,
      "tentY"       => 396,
      "sectorTentX" => 564,
      "sectorTentY" => 609
    ]
  ],
  "floodedSpaces"  => [
    951,
    941,
    935,
    927,
    921,
    933,
    937,
    943,
    955,
    959,
    977,
    973,
    1047,
    1039,
    1045,
    1059,
    1067,
    1051,
    1049,
    1065,
    1043,
    1053,
    1025,
    1021,
    1099,
    1119,
    1117,
    1101,
    1103,
    1115,
    1111,
    1095,
    1107,
    1091,
    1081,
    1085,
    1075,
    1073
  ],
  "cells"          => [
    879  => [
      "lane"     => 1,
      "position" => 20,
      "x"        => 1473,
      "y"        => 54,
      "a"        => 159
    ],
    883  => [
      "lane"     => 1,
      "position" => 21,
      "x"        => 1389,
      "y"        => 90,
      "a"        => 157
    ],
    885  => [
      "lane"     => 2,
      "position" => 20,
      "x"        => 1475,
      "y"        => 89,
      "a"        => 154
    ],
    887  => [
      "lane"     => 1,
      "position" => 22,
      "x"        => 1324,
      "y"        => 111,
      "a"        => 164
    ],
    889  => [
      "lane"     => 2,
      "position" => 19,
      "x"        => 1542,
      "y"        => 106,
      "a"        => 228
    ],
    891  => [
      "lane"     => 1,
      "position" => 19,
      "x"        => 1569,
      "y"        => 90,
      "a"        => 230
    ],
    893  => [
      "lane"     => 2,
      "position" => 21,
      "x"        => 1403,
      "y"        => 122,
      "a"        => 159
    ],
    895  => [
      "lane"     => 1,
      "position" => 23,
      "x"        => 1257,
      "y"        => 125,
      "a"        => 167
    ],
    897  => [
      "lane"     => 1,
      "position" => 24,
      "x"        => 1191,
      "y"        => 142,
      "a"        => 164
    ],
    899  => [
      "lane"     => 2,
      "position" => 22,
      "x"        => 1333,
      "y"        => 146,
      "a"        => 166
    ],
    901  => [
      "lane"     => 2,
      "position" => 23,
      "x"        => 1268,
      "y"        => 161,
      "a"        => 166
    ],
    903  => [
      "lane"     => 1,
      "position" => 25,
      "x"        => 1121,
      "y"        => 166,
      "a"        => 157
    ],
    905  => [
      "lane"     => 2,
      "position" => 24,
      "x"        => 1201,
      "y"        => 178,
      "a"        => 165
    ],
    907  => [
      "lane"     => 2,
      "position" => 18,
      "x"        => 1531,
      "y"        => 171,
      "a"        => -41
    ],
    909  => [
      "lane"     => 2,
      "position" => 25,
      "x"        => 1136,
      "y"        => 198,
      "a"        => 157
    ],
    911  => [
      "lane"     => 1,
      "position" => 18,
      "x"        => 1562,
      "y"        => 192,
      "a"        => -44
    ],
    913  => [
      "lane"     => 1,
      "position" => 26,
      "x"        => 1052,
      "y"        => 204,
      "a"        => 144
    ],
    915  => [
      "lane"     => 2,
      "position" => 17,
      "x"        => 1471,
      "y"        => 220,
      "a"        => -35
    ],
    917  => [
      "lane"     => 2,
      "position" => 26,
      "x"        => 1074,
      "y"        => 232,
      "a"        => 145
    ],
    919  => [
      "lane"     => 1,
      "position" => 17,
      "x"        => 1494,
      "y"        => 248,
      "a"        => -34
    ],
    921  => [
      "lane"     => 2,
      "position" => 53,
      "x"        => 376,
      "y"        => 272,
      "a"        => -16
    ],
    923  => [
      "lane"     => 2,
      "position" => 16,
      "x"        => 1408,
      "y"        => 272,
      "a"        => -43
    ],
    925  => [
      "lane"     => 1,
      "position" => 27,
      "x"        => 996,
      "y"        => 271,
      "a"        => 114
    ],
    927  => [
      "lane"     => 2,
      "position" => 54,
      "x"        => 478,
      "y"        => 278,
      "a"        => 25
    ],
    929  => [
      "lane"     => 2,
      "position" => 27,
      "x"        => 1027,
      "y"        => 286,
      "a"        => 114
    ],
    931  => [
      "lane"     => 1,
      "position" => 16,
      "x"        => 1433,
      "y"        => 296,
      "a"        => -43
    ],
    933  => [
      "lane"     => 1,
      "position" => 53,
      "x"        => 388,
      "y"        => 304,
      "a"        => -14
    ],
    935  => [
      "lane"     => 1,
      "position" => 54,
      "x"        => 464,
      "y"        => 309,
      "a"        => 26
    ],
    937  => [
      "lane"     => 2,
      "position" => 52,
      "x"        => 306,
      "y"        => 333,
      "a"        => -66
    ],
    939  => [
      "lane"     => 1,
      "position" => 28,
      "x"        => 973,
      "y"        => 348,
      "a"        => 98
    ],
    941  => [
      "lane"     => 2,
      "position" => 55,
      "x"        => 542,
      "y"        => 344,
      "a"        => 65
    ],
    943  => [
      "lane"     => 1,
      "position" => 52,
      "x"        => 335,
      "y"        => 351,
      "a"        => -67
    ],
    945  => [
      "lane"     => 2,
      "position" => 15,
      "x"        => 1355,
      "y"        => 346,
      "a"        => 290
    ],
    947  => [
      "lane"     => 2,
      "position" => 28,
      "x"        => 1008,
      "y"        => 354,
      "a"        => 99
    ],
    949  => [
      "lane"     => 1,
      "position" => 15,
      "x"        => 1391,
      "y"        => 357,
      "a"        => -72
    ],
    951  => [
      "lane"     => 1,
      "position" => 55,
      "x"        => 510,
      "y"        => 361,
      "a"        => 64
    ],
    953  => [
      "lane"     => 1,
      "position" => 29,
      "x"        => 965,
      "y"        => 419,
      "a"        => 95
    ],
    955  => [
      "lane"     => 2,
      "position" => 51,
      "x"        => 284,
      "y"        => 415,
      "a"        => -84
    ],
    957  => [
      "lane"     => 2,
      "position" => 29,
      "x"        => 999,
      "y"        => 424,
      "a"        => 92
    ],
    959  => [
      "lane"     => 1,
      "position" => 51,
      "x"        => 319,
      "y"        => 421,
      "a"        => -82
    ],
    961  => [
      "lane"     => 2,
      "position" => 56,
      "x"        => 570,
      "y"        => 418,
      "a"        => 69
    ],
    963  => [
      "lane"     => 1,
      "position" => 14,
      "x"        => 1379,
      "y"        => 433,
      "a"        => 268
    ],
    965  => [
      "lane"     => 1,
      "position" => 56,
      "x"        => 539,
      "y"        => 433,
      "a"        => 68
    ],
    967  => [
      "lane"     => 2,
      "position" => 14,
      "x"        => 1343,
      "y"        => 433,
      "a"        => 267
    ],
    969  => [
      "lane"     => 2,
      "position" => 57,
      "x"        => 609,
      "y"        => 482,
      "a"        => 46
    ],
    971  => [
      "lane"     => 1,
      "position" => 30,
      "x"        => 959,
      "y"        => 486,
      "a"        => 97
    ],
    973  => [
      "lane"     => 2,
      "position" => 50,
      "x"        => 275,
      "y"        => 486,
      "a"        => -82
    ],
    975  => [
      "lane"     => 2,
      "position" => 30,
      "x"        => 993,
      "y"        => 492,
      "a"        => 95
    ],
    977  => [
      "lane"     => 1,
      "position" => 50,
      "x"        => 309,
      "y"        => 494,
      "a"        => -82
    ],
    979  => [
      "lane"     => 2,
      "position" => 58,
      "x"        => 672,
      "y"        => 519,
      "a"        => 13
    ],
    981  => [
      "lane"     => 1,
      "position" => 57,
      "x"        => 584,
      "y"        => 506,
      "a"        => 48
    ],
    983  => [
      "lane"     => 1,
      "position" => 13,
      "x"        => 1392,
      "y"        => 509,
      "a"        => 248
    ],
    985  => [
      "lane"     => 2,
      "position" => 59,
      "x"        => 742,
      "y"        => 532,
      "a"        => 8
    ],
    987  => [
      "lane"     => 2,
      "position" => 60,
      "x"        => 810,
      "y"        => 543,
      "a"        => 11
    ],
    989  => [
      "lane"     => 2,
      "position" => 13,
      "x"        => 1361,
      "y"        => 523,
      "a"        => 249
    ],
    991  => [
      "lane"     => 2,
      "position" => 1,
      "x"        => 889,
      "y"        => 555,
      "a"        => 8
    ],
    993  => [
      "lane"     => 1,
      "position" => 58,
      "x"        => 659,
      "y"        => 552,
      "a"        => 15
    ],
    995  => [
      "lane"     => 1,
      "position" => 59,
      "x"        => 736,
      "y"        => 568,
      "a"        => 7
    ],
    997  => [
      "lane"     => 2,
      "position" => 49,
      "x"        => 255,
      "y"        => 555,
      "a"        => -60
    ],
    999  => [
      "lane"     => 2,
      "position" => 2,
      "x"        => 962,
      "y"        => 570,
      "a"        => 12
    ],
    1001 => [
      "lane"     => 1,
      "position" => 12,
      "x"        => 1451,
      "y"        => 566,
      "a"        => 197
    ],
    1003 => [
      "lane"     => 1,
      "position" => 60,
      "x"        => 804,
      "y"        => 579,
      "a"        => 9
    ],
    1005 => [
      "lane"     => 1,
      "position" => 1,
      "x"        => 882,
      "y"        => 591,
      "a"        => 9
    ],
    1007 => [
      "lane"     => 1,
      "position" => 49,
      "x"        => 288,
      "y"        => 569,
      "a"        => -62
    ],
    1009 => [
      "lane"     => 2,
      "position" => 3,
      "x"        => 1035,
      "y"        => 592,
      "a"        => 19
    ],
    1011 => [
      "lane"     => 2,
      "position" => 12,
      "x"        => 1431,
      "y"        => 595,
      "a"        => 200
    ],
    1013 => [
      "lane"     => 1,
      "position" => 2,
      "x"        => 953,
      "y"        => 604,
      "a"        => 13
    ],
    1015 => [
      "lane"     => 1,
      "position" => 3,
      "x"        => 1022,
      "y"        => 624,
      "a"        => 20
    ],
    1017 => [
      "lane"     => 2,
      "position" => 48,
      "x"        => 212,
      "y"        => 615,
      "a"        => -48
    ],
    1019 => [
      "lane"     => 2,
      "position" => 4,
      "x"        => 1105,
      "y"        => 623,
      "a"        => 28
    ],
    1021 => [
      "lane"     => 2,
      "position" => 11,
      "x"        => 1504,
      "y"        => 638,
      "a"        => 249
    ],
    1023 => [
      "lane"     => 1,
      "position" => 48,
      "x"        => 241,
      "y"        => 636,
      "a"        => -47
    ],
    1025 => [
      "lane"     => 1,
      "position" => 11,
      "x"        => 1535,
      "y"        => 622,
      "a"        => 244
    ],
    1027 => [
      "lane"     => 1,
      "position" => 4,
      "x"        => 1088,
      "y"        => 655,
      "a"        => 28
    ],
    1029 => [
      "lane"     => 2,
      "position" => 5,
      "x"        => 1168,
      "y"        => 662,
      "a"        => 32
    ],
    1031 => [
      "lane"     => 2,
      "position" => 47,
      "x"        => 159,
      "y"        => 676,
      "a"        => -48
    ],
    1033 => [
      "lane"     => 1,
      "position" => 31,
      "x"        => 918,
      "y"        => 684,
      "a"        => 103
    ],
    1035 => [
      "lane"     => 1,
      "position" => 5,
      "x"        => 1150,
      "y"        => 693,
      "a"        => 33
    ],
    1037 => [
      "lane"     => 2,
      "position" => 31,
      "x"        => 951,
      "y"        => 693,
      "a"        => 104
    ],
    1039 => [
      "lane"     => 2,
      "position" => 6,
      "x"        => 1230,
      "y"        => 700,
      "a"        => 31
    ],
    1041 => [
      "lane"     => 1,
      "position" => 47,
      "x"        => 188,
      "y"        => 697,
      "a"        => -49
    ],
    1043 => [
      "lane"     => 2,
      "position" => 10,
      "x"        => 1494,
      "y"        => 710,
      "a"        => -52
    ],
    1045 => [
      "lane"     => 2,
      "position" => 7,
      "x"        => 1294,
      "y"        => 730,
      "a"        => 20
    ],
    1047 => [
      "lane"     => 1,
      "position" => 6,
      "x"        => 1213,
      "y"        => 732,
      "a"        => 27
    ],
    1049 => [
      "lane"     => 2,
      "position" => 9,
      "x"        => 1434,
      "y"        => 749,
      "a"        => -11
    ],
    1051 => [
      "lane"     => 2,
      "position" => 8,
      "x"        => 1361,
      "y"        => 749,
      "a"        => 8
    ],
    1053 => [
      "lane"     => 1,
      "position" => 10,
      "x"        => 1522,
      "y"        => 728,
      "a"        => -55
    ],
    1055 => [
      "lane"     => 1,
      "position" => 32,
      "x"        => 898,
      "y"        => 749,
      "a"        => 106
    ],
    1057 => [
      "lane"     => 2,
      "position" => 46,
      "x"        => 115,
      "y"        => 747,
      "a"        => -67
    ],
    1059 => [
      "lane"     => 1,
      "position" => 7,
      "x"        => 1281,
      "y"        => 763,
      "a"        => 20
    ],
    1061 => [
      "lane"     => 1,
      "position" => 46,
      "x"        => 149,
      "y"        => 759,
      "a"        => 290
    ],
    1063 => [
      "lane"     => 2,
      "position" => 32,
      "x"        => 932,
      "y"        => 758,
      "a"        => 107
    ],
    1065 => [
      "lane"     => 1,
      "position" => 9,
      "x"        => 1444,
      "y"        => 781,
      "a"        => -11
    ],
    1067 => [
      "lane"     => 1,
      "position" => 8,
      "x"        => 1357,
      "y"        => 785,
      "a"        => 9
    ],
    1069 => [
      "lane"     => 1,
      "position" => 33,
      "x"        => 874,
      "y"        => 813,
      "a"        => 112
    ],
    1071 => [
      "lane"     => 2,
      "position" => 33,
      "x"        => 906,
      "y"        => 829,
      "a"        => 114
    ],
    1073 => [
      "lane"     => 1,
      "position" => 45,
      "x"        => 138,
      "y"        => 833,
      "a"        => 266
    ],
    1075 => [
      "lane"     => 2,
      "position" => 45,
      "x"        => 102,
      "y"        => 835,
      "a"        => 269
    ],
    1077 => [
      "lane"     => 1,
      "position" => 34,
      "x"        => 836,
      "y"        => 873,
      "a"        => 133
    ],
    1079 => [
      "lane"     => 2,
      "position" => 34,
      "x"        => 862,
      "y"        => 896,
      "a"        => 132
    ],
    1081 => [
      "lane"     => 1,
      "position" => 44,
      "x"        => 157,
      "y"        => 903,
      "a"        => 236
    ],
    1083 => [
      "lane"     => 1,
      "position" => 35,
      "x"        => 779,
      "y"        => 917,
      "a"        => 147
    ],
    1085 => [
      "lane"     => 2,
      "position" => 44,
      "x"        => 127,
      "y"        => 922,
      "a"        => 238
    ],
    1087 => [
      "lane"     => 1,
      "position" => 36,
      "x"        => 714,
      "y"        => 950,
      "a"        => 160
    ],
    1089 => [
      "lane"     => 2,
      "position" => 35,
      "x"        => 798,
      "y"        => 947,
      "a"        => 149
    ],
    1091 => [
      "lane"     => 1,
      "position" => 43,
      "x"        => 211,
      "y"        => 952,
      "a"        => 208
    ],
    1093 => [
      "lane"     => 1,
      "position" => 37,
      "x"        => 644,
      "y"        => 969,
      "a"        => 169
    ],
    1095 => [
      "lane"     => 1,
      "position" => 42,
      "x"        => 281,
      "y"        => 975,
      "a"        => 192
    ],
    1097 => [
      "lane"     => 1,
      "position" => 38,
      "x"        => 572,
      "y"        => 980,
      "a"        => 173
    ],
    1099 => [
      "lane"     => 1,
      "position" => 39,
      "x"        => 498,
      "y"        => 986,
      "a"        => 179
    ],
    1101 => [
      "lane"     => 1,
      "position" => 40,
      "x"        => 425,
      "y"        => 987,
      "a"        => 181
    ],
    1103 => [
      "lane"     => 1,
      "position" => 41,
      "x"        => 352,
      "y"        => 983,
      "a"        => 182
    ],
    1105 => [
      "lane"     => 2,
      "position" => 36,
      "x"        => 727,
      "y"        => 983,
      "a"        => 160
    ],
    1107 => [
      "lane"     => 2,
      "position" => 43,
      "x"        => 195,
      "y"        => 983,
      "a"        => 208
    ],
    1109 => [
      "lane"     => 2,
      "position" => 37,
      "x"        => 651,
      "y"        => 1005,
      "a"        => 166
    ],
    1111 => [
      "lane"     => 2,
      "position" => 42,
      "x"        => 275,
      "y"        => 1011,
      "a"        => 191
    ],
    1113 => [
      "lane"     => 2,
      "position" => 38,
      "x"        => 575,
      "y"        => 1015,
      "a"        => 171
    ],
    1115 => [
      "lane"     => 2,
      "position" => 41,
      "x"        => 351,
      "y"        => 1019,
      "a"        => 182
    ],
    1117 => [
      "lane"     => 2,
      "position" => 40,
      "x"        => 425,
      "y"        => 1022,
      "a"        => 179
    ],
    1119 => [
      "lane"     => 2,
      "position" => 39,
      "x"        => 499,
      "y"        => 1022,
      "a"        => 179
    ]
  ]
];