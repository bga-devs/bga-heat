<?php
namespace HEAT\Circuits;

class USA extends \HEAT\Models\Circuit
{
  protected $corners = [
    12 => 7,
    33 => 3,
    49 => 3,
    57 => 2,
  ];

  protected $startingCells = [831, 839, 833, 843, 847, 855, 861, 869];

  protected $cells = [
    817 => [
      'lane' => 1,
      'pos' => 49,
    ],
    821 => [
      'lane' => 2,
      'pos' => 49,
    ],
    823 => [
      'lane' => 1,
      'pos' => 50,
    ],
    825 => [
      'lane' => 2,
      'pos' => 50,
    ],
    827 => [
      'lane' => 1,
      'pos' => 48,
    ],
    829 => [
      'lane' => 2,
      'pos' => 48,
    ],
    831 => [
      'lane' => 1,
      'pos' => 69,
    ],
    833 => [
      'lane' => 1,
      'pos' => 68,
    ],
    835 => [
      'lane' => 1,
      'pos' => 1,
    ],
    837 => [
      'lane' => 1,
      'pos' => 47,
    ],
    839 => [
      'lane' => 2,
      'pos' => 69,
    ],
    841 => [
      'lane' => 2,
      'pos' => 51,
    ],
    843 => [
      'lane' => 2,
      'pos' => 68,
    ],
    845 => [
      'lane' => 2,
      'pos' => 47,
    ],
    847 => [
      'lane' => 1,
      'pos' => 67,
    ],
    849 => [
      'lane' => 1,
      'pos' => 51,
    ],
    851 => [
      'lane' => 2,
      'pos' => 1,
    ],
    853 => [
      'lane' => 1,
      'pos' => 2,
    ],
    855 => [
      'lane' => 2,
      'pos' => 67,
    ],
    857 => [
      'lane' => 2,
      'pos' => 2,
    ],
    859 => [
      'lane' => 1,
      'pos' => 46,
    ],
    861 => [
      'lane' => 1,
      'pos' => 66,
    ],
    863 => [
      'lane' => 2,
      'pos' => 46,
    ],
    865 => [
      'lane' => 1,
      'pos' => 3,
    ],
    867 => [
      'lane' => 2,
      'pos' => 52,
    ],
    869 => [
      'lane' => 2,
      'pos' => 66,
    ],
    871 => [
      'lane' => 1,
      'pos' => 52,
    ],
    873 => [
      'lane' => 2,
      'pos' => 3,
    ],
    875 => [
      'lane' => 1,
      'pos' => 45,
    ],
    877 => [
      'lane' => 1,
      'pos' => 65,
    ],
    879 => [
      'lane' => 2,
      'pos' => 45,
    ],
    881 => [
      'lane' => 2,
      'pos' => 53,
    ],
    883 => [
      'lane' => 1,
      'pos' => 4,
    ],
    885 => [
      'lane' => 2,
      'pos' => 65,
    ],
    887 => [
      'lane' => 1,
      'pos' => 53,
    ],
    889 => [
      'lane' => 2,
      'pos' => 4,
    ],
    891 => [
      'lane' => 1,
      'pos' => 64,
    ],
    893 => [
      'lane' => 1,
      'pos' => 44,
    ],
    895 => [
      'lane' => 2,
      'pos' => 44,
    ],
    897 => [
      'lane' => 2,
      'pos' => 64,
    ],
    899 => [
      'lane' => 2,
      'pos' => 54,
    ],
    901 => [
      'lane' => 1,
      'pos' => 5,
    ],
    903 => [
      'lane' => 2,
      'pos' => 5,
    ],
    905 => [
      'lane' => 1,
      'pos' => 54,
    ],
    907 => [
      'lane' => 1,
      'pos' => 63,
    ],
    909 => [
      'lane' => 1,
      'pos' => 43,
    ],
    911 => [
      'lane' => 2,
      'pos' => 63,
    ],
    913 => [
      'lane' => 2,
      'pos' => 43,
    ],
    915 => [
      'lane' => 2,
      'pos' => 55,
    ],
    917 => [
      'lane' => 1,
      'pos' => 6,
    ],
    919 => [
      'lane' => 2,
      'pos' => 6,
    ],
    921 => [
      'lane' => 1,
      'pos' => 55,
    ],
    923 => [
      'lane' => 1,
      'pos' => 62,
    ],
    925 => [
      'lane' => 2,
      'pos' => 62,
    ],
    927 => [
      'lane' => 1,
      'pos' => 42,
    ],
    929 => [
      'lane' => 2,
      'pos' => 42,
    ],
    931 => [
      'lane' => 2,
      'pos' => 56,
    ],
    933 => [
      'lane' => 1,
      'pos' => 7,
    ],
    935 => [
      'lane' => 1,
      'pos' => 56,
    ],
    937 => [
      'lane' => 1,
      'pos' => 61,
    ],
    939 => [
      'lane' => 2,
      'pos' => 7,
    ],
    941 => [
      'lane' => 2,
      'pos' => 61,
    ],
    943 => [
      'lane' => 1,
      'pos' => 41,
    ],
    945 => [
      'lane' => 2,
      'pos' => 41,
    ],
    947 => [
      'lane' => 1,
      'pos' => 60,
    ],
    949 => [
      'lane' => 1,
      'pos' => 57,
    ],
    951 => [
      'lane' => 1,
      'pos' => 8,
    ],
    953 => [
      'lane' => 2,
      'pos' => 57,
    ],
    955 => [
      'lane' => 2,
      'pos' => 8,
    ],
    957 => [
      'lane' => 2,
      'pos' => 60,
    ],
    959 => [
      'lane' => 1,
      'pos' => 40,
    ],
    961 => [
      'lane' => 2,
      'pos' => 40,
    ],
    963 => [
      'lane' => 1,
      'pos' => 59,
    ],
    965 => [
      'lane' => 1,
      'pos' => 58,
    ],
    967 => [
      'lane' => 1,
      'pos' => 9,
    ],
    969 => [
      'lane' => 2,
      'pos' => 9,
    ],
    971 => [
      'lane' => 2,
      'pos' => 59,
    ],
    973 => [
      'lane' => 2,
      'pos' => 58,
    ],
    975 => [
      'lane' => 1,
      'pos' => 39,
    ],
    977 => [
      'lane' => 2,
      'pos' => 39,
    ],
    979 => [
      'lane' => 1,
      'pos' => 10,
    ],
    981 => [
      'lane' => 2,
      'pos' => 10,
    ],
    983 => [
      'lane' => 1,
      'pos' => 38,
    ],
    987 => [
      'lane' => 1,
      'pos' => 37,
    ],
    989 => [
      'lane' => 2,
      'pos' => 38,
    ],
    991 => [
      'lane' => 1,
      'pos' => 36,
    ],
    993 => [
      'lane' => 2,
      'pos' => 11,
    ],
    995 => [
      'lane' => 1,
      'pos' => 11,
    ],
    997 => [
      'lane' => 2,
      'pos' => 37,
    ],
    999 => [
      'lane' => 2,
      'pos' => 36,
    ],
    1001 => [
      'lane' => 1,
      'pos' => 35,
    ],
    1003 => [
      'lane' => 2,
      'pos' => 35,
    ],
    1005 => [
      'lane' => 2,
      'pos' => 12,
    ],
    1007 => [
      'lane' => 1,
      'pos' => 12,
    ],
    1009 => [
      'lane' => 2,
      'pos' => 13,
    ],
    1011 => [
      'lane' => 2,
      'pos' => 34,
    ],
    1013 => [
      'lane' => 1,
      'pos' => 13,
    ],
    1015 => [
      'lane' => 1,
      'pos' => 34,
    ],
    1017 => [
      'lane' => 2,
      'pos' => 14,
    ],
    1019 => [
      'lane' => 2,
      'pos' => 20,
    ],
    1021 => [
      'lane' => 2,
      'pos' => 19,
    ],
    1023 => [
      'lane' => 2,
      'pos' => 28,
    ],
    1025 => [
      'lane' => 2,
      'pos' => 29,
    ],
    1027 => [
      'lane' => 2,
      'pos' => 21,
    ],
    1029 => [
      'lane' => 2,
      'pos' => 18,
    ],
    1031 => [
      'lane' => 2,
      'pos' => 27,
    ],
    1033 => [
      'lane' => 2,
      'pos' => 17,
    ],
    1035 => [
      'lane' => 2,
      'pos' => 30,
    ],
    1037 => [
      'lane' => 2,
      'pos' => 22,
    ],
    1039 => [
      'lane' => 2,
      'pos' => 26,
    ],
    1041 => [
      'lane' => 2,
      'pos' => 15,
    ],
    1043 => [
      'lane' => 2,
      'pos' => 16,
    ],
    1045 => [
      'lane' => 2,
      'pos' => 23,
    ],
    1047 => [
      'lane' => 2,
      'pos' => 25,
    ],
    1049 => [
      'lane' => 2,
      'pos' => 24,
    ],
    1051 => [
      'lane' => 2,
      'pos' => 31,
    ],
    1053 => [
      'lane' => 2,
      'pos' => 33,
    ],
    1055 => [
      'lane' => 2,
      'pos' => 32,
    ],
    1057 => [
      'lane' => 1,
      'pos' => 14,
    ],
    1059 => [
      'lane' => 1,
      'pos' => 20,
    ],
    1061 => [
      'lane' => 1,
      'pos' => 28,
    ],
    1063 => [
      'lane' => 1,
      'pos' => 19,
    ],
    1065 => [
      'lane' => 1,
      'pos' => 29,
    ],
    1067 => [
      'lane' => 1,
      'pos' => 21,
    ],
    1069 => [
      'lane' => 1,
      'pos' => 18,
    ],
    1071 => [
      'lane' => 1,
      'pos' => 27,
    ],
    1073 => [
      'lane' => 1,
      'pos' => 30,
    ],
    1075 => [
      'lane' => 1,
      'pos' => 17,
    ],
    1077 => [
      'lane' => 1,
      'pos' => 22,
    ],
    1079 => [
      'lane' => 1,
      'pos' => 26,
    ],
    1081 => [
      'lane' => 1,
      'pos' => 15,
    ],
    1083 => [
      'lane' => 1,
      'pos' => 16,
    ],
    1085 => [
      'lane' => 1,
      'pos' => 23,
    ],
    1087 => [
      'lane' => 1,
      'pos' => 24,
    ],
    1089 => [
      'lane' => 1,
      'pos' => 25,
    ],
    1091 => [
      'lane' => 1,
      'pos' => 31,
    ],
    1093 => [
      'lane' => 1,
      'pos' => 33,
    ],
    1095 => [
      'lane' => 1,
      'pos' => 32,
    ],
  ];
}
