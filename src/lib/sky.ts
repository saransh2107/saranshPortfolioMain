// Where the Sun and Moon really are, from the low-precision formulas in the Astronomical Almanac: good to
// a fraction of a degree, far finer than anything drawn here. Directions are unit vectors fixed to the Earth:
// x through longitude 0 on the equator, y through 90E, z through the north pole.

export type Vec3 = [number, number, number]

const RAD = Math.PI / 180
const sin = (deg: number) => Math.sin(deg * RAD)
const cos = (deg: number) => Math.cos(deg * RAD)

/** The middle of India: the point the camera looks down on, and where "day" is decided. */
export const INDIA = { lat: 21, lon: 79 }

/** Days since noon UTC on 1 January 2000. */
const daysSinceEpoch = (now: number) => now / 86_400_000 - 10_957.5

/** From ecliptic longitude and latitude (degrees) to a direction fixed to the turning Earth. */
function toEarthFixed(lambda: number, beta: number, d: number): Vec3 {
  const eps = 23.439 - 0.0000004 * d
  const x = cos(beta) * cos(lambda)
  const y = cos(eps) * cos(beta) * sin(lambda) - sin(eps) * sin(beta)
  const z = sin(eps) * cos(beta) * sin(lambda) + cos(eps) * sin(beta)
  const earthTurn = 280.46061837 + 360.98564736629 * d // Greenwich sidereal time
  return [x * cos(earthTurn) + y * sin(earthTurn), -x * sin(earthTurn) + y * cos(earthTurn), z]
}

export function sunDirection(now = Date.now()): Vec3 {
  const d = daysSinceEpoch(now)
  const g = 357.528 + 0.9856003 * d
  return toEarthFixed(280.46 + 0.9856474 * d + 1.915 * sin(g) + 0.02 * sin(2 * g), 0, d)
}

export function moonDirection(now = Date.now()): Vec3 {
  const d = daysSinceEpoch(now), T = d / 36525
  const lambda = 218.32 + 481267.881 * T
    + 6.29 * sin(135 + 477198.87 * T) - 1.27 * sin(259.3 - 413335.36 * T)
    + 0.66 * sin(235.7 + 890534.22 * T) + 0.21 * sin(269.9 + 954397.74 * T)
    - 0.19 * sin(357.5 + 35999.05 * T) - 0.11 * sin(186.5 + 966404.03 * T)
  const beta = 5.13 * sin(93.3 + 483202.02 * T) + 0.28 * sin(228.2 + 960400.89 * T)
    - 0.28 * sin(318.3 + 6003.15 * T) - 0.17 * sin(217.6 - 407332.21 * T)
  return toEarthFixed(lambda, beta, d)
}

const dot = (a: Vec3, b: Vec3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2]

/** How much of the Moon's face is lit: 0 at new moon, 1 at full moon. */
export function moonLitFraction(now = Date.now()): number {
  return (1 - dot(sunDirection(now), moonDirection(now))) / 2
}

/** A direction as seen by a camera above the given latitude and longitude: x east, y north, z towards the camera. */
export function viewFrom(v: Vec3, lat = INDIA.lat, lon = INDIA.lon): Vec3 {
  const east: Vec3 = [-sin(lon), cos(lon), 0]
  const north: Vec3 = [-sin(lat) * cos(lon), -sin(lat) * sin(lon), cos(lat)]
  const up: Vec3 = [cos(lat) * cos(lon), cos(lat) * sin(lon), sin(lat)]
  return [dot(v, east), dot(v, north), dot(v, up)]
}

/** Height of the Sun above India's horizon, in degrees. */
export function sunAltitude(now = Date.now()): number {
  return Math.asin(viewFrom(sunDirection(now))[2]) / RAD
}
