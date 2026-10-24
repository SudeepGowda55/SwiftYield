"use client";

import { useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

/**
 * p = 0: autonomous simulation, one strike per simulated Base block (2 s) through a random DEX pair.
 * p 0→3, written by the scrubbed story timeline: 0→1 borrow, 1→2 strike both pools, 2→3 repay.
 */
export const storm = { p: 0 };
/** Last simulated strike, read by the oscilloscope HUD. */
export const simLog = { n: 0, buy: 0, sell: 1 };

export const DEXES = ["Uniswap V2", "SushiSwap V2", "PancakeSwap V2"];
// vault sits up and to the right so the centered headline stays clear
const VAULT = new THREE.Vector3(6.2, 7.2, -6);
const POOLS = [new THREE.Vector3(-5.4, 0, 1.6), new THREE.Vector3(5.4, 0, 1.6), new THREE.Vector3(0, 0, -6.5)];
const BLOCK = 2; // Base block time, seconds
const SAMPLES = 24;

const noise = /* glsl */ `
  float h3(vec3 p){ p = fract(p*0.3183099+.1); p *= 17.0; return fract(p.x*p.y*p.z*(p.x+p.y+p.z)); }
  float vn(vec3 x){ vec3 i=floor(x), f=fract(x); f=f*f*(3.0-2.0*f);
    return mix(mix(mix(h3(i),h3(i+vec3(1,0,0)),f.x),mix(h3(i+vec3(0,1,0)),h3(i+vec3(1,1,0)),f.x),f.y),
               mix(mix(h3(i+vec3(0,0,1)),h3(i+vec3(1,0,1)),f.x),mix(h3(i+vec3(0,1,1)),h3(i+vec3(1,1,1)),f.x),f.y),f.z); }
  float fbm(vec3 p){ float a=0.5, s=0.0; for(int i=0;i<5;i++){ s+=a*vn(p); p*=2.03; a*=0.5; } return s; }
`;

// ---------- bolt geometry ----------
const jagged = (a: THREE.Vector3, b: THREE.Vector3, n: number, amp: number, lift = 0) => {
  const pts: THREE.Vector3[] = [];
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    const p = a.clone().lerp(b, t);
    const env = Math.sin(Math.PI * t);
    p.x += (Math.random() - 0.5) * amp * env * 2;
    p.z += (Math.random() - 0.5) * amp * env * 2;
    p.y += lift * env + (Math.random() - 0.5) * amp * env;
    pts.push(p);
  }
  return pts;
};

class Poly extends THREE.Curve<THREE.Vector3> {
  cum: number[] = [0];
  constructor(public pts: THREE.Vector3[]) {
    super();
    for (let i = 1; i < pts.length; i++) this.cum.push(this.cum[i - 1] + pts[i].distanceTo(pts[i - 1]));
  }
  getPoint(t: number, target = new THREE.Vector3()) {
    const L = this.cum[this.cum.length - 1] * t;
    let i = 1;
    while (i < this.cum.length - 1 && this.cum[i] < L) i++;
    const k = (L - this.cum[i - 1]) / (this.cum[i] - this.cum[i - 1] || 1);
    return target.copy(this.pts[i - 1]).lerp(this.pts[i], k);
  }
}

const buildRoute = (buy: number, sell: number) => {
  const up = new THREE.Vector3(0, 0.15, 0);
  const s1 = jagged(VAULT, POOLS[buy].clone().add(up), 18, 0.9);
  const s2 = jagged(POOLS[buy].clone().add(up), POOLS[sell].clone().add(up), 16, 0.5, 1.8);
  const s3 = jagged(POOLS[sell].clone().add(up), VAULT, 18, 0.9);
  const curve = new Poly([...s1, ...s2.slice(1), ...s3.slice(1)]);
  const total = curve.cum[curve.cum.length - 1];
  const f1 = curve.cum[s1.length - 1] / total;
  const f2 = curve.cum[s1.length + s2.length - 2] / total;
  return {
    curve,
    f1,
    f2,
    core: new THREE.TubeGeometry(curve, 260, 0.075, 5),
    glow: new THREE.TubeGeometry(curve, 160, 0.34, 8),
  };
};
type Route = ReturnType<typeof buildRoute>;

const boltVert = /* glsl */ `
  varying float vU; varying vec3 vN; varying vec3 vV;
  void main(){ vU = uv.x; vec4 mv = modelViewMatrix*vec4(position,1.0);
    vN = normalMatrix*normal; vV = -mv.xyz; gl_Position = projectionMatrix*mv; }
`;
const boltFrag = /* glsl */ `
  uniform float uDraw, uLife, uGlow;
  varying float vU; varying vec3 vN; varying vec3 vV;
  void main(){
    if (vU > uDraw) discard;
    float head = smoothstep(uDraw - 0.05, uDraw, vU);
    float facing = abs(dot(normalize(vN), normalize(vV)));
    vec3 col = mix(vec3(1.0,0.98,0.96), vec3(0.42,0.16,1.0), uGlow) + head*0.4;
    float a = uLife * mix(1.0, 0.45*pow(facing, 2.5), uGlow);
    gl_FragColor = vec4(col, a);
  }
`;

// ---------- scene pieces ----------
const Sky = ({ u }: { u: Record<string, THREE.IUniform> }) => {
  const mat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        side: THREE.BackSide,
        depthWrite: false,
        uniforms: u,
        vertexShader: `varying vec3 vDir; void main(){ vDir = normalize(position); gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.0); }`,
        fragmentShader: /* glsl */ `
          uniform float uTime, uFlash; uniform vec3 uFlashDir; varying vec3 vDir;
          ${noise}
          void main(){
            float h = vDir.y;
            vec3 zen = vec3(0.70,0.19,0.03), hor = vec3(1.0,0.66,0.32);
            vec3 col = mix(hor, zen, smoothstep(-0.02, 0.55, h));
            vec2 q = vDir.xz / (abs(h) + 0.22);
            float c = fbm(vec3(q*0.9 + vec2(uTime*0.02, uTime*0.008), uTime*0.03));
            float cloud = smoothstep(0.38, 0.72, c) * smoothstep(0.0, 0.22, h);
            col = mix(col, vec3(1.0,0.76,0.48), cloud*0.6);
            col = mix(col, vec3(0.32,0.06,0.14), smoothstep(0.5,0.85,c)*smoothstep(0.05,0.4,h)*0.7);
            float l = uFlash * exp(-distance(vDir, uFlashDir) * 2.6);
            col += vec3(0.95,0.85,1.0) * l * (0.35 + cloud*1.2) + uFlash*0.05;
            gl_FragColor = vec4(col, 1.0);
          }`,
      }),
    [u],
  );
  return (
    <mesh material={mat}>
      <sphereGeometry args={[90, 48, 32]} />
    </mesh>
  );
};

const Ground = ({ u }: { u: Record<string, THREE.IUniform> }) => {
  const mat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        transparent: true,
        uniforms: u,
        vertexShader: `varying vec3 vW; void main(){ vec4 w = modelMatrix*vec4(position,1.0); vW = w.xyz; gl_Position = projectionMatrix*viewMatrix*w; }`,
        fragmentShader: /* glsl */ `
          uniform float uTime, uFlash; uniform vec3 uPools[3]; uniform float uHit[3]; uniform vec3 uStrike;
          varying vec3 vW;
          ${noise}
          void main(){
            float r0 = length(vW.xz);
            vec3 col = vec3(0.80,0.30,0.06);
            col -= vec3(0.25,0.12,0.02) * fbm(vec3(vW.xz*0.35, uTime*0.05)) * 0.6;
            for (int i = 0; i < 3; i++) {
              float r = distance(vW.xz, uPools[i].xz);
              float ring = smoothstep(0.06, 0.0, abs(r - 1.55));
              float disk = smoothstep(1.55, 1.3, r);
              float ripple = disk * (0.5 + 0.5*sin(r*9.0 - uTime*3.0)) * 0.12;
              col += vec3(1.0,0.93,0.85) * (ring*(0.55 + uHit[i]) + ripple + disk*uHit[i]*0.5);
              col = mix(col, vec3(0.42,0.16,1.0), smoothstep(2.6, 1.5, r) * uHit[i] * 0.35);
            }
            col += vec3(1.0,0.88,0.95) * uFlash * exp(-distance(vW.xz, uStrike.xz)*0.35) * 0.5;
            float fade = smoothstep(34.0, 12.0, r0);
            gl_FragColor = vec4(col, fade);
          }`,
      }),
    [u],
  );
  return (
    <mesh material={mat} rotation-x={-Math.PI / 2}>
      <planeGeometry args={[80, 80, 1, 1]} />
    </mesh>
  );
};

const Rain = ({ u, count }: { u: Record<string, THREE.IUniform>; count: number }) => {
  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    const seed = new Float32Array(count * 3).map(() => Math.random());
    g.setAttribute("position", new THREE.BufferAttribute(new Float32Array(count * 3), 3));
    g.setAttribute("aSeed", new THREE.BufferAttribute(seed, 3));
    return g;
  }, [count]);
  const mat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        uniforms: u,
        vertexShader: /* glsl */ `
          uniform float uTime, uCharge, uPx; uniform vec3 uBolt[${SAMPLES}];
          attribute vec3 aSeed; varying float vC; varying float vA;
          void main(){
            vec3 p = vec3(mix(-18.0,18.0,aSeed.x), 0.0, mix(-16.0,9.0,aSeed.z));
            p.y = mod(aSeed.y*15.0 - uTime*(6.0 + aSeed.x*4.0), 15.0);
            float d = 1e3;
            for (int i = 0; i < ${SAMPLES}; i++) d = min(d, distance(p, uBolt[i]));
            float c = uCharge * smoothstep(2.4, 0.0, d);
            p.x += sin(uTime*47.0 + aSeed.y*91.0) * 0.12 * c;
            vC = c; vA = 0.25 + 0.4*aSeed.z;
            vec4 mv = modelViewMatrix*vec4(p,1.0);
            gl_PointSize = (0.3 + c*0.18) * uPx / -mv.z;
            gl_Position = projectionMatrix*mv;
          }`,
        fragmentShader: /* glsl */ `
          varying float vC; varying float vA;
          void main(){
            vec2 q = gl_PointCoord - 0.5;
            float streak = smoothstep(0.05 + vC*0.07, 0.0, abs(q.x)) * (1.0 - abs(q.y)*2.0);
            vec3 col = mix(vec3(1.0,0.86,0.72), mix(vec3(1.0), vec3(0.55,0.3,1.0), 0.35), vC);
            gl_FragColor = vec4(col, streak * (vA + vC));
          }`,
      }),
    [u],
  );
  return <points geometry={geo} material={mat} frustumCulled={false} />;
};

const Embers = ({ u, count }: { u: Record<string, THREE.IUniform>; count: number }) => {
  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(new Float32Array(count * 3), 3));
    g.setAttribute(
      "aSeed",
      new THREE.BufferAttribute(
        new Float32Array(count * 4).map(() => Math.random()),
        4,
      ),
    );
    return g;
  }, [count]);
  const mat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,

        uniforms: u,
        vertexShader: /* glsl */ `
          uniform float uTime, uWealth, uPx; uniform vec3 uVault; attribute vec4 aSeed; varying float vOn;
          void main(){
            float a = aSeed.x*6.2832 + uTime*(0.15 + aSeed.y*0.35);
            float r = 0.6 + aSeed.z*2.2;
            vec3 p = uVault + vec3(cos(a)*r, sin(a*1.7 + aSeed.w*6.0)*1.4, sin(a)*r);
            vOn = step(aSeed.w, uWealth);
            vec4 mv = modelViewMatrix*vec4(p,1.0);
            gl_PointSize = vOn * (0.05 + aSeed.y*0.07) * uPx / -mv.z;
            gl_Position = projectionMatrix*mv;
          }`,
        fragmentShader: /* glsl */ `
          varying float vOn;
          void main(){ float d = length(gl_PointCoord-0.5); if (d > 0.5 || vOn < 0.5) discard;
            gl_FragColor = vec4(0.30,0.06,0.95, smoothstep(0.5,0.2,d)); }`,
      }),
    [u],
  );
  return <points geometry={geo} material={mat} frustumCulled={false} />;
};

// ---------- the simulation + story driver ----------
const Storm = ({ labels }: { labels: React.MutableRefObject<(HTMLElement | null)[]> }) => {
  const { camera, size, gl, setDpr } = useThree();
  const portrait = size.width < size.height;

  const u = useMemo(
    () => ({
      uTime: { value: 0 },
      uFlash: { value: 0 },
      uFlashDir: { value: new THREE.Vector3(0, 0.5, -1).normalize() },
      uPools: { value: POOLS },
      uHit: { value: [0, 0, 0] },
      uStrike: { value: new THREE.Vector3() },
      uBolt: { value: Array.from({ length: SAMPLES }, () => new THREE.Vector3(1e3, 1e3, 1e3)) },
      uCharge: { value: 0 },
      uPx: { value: 1 },
      uWealth: { value: 0.08 },
      uVault: { value: VAULT },
    }),
    [],
  );
  const coreU = useMemo(() => ({ uDraw: { value: 0 }, uLife: { value: 0 }, uGlow: { value: 0 } }), []);
  const glowU = useMemo(() => ({ uDraw: { value: 0 }, uLife: { value: 0 }, uGlow: { value: 1 } }), []);
  const boltMat = (uniforms: Record<string, THREE.IUniform>) =>
    new THREE.ShaderMaterial({
      uniforms,
      vertexShader: boltVert,
      fragmentShader: boltFrag,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
  const coreMat = useMemo(() => boltMat(coreU), [coreU]);
  const glowMat = useMemo(() => boltMat(glowU), [glowU]);
  const core = useRef<THREE.Mesh>(null);
  const glow = useRef<THREE.Mesh>(null);
  const route = useRef<Route | null>(null);
  const storyRoute = useMemo(() => buildRoute(0, 1), []);
  const sim = useRef({ next: 0.6, start: -10, wealth: 0.08 });
  const pointer = useRef({ x: 0, y: 0 });
  const perf = useRef({ sum: 0, n: 0, stepped: false });
  const tmp = useMemo(() => new THREE.Vector3(), []);

  useEffect(() => {
    const move = (e: PointerEvent) => {
      pointer.current.x = e.clientX / innerWidth - 0.5;
      pointer.current.y = e.clientY / innerHeight - 0.5;
    };
    window.addEventListener("pointermove", move);
    return () => window.removeEventListener("pointermove", move);
  }, []);

  useEffect(() => {
    const cam = camera as THREE.PerspectiveCamera;
    cam.fov = portrait ? 62 : 46;
    // drop the world below the centered headline
    cam.setViewOffset(size.width, size.height, 0, -size.height * (portrait ? 0.22 : 0.13), size.width, size.height);
    cam.updateProjectionMatrix();
    // pixels per world unit at distance 1, so point sizes below are in world units
    u.uPx.value = (size.height * gl.getPixelRatio()) / (2 * Math.tan(THREE.MathUtils.degToRad(cam.fov) / 2));
  }, [camera, size, portrait, gl, u]);

  const use = (r: Route) => {
    if (route.current === r) return;
    if (route.current && route.current !== storyRoute) {
      route.current.core.dispose();
      route.current.glow.dispose();
    }
    route.current = r;
    core.current!.geometry = r.core;
    glow.current!.geometry = r.glow;
  };

  useFrame(({ clock }, dt) => {
    const f = perf.current;
    if (!f.stepped) {
      f.sum += dt;
      if (++f.n === 90) {
        if (f.sum / f.n > 0.022) {
          setDpr(1);
          f.stepped = true;
        }
        f.sum = f.n = 0;
      }
    }

    const t = clock.elapsedTime;
    u.uTime.value = t;
    const p = storm.p;
    const story = p > 0.02;
    let draw = 0;
    let life = 0;
    const hit = u.uHit.value as number[];

    if (story) {
      use(storyRoute);
      const r = storyRoute;
      draw = p < 1 ? p * r.f1 : p < 2 ? r.f1 + (p - 1) * (r.f2 - r.f1) : r.f2 + (p - 2) * (1 - r.f2);
      life = 0.8 + 0.2 * Math.sin(t * 37) * Math.sin(t * 13);
      hit[0] += ((p > 0.95 ? 1 : 0) - hit[0]) * 0.1;
      hit[1] += ((p > 1.95 ? 1 : 0) - hit[1]) * 0.1;
      hit[2] += (0 - hit[2]) * 0.1;
      u.uWealth.value = 0.05 + 0.95 * THREE.MathUtils.smoothstep(p, 2.2, 3);
      u.uFlash.value = 0.25 + 0.5 * Math.max(0, Math.sin(t * 9)) * life * 0.3;
    } else {
      const s = sim.current;
      if (t > s.next) {
        const buy = Math.floor(Math.random() * 3);
        const sell = (buy + 1 + Math.floor(Math.random() * 2)) % 3;
        use(buildRoute(buy, sell));
        simLog.n += 1;
        simLog.buy = buy;
        simLog.sell = sell;
        s.start = t;
        s.next = t + BLOCK;
        s.wealth = Math.min(1, s.wealth + 0.035);
      }
      const age = t - s.start;
      draw = Math.min(1, age / 0.42);
      life = age < 0.42 ? 1 : Math.max(0, 1 - (age - 0.42) / 0.75) * (Math.random() > 0.18 ? 1 : 0.3);
      if (route.current) {
        const r = route.current;
        const i0 = simLog.buy;
        const i1 = simLog.sell;
        hit.forEach((_, i) => (hit[i] *= 0.95));
        if (draw >= r.f1 && age < 0.9) hit[i0] = 1;
        if (draw >= r.f2 && age < 0.9) hit[i1] = 1;
      }
      u.uWealth.value += (s.wealth - u.uWealth.value) * 0.05;
      u.uFlash.value = life * (age < 0.6 ? 1 : 0.6);
    }

    coreU.uDraw.value = glowU.uDraw.value = draw;
    coreU.uLife.value = life;
    glowU.uLife.value = life;
    u.uCharge.value = Math.min(1, life * 1.2);

    const r = route.current;
    if (r) {
      const bolt = u.uBolt.value as THREE.Vector3[];
      bolt.forEach((b, i) => {
        const k = i / (SAMPLES - 1);
        if (k <= draw) r.curve.getPoint(k, b);
        else b.set(1e3, 1e3, 1e3);
      });
      r.curve.getPoint(Math.max(0, draw - 0.01), tmp);
      (u.uStrike.value as THREE.Vector3).copy(tmp);
      (u.uFlashDir.value as THREE.Vector3).copy(tmp).sub(camera.position).normalize();
    }

    // scroll-orbited camera with a slow autonomous sway
    const radius = (portrait ? 24 : 16) + p * 0.8;
    const ang = Math.sin(t * 0.06) * 0.16 + pointer.current.x * 0.14 + p * 0.12;
    const target = tmp.set(Math.sin(ang) * radius, 3.6 + p * 0.6 - pointer.current.y * 0.6, Math.cos(ang) * radius);
    camera.position.lerp(target, 0.05);
    camera.lookAt(0, 2.2 + p * 0.3, 0);

    // pin the HTML labels to the pools and the vault
    [...POOLS, VAULT].forEach((w, i) => {
      const el = labels.current[i];
      if (!el) return;
      const s = tmp.copy(w).project(camera);
      const x = (s.x * 0.5 + 0.5) * size.width;
      const y = (-s.y * 0.5 + 0.5) * size.height;
      el.style.transform = `translate3d(${x}px,${y}px,0) translate(-50%, ${i === 3 ? "-160%" : "70%"})`;
      el.style.opacity = s.z < 1 ? "1" : "0";
    });
  });

  return (
    <>
      <Sky u={u} />
      <Ground u={u} />
      <Rain u={u} count={7000} />
      <Embers u={u} count={600} />
      <mesh position={VAULT}>
        <sphereGeometry args={[0.28, 20, 20]} />
        <meshBasicMaterial color="#22072b" />
      </mesh>
      <mesh ref={core} geometry={storyRoute.core} material={coreMat} frustumCulled={false} />
      <mesh ref={glow} geometry={storyRoute.glow} material={glowMat} frustumCulled={false} />
    </>
  );
};

export default function StormScene({ onReady }: { onReady?: () => void }) {
  const labels = useRef<(HTMLElement | null)[]>([]);
  return (
    <div className="absolute inset-0">
      <Canvas
        dpr={[1, 1.5]}
        gl={{ antialias: true, powerPreference: "high-performance" }}
        camera={{ position: [0, 2.4, 16], fov: 46, near: 0.1, far: 200 }}
        onCreated={() => requestAnimationFrame(() => onReady?.())}
        aria-label="Simulated storm: each lightning strike is one flash loan, from the Balancer vault through two DEX pools and back, once per simulated Base block"
        role="img"
      >
        <Storm labels={labels} />
      </Canvas>
      {[...DEXES, "Balancer Vault"].map((n, i) => (
        <span
          key={n}
          ref={el => {
            labels.current[i] = el;
          }}
          className="pointer-events-none absolute left-0 top-0 whitespace-nowrap text-[11px] font-semibold uppercase tracking-wide text-[var(--ink)] opacity-0"
        >
          {n}
        </span>
      ))}
    </div>
  );
}
