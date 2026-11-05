// The Earth as a real sphere: satellite maps wrapped in a small fragment shader and lit by the Sun's true
// position, so day, night and twilight fall where they really are, with city lights on the dark side.
// Drawn only when asked to, so the caller decides how often it costs anything.
// Returns null without WebGL, leaving the CSS planet showing.

import { INDIA, viewFrom, type Vec3 } from '../lib/sky'

const ATMOSPHERE = 1.08 // canvas size relative to the globe, leaving room for the glow around it
const INDIA_LAT = (INDIA.lat * Math.PI) / 180

const VERTEX = `
attribute vec2 a;
varying vec2 v;
void main() { v = a; gl_Position = vec4(a, 0., 1.); }`

const FRAGMENT = `
precision highp float;
varying vec2 v;
uniform sampler2D uDay, uNight, uClouds;
uniform vec3 uSun;   // towards the Sun, as seen from the camera: x east, y north, z towards the camera
uniform float uLon, uCloudLon, uBlur, uPixel;

const float PI = 3.14159265;
const float TILT = ${INDIA_LAT.toFixed(5)};
const float SIZE = ${ATMOSPHERE.toFixed(2)};
const float INDIA_LON = ${((INDIA.lon * Math.PI) / 180).toFixed(5)};

// Lighting is worked out in linear light, which is what stops it looking painted
vec3 linear(vec3 c) { return c * c; }

vec3 map(vec2 uv) {
  vec3 c = texture2D(uDay, uv).rgb;
  if (uBlur > 0.0) {
    float d = uBlur * 0.035;
    c = (c + texture2D(uDay, uv + vec2(d, 0.)).rgb + texture2D(uDay, uv - vec2(d, 0.)).rgb
           + texture2D(uDay, uv + vec2(d * 2., 0.)).rgb + texture2D(uDay, uv - vec2(d * 2., 0.)).rgb) / 5.;
  }
  return c;
}

void main() {
  vec2 p = v * SIZE;
  float r = length(p);

  // Atmosphere beyond the edge of the globe: thin, and only where sunlight reaches it
  vec3 rim = normalize(vec3(p, 0.0001));
  float rimLight = smoothstep(-0.25, 0.55, dot(rim, uSun));
  float glow = pow(clamp((SIZE - r) / (SIZE - 1.), 0., 1.), 3.) * 0.75 * rimLight;
  vec3 air = vec3(0.42, 0.68, 1.) * glow;

  float edge = 1. - smoothstep(1. - uPixel, 1., r);
  if (edge <= 0.) { gl_FragColor = vec4(air, glow); return; }

  // Point on the sphere, then into the Earth's frame: the camera sits above India's latitude
  vec3 n = vec3(p, sqrt(max(0., 1. - min(r * r, 1.))));
  vec3 e = vec3(n.x, n.y * cos(TILT) + n.z * sin(TILT), -n.y * sin(TILT) + n.z * cos(TILT));
  float lat = asin(clamp(e.y, -1., 1.));
  float lon = atan(e.x, e.z);
  vec2 uv = vec2(lon / (2. * PI) + 0.5 + uLon, 0.5 - lat / PI);

  vec3 source = map(uv);
  vec3 ground = linear(source);
  float water = smoothstep(0.02, 0.1, source.b - max(source.r, source.g));
  ground = mix(ground, vec3(0.018, 0.1, 0.36), water * 0.8);
  float cloud = texture2D(uClouds, vec2(uv.x + uCloudLon, uv.y)).r;
  cloud = smoothstep(0.08, 0.85, cloud);
  float city = texture2D(uNight, uv).r;

  float d = dot(n, uSun);
  float day = smoothstep(-0.1, 0.16, d);
  float light = max(d, 0.);
  light = pow(light, 0.72);

  // Sunlit ground, the Sun's glint on open water, then clouds catching the light
  vec3 col = ground * light * 2.1;
  vec3 h = normalize(uSun + vec3(0., 0., 1.));
  col += vec3(1., 0.96, 0.88) * pow(max(dot(n, h), 0.), 90.) * 0.32 * water * (1. - cloud);
  col = mix(col, vec3(1.) * (light * 1.02 + 0.004), cloud * 0.92);

  // Air scatters blue light over the whole lit face, more towards the edge
  float haze = 0.1 + pow(1. - n.z, 1.7) * 0.62;
  col = mix(col, vec3(0.34, 0.58, 1.) * (light * 0.95 + 0.04), haze * day);

  // Night: city lights and a trace of light on the ground, with a warm band along the day-night line
  col += ground * 0.012 * (1. - day);
  col += vec3(1., 0.72, 0.38) * city * city * 2.4 * (1. - day) * (1. - cloud * 0.75);
  col += vec3(0.9, 0.42, 0.16) * exp(-pow(d / 0.045, 2.)) * 0.022;

  // Marks the middle of India
  vec3 here = vec3(cos(lat) * sin(lon + 2. * PI * uLon), sin(lat), cos(lat) * cos(lon + 2. * PI * uLon));
  float place = distance(here, vec3(cos(TILT) * sin(INDIA_LON), sin(TILT), cos(TILT) * cos(INDIA_LON)));
  float ring = smoothstep(0.052, 0.044, place) * smoothstep(0.03, 0.038, place);
  col = mix(col, vec3(1.), ring * 0.95);
  col = mix(col, vec3(1., 0.46, 0.1), smoothstep(0.03, 0.022, place));

  gl_FragColor = vec4(mix(air, sqrt(col), edge), mix(glow, 1., edge));
}`

export interface Globe {
  /** True when WebGL is running on the CPU, so draws should be rare. */
  softwareRendered: boolean
  /** phase: revolutions the camera has been spun away from India. cloudPhase: revolutions of cloud drift. blur: 0 to 1, for fast spins. */
  draw(phase: number, cloudPhase: number, blur: number): void
  /** The Sun's direction, fixed to the Earth (see lib/sky). */
  setSun(sun: Vec3): void
  resize(cssWidth: number): void
  dispose(): void
}

const loadImage = (src: string) => new Promise<HTMLImageElement>((resolve, reject) => {
  const img = new Image()
  img.onload = () => resolve(img)
  img.onerror = reject
  img.src = src
})

export function createGlobe(canvas: HTMLCanvasElement, onReady: () => void): Globe | null {
  const gl = canvas.getContext('webgl', { alpha: true, antialias: false, premultipliedAlpha: true, powerPreference: 'low-power' })
  if (!gl) return null

  const shader = (type: number, source: string) => {
    const s = gl.createShader(type)!
    gl.shaderSource(s, source)
    gl.compileShader(s)
    return s
  }
  const program = gl.createProgram()!
  gl.attachShader(program, shader(gl.VERTEX_SHADER, VERTEX))
  gl.attachShader(program, shader(gl.FRAGMENT_SHADER, FRAGMENT))
  gl.linkProgram(program)
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return null
  gl.useProgram(program)

  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer())
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW)
  const position = gl.getAttribLocation(program, 'a')
  gl.enableVertexAttribArray(position)
  gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0)

  const u = (name: string) => gl.getUniformLocation(program, name)
  const uLon = u('uLon'), uCloudLon = u('uCloudLon'), uBlur = u('uBlur'), uPixel = u('uPixel'), uSun = u('uSun')

  let ready = false, disposed = false, sun: Vec3 = [1, 0, 0], drawnSize = 0
  Promise.all(['/sky/earth-day.webp', '/sky/earth-night.webp', '/sky/earth-clouds.webp'].map(loadImage)).then(images => {
    if (disposed) return
    images.forEach((img, i) => {
      gl.activeTexture(gl.TEXTURE0 + i)
      gl.bindTexture(gl.TEXTURE_2D, gl.createTexture())
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
    })
    gl.uniform1i(u('uDay'), 0)
    gl.uniform1i(u('uNight'), 1)
    gl.uniform1i(u('uClouds'), 2)
    ready = true
    onReady()
  }).catch(() => { /* images unavailable: the CSS planet stays */ })

  // Renderer names like "SwiftShader" or "llvmpipe" mean there's no real graphics chip doing the work
  const info = gl.getExtension('WEBGL_debug_renderer_info')
  const renderer = info ? String(gl.getParameter(info.UNMASKED_RENDERER_WEBGL)) : ''

  return {
    softwareRendered: /swiftshader|llvmpipe|software|basic render/i.test(renderer),
    draw(phase, cloudPhase, blur) {
      if (!ready || disposed || gl.isContextLost()) return
      // Spinning moves the camera round the Earth, so day and night stay where they truly are on the ground
      gl.uniform3fv(uSun, viewFrom(sun, INDIA.lat, INDIA.lon + phase * 360))
      gl.uniform1f(uLon, INDIA.lon / 360 + phase)
      gl.uniform1f(uCloudLon, cloudPhase)
      gl.uniform1f(uBlur, blur)
      gl.drawArrays(gl.TRIANGLES, 0, 3)
    },
    setSun(next) { sun = next },
    resize(cssWidth) {
      const size = Math.round(cssWidth * ATMOSPHERE * Math.min(2, window.devicePixelRatio || 1))
      if (drawnSize === size) return
      drawnSize = canvas.width = canvas.height = size
      gl.viewport(0, 0, size, size)
      gl.uniform1f(uPixel, (2 * ATMOSPHERE) / size * 1.5)
    },
    // The context stays usable: React's development mode remounts components, and asks this same canvas for it again
    dispose() { disposed = true },
  }
}
