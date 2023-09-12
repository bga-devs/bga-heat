<?php
namespace HEAT\Circuits;

$circuitDatas = [
  'id' => 'USA',
  'name' => clienttranslate('USA'),
  'jpgUrl' => 'circuits/usa.jpg',
  'stressCards' => 3,
  'heatCards' => 6,
  'nbrLaps' => 2,
  'corners' => [
    [
      'position' => 12,
      'speed' => 7,
      'x' => 1604,
      'y' => 948,
      'lane' => 2,
      'legend' => 2,
      'tentX' => 1571,
      'tentY' => 1009,
      'sectorTentX' => 866,
      'sectorTentY' => 894,
    ],
    [
      'position' => 33,
      'speed' => 3,
      'x' => 87,
      'y' => 1019,
      'lane' => 2,
      'legend' => 27,
      'tentX' => 53,
      'tentY' => 958,
      'sectorTentX' => 395,
      'sectorTentY' => 990,
    ],
    [
      'position' => 49,
      'speed' => 3,
      'x' => 786,
      'y' => 35,
      'lane' => 2,
      'legend' => 43,
      'tentX' => 864,
      'tentY' => 61,
      'sectorTentX' => 924,
      'sectorTentY' => 219,
    ],
    [
      'position' => 57,
      'speed' => 2,
      'x' => 527,
      'y' => 649,
      'lane' => 1,
      'legend' => 52,
      'tentX' => 585,
      'tentY' => 749,
      'sectorTentX' => 1517,
      'sectorTentY' => 272,
    ],
  ],
  'weatherCardPos' => ['x' => 119, 'y' => 288],
  'podium' => ['x' => 376, 'y' => 82, 'a' => 0],

  'startingCells' => [831, 839, 833, 843, 847, 855, 861, 869],

  'cells' => [
    817 => [
      'lane' => 1,
      'position' => 49,
      'x' => 721,
      'y' => 88,
      'a' => -13,
    ],
    821 => [
      'lane' => 2,
      'position' => 49,
      'x' => 726,
      'y' => 120,
      'a' => -13,
    ],
    823 => [
      'lane' => 1,
      'position' => 50,
      'x' => 817,
      'y' => 113,
      'a' => 39,
    ],
    825 => [
      'lane' => 2,
      'position' => 50,
      'x' => 796,
      'y' => 137,
      'a' => 39,
    ],
    827 => [
      'lane' => 1,
      'position' => 48,
      'x' => 644,
      'y' => 133,
      'a' => -51,
    ],
    829 => [
      'lane' => 2,
      'position' => 48,
      'x' => 667,
      'y' => 156,
      'a' => -52,
    ],
    831 => [
      'lane' => 1,
      'position' => 69,
      'x' => 1208,
      'y' => 183,
      'a' => 2,
    ],
    833 => [
      'lane' => 1,
      'position' => 68,
      'x' => 1133,
      'y' => 188,
      'a' => -8,
    ],
    835 => [
      'lane' => 1,
      'position' => 1,
      'x' => 1289,
      'y' => 194,
      'a' => 16,
    ],
    837 => [
      'lane' => 1,
      'position' => 47,
      'x' => 595,
      'y' => 193,
      'a' => -52,
    ],
    839 => [
      'lane' => 2,
      'position' => 69,
      'x' => 1206,
      'y' => 218,
      'a' => 1,
    ],
    841 => [
      'lane' => 2,
      'position' => 51,
      'x' => 826,
      'y' => 201,
      'a' => 89,
    ],
    843 => [
      'lane' => 2,
      'position' => 68,
      'x' => 1139,
      'y' => 223,
      'a' => -10,
    ],
    845 => [
      'lane' => 2,
      'position' => 47,
      'x' => 624,
      'y' => 213,
      'a' => -53,
    ],
    847 => [
      'lane' => 1,
      'position' => 67,
      'x' => 1054,
      'y' => 214,
      'a' => -32,
    ],
    849 => [
      'lane' => 1,
      'position' => 51,
      'x' => 858,
      'y' => 200,
      'a' => 88,
    ],
    851 => [
      'lane' => 2,
      'position' => 1,
      'x' => 1279,
      'y' => 228,
      'a' => 16,
    ],
    853 => [
      'lane' => 1,
      'position' => 2,
      'x' => 1360,
      'y' => 224,
      'a' => 29,
    ],
    855 => [
      'lane' => 2,
      'position' => 67,
      'x' => 1072,
      'y' => 247,
      'a' => -31,
    ],
    857 => [
      'lane' => 2,
      'position' => 2,
      'x' => 1341,
      'y' => 254,
      'a' => 29,
    ],
    859 => [
      'lane' => 1,
      'position' => 46,
      'x' => 557,
      'y' => 251,
      'a' => -60,
    ],
    861 => [
      'lane' => 1,
      'position' => 66,
      'x' => 991,
      'y' => 265,
      'a' => -44,
    ],
    863 => [
      'lane' => 2,
      'position' => 46,
      'x' => 588,
      'y' => 270,
      'a' => -61,
    ],
    865 => [
      'lane' => 1,
      'position' => 3,
      'x' => 1421,
      'y' => 271,
      'a' => 44,
    ],
    867 => [
      'lane' => 2,
      'position' => 52,
      'x' => 804,
      'y' => 269,
      'a' => 123,
    ],
    869 => [
      'lane' => 2,
      'position' => 66,
      'x' => 1018,
      'y' => 290,
      'a' => -43,
    ],
    871 => [
      'lane' => 1,
      'position' => 52,
      'x' => 833,
      'y' => 287,
      'a' => 123,
    ],
    873 => [
      'lane' => 2,
      'position' => 3,
      'x' => 1397,
      'y' => 296,
      'a' => 45,
    ],
    875 => [
      'lane' => 1,
      'position' => 45,
      'x' => 526,
      'y' => 313,
      'a' => -65,
    ],
    877 => [
      'lane' => 1,
      'position' => 65,
      'x' => 943,
      'y' => 318,
      'a' => -49,
    ],
    879 => [
      'lane' => 2,
      'position' => 45,
      'x' => 559,
      'y' => 328,
      'a' => -65,
    ],
    881 => [
      'lane' => 2,
      'position' => 53,
      'x' => 760,
      'y' => 330,
      'a' => 123,
    ],
    883 => [
      'lane' => 1,
      'position' => 4,
      'x' => 1466,
      'y' => 333,
      'a' => 64,
    ],
    885 => [
      'lane' => 2,
      'position' => 65,
      'x' => 972,
      'y' => 342,
      'a' => -49,
    ],
    887 => [
      'lane' => 1,
      'position' => 53,
      'x' => 789,
      'y' => 350,
      'a' => 126,
    ],
    889 => [
      'lane' => 2,
      'position' => 4,
      'x' => 1437,
      'y' => 351,
      'a' => 63,
    ],
    891 => [
      'lane' => 1,
      'position' => 64,
      'x' => 899,
      'y' => 373,
      'a' => -52,
    ],
    893 => [
      'lane' => 1,
      'position' => 44,
      'x' => 500,
      'y' => 375,
      'a' => -69,
    ],
    895 => [
      'lane' => 2,
      'position' => 44,
      'x' => 534,
      'y' => 389,
      'a' => -70,
    ],
    897 => [
      'lane' => 2,
      'position' => 64,
      'x' => 929,
      'y' => 394,
      'a' => -52,
    ],
    899 => [
      'lane' => 2,
      'position' => 54,
      'x' => 720,
      'y' => 393,
      'a' => 119,
    ],
    901 => [
      'lane' => 1,
      'position' => 5,
      'x' => 1495,
      'y' => 401,
      'a' => 69,
    ],
    903 => [
      'lane' => 2,
      'position' => 5,
      'x' => 1464,
      'y' => 413,
      'a' => 69,
    ],
    905 => [
      'lane' => 1,
      'position' => 54,
      'x' => 749,
      'y' => 411,
      'a' => 122,
    ],
    907 => [
      'lane' => 1,
      'position' => 63,
      'x' => 858,
      'y' => 428,
      'a' => -53,
    ],
    909 => [
      'lane' => 1,
      'position' => 43,
      'x' => 477,
      'y' => 439,
      'a' => -71,
    ],
    911 => [
      'lane' => 2,
      'position' => 63,
      'x' => 888,
      'y' => 448,
      'a' => -54,
    ],
    913 => [
      'lane' => 2,
      'position' => 43,
      'x' => 512,
      'y' => 451,
      'a' => -72,
    ],
    915 => [
      'lane' => 2,
      'position' => 55,
      'x' => 682,
      'y' => 456,
      'a' => 121,
    ],
    917 => [
      'lane' => 1,
      'position' => 6,
      'x' => 1517,
      'y' => 467,
      'a' => 73,
    ],
    919 => [
      'lane' => 2,
      'position' => 6,
      'x' => 1485,
      'y' => 475,
      'a' => 72,
    ],
    921 => [
      'lane' => 1,
      'position' => 55,
      'x' => 712,
      'y' => 473,
      'a' => 120,
    ],
    923 => [
      'lane' => 1,
      'position' => 62,
      'x' => 820,
      'y' => 483,
      'a' => -53,
    ],
    925 => [
      'lane' => 2,
      'position' => 62,
      'x' => 850,
      'y' => 502,
      'a' => -55,
    ],
    927 => [
      'lane' => 1,
      'position' => 42,
      'x' => 458,
      'y' => 503,
      'a' => -72,
    ],
    929 => [
      'lane' => 2,
      'position' => 42,
      'x' => 492,
      'y' => 513,
      'a' => -72,
    ],
    931 => [
      'lane' => 2,
      'position' => 56,
      'x' => 647,
      'y' => 515,
      'a' => 122,
    ],
    933 => [
      'lane' => 1,
      'position' => 7,
      'x' => 1534,
      'y' => 532,
      'a' => 78,
    ],
    935 => [
      'lane' => 1,
      'position' => 56,
      'x' => 675,
      'y' => 534,
      'a' => 122,
    ],
    937 => [
      'lane' => 1,
      'position' => 61,
      'x' => 784,
      'y' => 537,
      'a' => -57,
    ],
    939 => [
      'lane' => 2,
      'position' => 7,
      'x' => 1502,
      'y' => 539,
      'a' => 76,
    ],
    941 => [
      'lane' => 2,
      'position' => 61,
      'x' => 814,
      'y' => 556,
      'a' => -57,
    ],
    943 => [
      'lane' => 1,
      'position' => 41,
      'x' => 440,
      'y' => 565,
      'a' => -73,
    ],
    945 => [
      'lane' => 2,
      'position' => 41,
      'x' => 473,
      'y' => 575,
      'a' => -72,
    ],
    947 => [
      'lane' => 1,
      'position' => 60,
      'x' => 750,
      'y' => 590,
      'a' => -59,
    ],
    949 => [
      'lane' => 1,
      'position' => 57,
      'x' => 634,
      'y' => 594,
      'a' => 123,
    ],
    951 => [
      'lane' => 1,
      'position' => 8,
      'x' => 1548,
      'y' => 597,
      'a' => 79,
    ],
    953 => [
      'lane' => 2,
      'position' => 57,
      'x' => 601,
      'y' => 587,
      'a' => 124,
    ],
    955 => [
      'lane' => 2,
      'position' => 8,
      'x' => 1516,
      'y' => 603,
      'a' => 78,
    ],
    957 => [
      'lane' => 2,
      'position' => 60,
      'x' => 778,
      'y' => 609,
      'a' => -57,
    ],
    959 => [
      'lane' => 1,
      'position' => 40,
      'x' => 420,
      'y' => 626,
      'a' => -71,
    ],
    961 => [
      'lane' => 2,
      'position' => 40,
      'x' => 452,
      'y' => 638,
      'a' => -71,
    ],
    963 => [
      'lane' => 1,
      'position' => 59,
      'x' => 712,
      'y' => 650,
      'a' => -58,
    ],
    965 => [
      'lane' => 1,
      'position' => 58,
      'x' => 649,
      'y' => 657,
      'a' => 34,
    ],
    967 => [
      'lane' => 1,
      'position' => 9,
      'x' => 1561,
      'y' => 662,
      'a' => 79,
    ],
    969 => [
      'lane' => 2,
      'position' => 9,
      'x' => 1528,
      'y' => 667,
      'a' => 80,
    ],
    971 => [
      'lane' => 2,
      'position' => 59,
      'x' => 732,
      'y' => 678,
      'a' => -59,
    ],
    973 => [
      'lane' => 2,
      'position' => 58,
      'x' => 634,
      'y' => 683,
      'a' => 34,
    ],
    975 => [
      'lane' => 1,
      'position' => 39,
      'x' => 393,
      'y' => 689,
      'a' => -58,
    ],
    977 => [
      'lane' => 2,
      'position' => 39,
      'x' => 422,
      'y' => 707,
      'a' => -60,
    ],
    979 => [
      'lane' => 1,
      'position' => 10,
      'x' => 1572,
      'y' => 728,
      'a' => 81,
    ],
    981 => [
      'lane' => 2,
      'position' => 10,
      'x' => 1539,
      'y' => 732,
      'a' => 81,
    ],
    983 => [
      'lane' => 1,
      'position' => 38,
      'x' => 348,
      'y' => 742,
      'a' => -40,
    ],
    987 => [
      'lane' => 1,
      'position' => 37,
      'x' => 288,
      'y' => 779,
      'a' => -26,
    ],
    989 => [
      'lane' => 2,
      'position' => 38,
      'x' => 370,
      'y' => 769,
      'a' => -40,
    ],
    991 => [
      'lane' => 1,
      'position' => 36,
      'x' => 216,
      'y' => 798,
      'a' => -9,
    ],
    993 => [
      'lane' => 2,
      'position' => 11,
      'x' => 1545,
      'y' => 799,
      'a' => 87,
    ],
    995 => [
      'lane' => 1,
      'position' => 11,
      'x' => 1579,
      'y' => 800,
      'a' => 87,
    ],
    997 => [
      'lane' => 2,
      'position' => 37,
      'x' => 302,
      'y' => 811,
      'a' => -22,
    ],
    999 => [
      'lane' => 2,
      'position' => 36,
      'x' => 227,
      'y' => 830,
      'a' => -9,
    ],
    1001 => [
      'lane' => 1,
      'position' => 35,
      'x' => 140,
      'y' => 844,
      'a' => 311,
    ],
    1003 => [
      'lane' => 2,
      'position' => 35,
      'x' => 165,
      'y' => 865,
      'a' => 311,
    ],
    1005 => [
      'lane' => 2,
      'position' => 12,
      'x' => 1536,
      'y' => 867,
      'a' => 106,
    ],
    1007 => [
      'lane' => 1,
      'position' => 12,
      'x' => 1568,
      'y' => 878,
      'a' => 110,
    ],
    1009 => [
      'lane' => 2,
      'position' => 13,
      'x' => 1502,
      'y' => 928,
      'a' => 131,
    ],
    1011 => [
      'lane' => 2,
      'position' => 34,
      'x' => 146,
      'y' => 932,
      'a' => 259,
    ],
    1013 => [
      'lane' => 1,
      'position' => 13,
      'x' => 1526,
      'y' => 950,
      'a' => 132,
    ],
    1015 => [
      'lane' => 1,
      'position' => 34,
      'x' => 114,
      'y' => 937,
      'a' => 259,
    ],
    1017 => [
      'lane' => 2,
      'position' => 14,
      'x' => 1447,
      'y' => 970,
      'a' => 153,
    ],
    1019 => [
      'lane' => 2,
      'position' => 20,
      'x' => 1051,
      'y' => 983,
      'a' => 180,
    ],
    1021 => [
      'lane' => 2,
      'position' => 19,
      'x' => 1117,
      'y' => 984,
      'a' => 180,
    ],
    1023 => [
      'lane' => 2,
      'position' => 28,
      'x' => 526,
      'y' => 984,
      'a' => 181,
    ],
    1025 => [
      'lane' => 2,
      'position' => 29,
      'x' => 460,
      'y' => 984,
      'a' => 177,
    ],
    1027 => [
      'lane' => 2,
      'position' => 21,
      'x' => 984,
      'y' => 984,
      'a' => 176,
    ],
    1029 => [
      'lane' => 2,
      'position' => 18,
      'x' => 1183,
      'y' => 986,
      'a' => 181,
    ],
    1031 => [
      'lane' => 2,
      'position' => 27,
      'x' => 591,
      'y' => 986,
      'a' => 182,
    ],
    1033 => [
      'lane' => 2,
      'position' => 17,
      'x' => 1248,
      'y' => 988,
      'a' => 182,
    ],
    1035 => [
      'lane' => 2,
      'position' => 30,
      'x' => 393,
      'y' => 987,
      'a' => 177,
    ],
    1037 => [
      'lane' => 2,
      'position' => 22,
      'x' => 918,
      'y' => 988,
      'a' => 178,
    ],
    1039 => [
      'lane' => 2,
      'position' => 26,
      'x' => 657,
      'y' => 989,
      'a' => 183,
    ],
    1041 => [
      'lane' => 2,
      'position' => 15,
      'x' => 1381,
      'y' => 989,
      'a' => 175,
    ],
    1043 => [
      'lane' => 2,
      'position' => 16,
      'x' => 1314,
      'y' => 990,
      'a' => 181,
    ],
    1045 => [
      'lane' => 2,
      'position' => 23,
      'x' => 853,
      'y' => 991,
      'a' => 178,
    ],
    1047 => [
      'lane' => 2,
      'position' => 25,
      'x' => 723,
      'y' => 992,
      'a' => 183,
    ],
    1049 => [
      'lane' => 2,
      'position' => 24,
      'x' => 788,
      'y' => 992,
      'a' => 180,
    ],
    1051 => [
      'lane' => 2,
      'position' => 31,
      'x' => 326,
      'y' => 992,
      'a' => 175,
    ],
    1053 => [
      'lane' => 2,
      'position' => 33,
      'x' => 187,
      'y' => 990,
      'a' => 209,
    ],
    1055 => [
      'lane' => 2,
      'position' => 32,
      'x' => 257,
      'y' => 1002,
      'a' => 170,
    ],
    1057 => [
      'lane' => 1,
      'position' => 14,
      'x' => 1462,
      'y' => 1000,
      'a' => 152,
    ],
    1059 => [
      'lane' => 1,
      'position' => 20,
      'x' => 1051,
      'y' => 1018,
      'a' => 180,
    ],
    1061 => [
      'lane' => 1,
      'position' => 28,
      'x' => 525,
      'y' => 1019,
      'a' => 180,
    ],
    1063 => [
      'lane' => 1,
      'position' => 19,
      'x' => 1116,
      'y' => 1019,
      'a' => 182,
    ],
    1065 => [
      'lane' => 1,
      'position' => 29,
      'x' => 460,
      'y' => 1019,
      'a' => 178,
    ],
    1067 => [
      'lane' => 1,
      'position' => 21,
      'x' => 985,
      'y' => 1019,
      'a' => 176,
    ],
    1069 => [
      'lane' => 1,
      'position' => 18,
      'x' => 1181,
      'y' => 1021,
      'a' => 182,
    ],
    1071 => [
      'lane' => 1,
      'position' => 27,
      'x' => 590,
      'y' => 1020,
      'a' => 181,
    ],
    1073 => [
      'lane' => 1,
      'position' => 30,
      'x' => 396,
      'y' => 1021,
      'a' => 177,
    ],
    1075 => [
      'lane' => 1,
      'position' => 17,
      'x' => 1247,
      'y' => 1023,
      'a' => 180,
    ],
    1077 => [
      'lane' => 1,
      'position' => 22,
      'x' => 920,
      'y' => 1023,
      'a' => 177,
    ],
    1079 => [
      'lane' => 1,
      'position' => 26,
      'x' => 656,
      'y' => 1024,
      'a' => 183,
    ],
    1081 => [
      'lane' => 1,
      'position' => 15,
      'x' => 1386,
      'y' => 1023,
      'a' => 175,
    ],
    1083 => [
      'lane' => 1,
      'position' => 16,
      'x' => 1314,
      'y' => 1025,
      'a' => 181,
    ],
    1085 => [
      'lane' => 1,
      'position' => 23,
      'x' => 854,
      'y' => 1026,
      'a' => 176,
    ],
    1087 => [
      'lane' => 1,
      'position' => 24,
      'x' => 788,
      'y' => 1027,
      'a' => 179,
    ],
    1089 => [
      'lane' => 1,
      'position' => 25,
      'x' => 722,
      'y' => 1027,
      'a' => 181,
    ],
    1091 => [
      'lane' => 1,
      'position' => 31,
      'x' => 331,
      'y' => 1026,
      'a' => 173,
    ],
    1093 => [
      'lane' => 1,
      'position' => 33,
      'x' => 171,
      'y' => 1018,
      'a' => 207,
    ],
    1095 => [
      'lane' => 1,
      'position' => 32,
      'x' => 257,
      'y' => 1036,
      'a' => 170,
    ],
  ],
];
