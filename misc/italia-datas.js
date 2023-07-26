const ITALIA_DATAS = {
  905: { x: 1570.1783447265625, y: 187.19275665283203, a: 1.410487284849013 },
  909: { x: 1442.1268188476563, y: 189.57992095947264, a: -3.521241561657109 },
  911: { x: 1697.9221649169922, y: 192.7971477508545, a: 11.13946159467735 },
  913: { x: 1825.050375366211, y: 207.43031158447266, a: 7.293262555871229 },
  915: { x: 1309.4236907958984, y: 205.84818420410156, a: -11.804717744638392 },
  917: { x: 1953.4703094482422, y: 234.3693992614746, a: 15.417572757460961 },
  919: { x: 1569.7139373779296, y: 250.40147590637207, a: 1.0363458943949269 },
  921: { x: 1445.230776977539, y: 252.23274612426758, a: -2.741826738628341 },
  923: { x: 1692.2959777832032, y: 256.2096035003662, a: 10.923752827730134 },
  925: { x: 1179.5071044921874, y: 241.8866107940674, a: -19.595494502418042 },
  927: { x: 1321.8007446289062, y: 266.55810432434083, a: -12.236932004837668 },
  929: { x: 1813.3483276367188, y: 270.1598190307617, a: 9.867488485855041 },
  931: { x: 2080.207305908203, y: 281.704759979248, a: 27.27390329393885 },
  933: { x: 1934.8758026123046, y: 294.77842292785647, a: 13.733439955230134 },
  935: { x: 1203.8802764892578, y: 299.86287155151365, a: -20.14094173177359 },
  937: { x: 1060.4762725830078, y: 300.31651191711427, a: -32.10228233116659 },
  939: { x: 2050.7079681396485, y: 338.33712844848634, a: 26.646737181282028 },
  941: { x: 1092.5273468017579, y: 356.2620391845703, a: -31.27746763310845 },
  943: { x: 2198.7143798828124, y: 362.1483467102051, a: 41.85508583142841 },
  945: { x: 953.69453125, y: 379.6132301330566, a: -41.135063490897956 },
  947: { x: 2154.4726379394533, y: 407.9560401916504, a: 39.912981819933535 },
  949: { x: 996.6414596557618, y: 430.3761672973633, a: -42.650170141924455 },
  951: { x: 2292.7597717285157, y: 466.28170013427734, a: 54.07093524135816 },
  953: { x: 860.7400955200195, y: 476.51998748779295, a: -47.508921279532565 },
  955: { x: 2239.209997558594, y: 502.2811004638672, a: 53.25079275796778 },
  957: { x: 903.9572250366211, y: 488.58397674560547 },
  959: { x: 911.5365097045899, y: 520.04560546875, a: -49.34775387843438 },
  961: { x: 2359.6419311523437, y: 573.6099769592286, a: 62.81975343719401 },
  963: { x: 2302.127264404297, y: 601.4423217773438, a: 61.85439030972101 },
  965: { x: 783.0068466186524, y: 598.189356994629, a: -66.41327926610782 },
  967: { x: 843.194499206543, y: 624.304409790039, a: -64.23781305961366 },
  969: { x: 2410.9671630859375, y: 682.0413269042969, a: 67.64208360843625 },
  971: { x: 2352.9479736328126, y: 705.9341262817383, a: 67.0560637928295 },
  973: { x: 743.1781021118164, y: 732.710057067871, a: -79.45217789507535 },
  975: { x: 783.642610168457, y: 725.796369934082 },
  977: { x: 779.5615219116211, y: 731.244059753418 },
  979: { x: 807.4000823974609, y: 742.7024368286133, a: -79.81747502357476 },
  981: { x: 2453.191375732422, y: 794.8983551025391, a: 70.62328018818361 },
  983: { x: 2393.577740478516, y: 813.1687805175782, a: 72.55809764918001 },
  985: { x: 1244.2303833007813, y: 841.0686340332031, a: 168.15877800345606 },
  987: { x: 800.8634887695313, y: 864.8165710449218, a: 266.01912280519747 },
  989: { x: 737.4208572387695, y: 867.2452194213868, a: 268.24589840053756 },
  991: { x: 1255.011978149414, y: 895.5194671630859, a: 116.18218527527854 },
  993: { x: 2485.8037719726562, y: 925.798046875, a: 79.78120709383087 },
  995: { x: 2424.70283203125, y: 937.3246231079102, a: 79.7290045489491 },
  997: { x: 1412.559750366211, y: 912.3878173828125, a: 256.76504247778036 },
  999: { x: 1363.8382690429687, y: 949.5541076660156, a: -155.0533934651826 },
  1001: { x: 820.9592895507812, y: 981.6919876098633, a: 257.5313707006541 },
  1003: { x: 758.6000671386719, y: 993.173112487793, a: 255.80790474390136 },
  1005: { x: 1196.7702758789062, y: 988.102946472168, a: 75.4536716456089 },
  1007: { x: 1135.0346801757812, y: 983.2342636108399, a: 77.15189727960961 },
  1009: { x: 2436.5510314941407, y: 1054.968765258789, a: 89.23478855134985 },
  1011: { x: 2499.1041564941406, y: 1052.8358352661132, a: 88.94434110140665 },
  1013: { x: 1451.394464111328, y: 1057.9901733398438, a: 255.83113463658043 },
  1015: { x: 1391.3820007324218, y: 1071.2876007080079, a: 256.0816507125805 },
  1017: { x: 847.9665664672851, y: 1095.217581176758, a: 256.3966698476248 },
  1019: { x: 786.7985473632813, y: 1109.6178741455078, a: 256.19956026850963 },
  1021: { x: 1233.1630065917968, y: 1132.7960266113282, a: 76.95636039724987 },
  1023: { x: 1173.3231475830078, y: 1147.2730773925782, a: 75.74654423813836 },
  1025: { x: 1477.9987731933593, y: 1172.2990295410157, a: 256.5456765734802 },
  1027: { x: 1417.5815032958985, y: 1185.2581878662108, a: 256.6269848096472 },
  1029: { x: 2427.67880859375, y: 1178.7797302246095, a: 97.60713771111935 },
  1031: { x: 2490.155615234375, y: 1189.7913330078125, a: 98.75499825467588 },
  1033: { x: 873.9937927246094, y: 1205.2058410644531, a: 256.7245494000971 },
  1035: { x: 814.5715545654297, y: 1223.3756896972657, a: 258.952347227132 },
  1037: { x: 1503.7331604003907, y: 1284.3488800048829, a: 257.17196687501485 },
  1039: { x: 1269.8326690673828, y: 1278.2859436035155, a: 75.84696061253803 },
  1041: { x: 1443.6983551025392, y: 1298.256820678711, a: 256.93472494708266 },
  1043: { x: 1209.942367553711, y: 1292.553890991211, a: 75.41373025950995 },
  1045: { x: 2390.0525085449217, y: 1298.2874694824218, a: 113.57041140054199 },
  1047: { x: 901.9271820068359, y: 1317.5744720458983, a: 256.12678478216134 },
  1049: { x: 841.855354309082, y: 1334.3019714355469, a: 256.61577306140225 },
  1051: { x: 2449.2975646972654, y: 1325.5189453125, a: 113.34821861162166 },
  1053: { x: 1530.3200653076171, y: 1397.391928100586, a: 255.87626136563222 },
  1055: { x: 2321.4206481933593, y: 1399.3536560058594, a: 132.9299713528681 },
  1057: { x: 1470.3970489501953, y: 1411.267529296875, a: 256.81513717645714 },
  1059: { x: 1306.079293823242, y: 1412.0633666992187, a: 72.238709376876 },
  1061: { x: 927.9519943237304, y: 1431.5064880371094, a: 253.34370636621844 },
  1063: { x: 1245.6965759277343, y: 1427.6926300048829, a: 73.73849238042325 },
  1065: { x: 2370.7260498046876, y: 1439.155255126953, a: 133.91416830690915 },
  1067: { x: 866.9946319580079, y: 1445.861508178711, a: 253.23238535690933 },
  1069: { x: 2235.7296936035154, y: 1484.81572265625, a: 136.97310806891215 },
  1071: { x: 1557.7297332763671, y: 1512.2154449462892, a: 258.72717399008116 },
  1073: { x: 1498.5351257324219, y: 1526.3974609375, a: 254.08008043606668 },
  1075: { x: 2279.2826171875, y: 1529.4028900146484, a: 132.53547324586197 },
  1077: { x: 955.1686340332031, y: 1546.1381225585938, a: 256.12391929005906 },
  1079: { x: 1347.581805419922, y: 1548.440008544922, a: 68.64714938370571 },
  1081: { x: 1287.2036712646484, y: 1557.0140899658204, a: 91.86397877977602 },
  1083: { x: 2147.804412841797, y: 1566.639730834961, a: 134.54378029240192 },
  1085: { x: 895.9194686889648, y: 1563.9143035888671, a: 254.0466623982593 },
  1087: { x: 2189.6478515625, y: 1612.5619903564452, a: 137.39506932692436 },
  1089: { x: 1582.0787170410156, y: 1630.8463317871094, a: 259.37866046773854 },
  1091: { x: 2057.874331665039, y: 1646.9421417236329, a: 135.7358785866542 },
  1093: { x: 1523.6857696533202, y: 1649.007583618164, a: 258.6573428320579 },
  1095: { x: 988.3418197631836, y: 1663.2173583984375, a: 249.50532570216467 },
  1097: { x: 2099.6623809814455, y: 1691.1048889160156, a: 137.94990327637097 },
  1099: { x: 1286.2814331054688, y: 1684.9363922119142, a: 130.33448512909305 },
  1101: { x: 934.2065963745117, y: 1692.688330078125, a: 249.9727401466473 },
  1103: { x: 1971.46318359375, y: 1727.3494506835937, a: 139.59141432909934 },
  1105: { x: 1339.420849609375, y: 1709.0300659179688, a: 107.88229917335141 },
  1107: { x: 1635.9183013916015, y: 1740.5499755859375, a: -123.10397837691866 },
  1109: { x: 1066.50428314209, y: 1759.8285766601562, a: -129.78481584687938 },
  1111: { x: 1192.5484466552734, y: 1775.5431518554688, a: -173.78737112102212 },
  1113: { x: 2012.7225494384766, y: 1771.2598907470704, a: 138.30476329554102 },
  1115: { x: 1874.0161529541015, y: 1795.3560729980468, a: 174.23724995459082 },
  1117: { x: 1744.5968444824218, y: 1807.5229522705079, a: -151.4736106959366 },
  1119: { x: 1591.7423858642578, y: 1781.113458251953, a: 226.27956697403843 },
  1121: { x: 1036.830973815918, y: 1810.932894897461, a: 215.30458042682181 },
  1123: { x: 1209.9225189208985, y: 1831.4838470458985, a: 162.77856356921578 },
  1125: { x: 1828.6089630126953, y: 1899.5920043945312, a: 7.246662017673019 },
  1127: { x: 1895.0878479003907, y: 1851.503155517578, a: 161.7243285959943 },
  1129: { x: 1728.855776977539, y: 1864.9628997802733, a: 196.56034672105855 },
};
