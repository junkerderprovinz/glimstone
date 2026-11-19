// The marks of transfer services, as markup for BrandMark, each with the
// colour its tile lights up in and the ink that holds on it ("Brand tiles").
// Written by scripts/gen_transfer_marks.py; packages/core/transfer-marks/ holds
// the sources, their licences and the README that records where each came from.
//
// Every mark is a trademark of its owner, used only to name the service it
// refers to, on a tile that picks exactly that service, reproduced unmodified
// apart from its colour, with no claim of endorsement by or affiliation with
// any of them. The transfer catalog names the mark each service wears.

import type { TileMark } from "./picker.ts";

/** SwissTransfer. Source: homarr-labs/dashboard-icons, svg/infomaniak-swisstransfer.svg, without the words beside the mark (Apache-2.0). */
const swisstransfer: TileMark = {
  svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="31.36 51.24 21.28 23.52" fill="none"><path opacity="0.5" fill-rule="evenodd" clip-rule="evenodd" d="m 37.2711,52.4145 c 0,-0.7875 0.7697,-1.3504 1.5299,-1.1188 l 13.0045,3.9618 c 0.496,0.1511 0.8345,0.6049 0.8345,1.1188 v 12.7675 c 0,0.7876 -0.7697,1.3504 -1.5299,1.1188 L 38.1057,66.3008 C 37.6096,66.1497 37.2711,65.6959 37.2711,65.182 Z" fill="var(--mark-ink, #5ac78a)" id="glim-swisstransfer-path697"/><path opacity="0.8" fill-rule="evenodd" clip-rule="evenodd" d="m 34.3156,54.6386 c 0,-0.7875 0.7696,-1.3504 1.5298,-1.1188 l 13.0045,3.9618 c 0.496,0.1512 0.8345,0.6049 0.8345,1.1188 v 12.7675 c 0,0.7876 -0.7696,1.3504 -1.5299,1.1188 L 35.1501,68.5249 C 34.6541,68.3738 34.3156,67.92 34.3156,67.4061 Z" fill="var(--mark-ink, #4ec483)" id="glim-swisstransfer-path699"/><path fill-rule="evenodd" clip-rule="evenodd" d="m 31.36,56.8627 c 0,-0.7875 0.7697,-1.3503 1.5299,-1.1187 l 13.0044,3.9618 c 0.4961,0.1511 0.8346,0.6049 0.8346,1.1187 v 12.7676 c 0,0.7875 -0.7697,1.3503 -1.5299,1.1187 L 32.1945,70.749 C 31.6985,70.5979 31.36,70.1441 31.36,69.6303 Z" fill="var(--mark-ink, #3bb471)" id="glim-swisstransfer-path701"/><path fill-rule="evenodd" clip-rule="evenodd" d="m 40.7228,61.2476 c 0.1108,0.0939 0.2019,0.2125 0.2623,0.3417 l 2.3294,8.2692 c 0.1741,0.372 0.0567,0.7375 -0.2624,0.8163 -0.0967,0.0239 -0.2051,0.0191 -0.3153,-0.0139 l -2.1145,-0.6344 0.1005,-2.8989 -1.9125,2.3931 -3.9267,-1.2157 c -0.3635,-0.1091 -0.6581,-0.4928 -0.6581,-0.8571 0,-0.1014 0.0233,-0.1945 0.0682,-0.2719 l 1.3244,-3.2531 c 0.1611,-0.2782 0.5558,-0.2936 0.8816,-0.0343 0.1294,0.1029 0.2342,0.2394 0.2982,0.3883 l 0.7221,1.217 2.3098,-4.2512 c 0.1742,-0.2676 0.574,-0.2654 0.893,0.0049 z" fill="var(--mark-cut, #ffffff)" id="glim-swisstransfer-path703"/></svg>',
  tile: '#3bb471',
  ink: '#ffffff',
};

/** WeTransfer. Simple Icons: wetransfer (CC0), in its own #409FFF. */
const wetransfer: TileMark = {
  svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 6.44 24 11.13" fill="var(--mark-ink, #409FFF)"><path d="M13.855 11.891c0-3.382 2.4-5.4 5.51-5.4C22.145 6.491 24 7.91 24 9.873c0 1.855-1.582 3.055-3.328 3.055-.982 0-1.69-.164-2.182-.546-.163-.164-.272-.109-.272.055 0 .709.272 1.254.709 1.745.382.382 1.09.655 1.745.655.71 0 1.31-.164 1.855-.437.545-.272.982-.163 1.254.273.328.49-.109 1.145-.49 1.582-.71.763-2.073 1.309-3.819 1.309-3.545-.11-5.618-2.51-5.618-5.673zm-7.254 2.237c.327 0 .545.163.763.545l.982 1.582c.382.6.709 1.036 1.418 1.036.71 0 1.091-.273 1.418-1.09a21.11 21.11 0 001.31-3.873c.49-1.855.709-2.946.709-3.873s-.273-1.473-1.31-1.637c-1.363-.272-3.272-.381-5.29-.381-2.019 0-3.928.109-5.291.327C.273 6.982 0 7.528 0 8.454c0 .928.219 2.019.655 3.874a28.714 28.714 0 001.31 3.872c.381.818.708 1.091 1.417 1.091.71 0 1.037-.436 1.419-1.036l.981-1.582c.273-.327.491-.545.819-.545z"/></svg>',
  tile: '#409fff',
  ink: '#ffffff',
};

/** Every mark, by the id an app addresses it with. */
export const TRANSFER_MARKS = { swisstransfer, wetransfer } as const;

export type TransferMarkId = keyof typeof TRANSFER_MARKS;
