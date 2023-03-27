/* eslint-disable prefer-const */
export default function (color_1: string, color_2: string, weight: number) {
  function d2h(d: any) {
    return d.toString(16);
  } // convert a decimal value to hex
  function h2d(h: any) {
    return parseInt(h, 16);
  } // convert a hex value to decimal

  weight = typeof weight !== 'undefined' ? weight : 50; // set the weight to 50%, if that argument is omitted

  let color = '#';

  for (let i = 0; i <= 5; i += 2) {
    // loop through each of the 3 hex pairs—red, green, and blue
    // eslint-disable-next-line prefer-const
    let v1 = h2d(color_1.substr(i, 2)), // extract the current pairs
      v2 = h2d(color_2.substr(i, 2)),
      // combine the current pairs from each source color, according to the specified weight
      val = d2h(Math.floor(v2 + (v1 - v2) * (weight / 100.0)));

    while (val.length < 2) {
      val = '0' + val;
    } // prepend a '0' if val results in a single digit

    color += val; // concatenate val to our new color string
  }

  return color; // PROFIT!
}
