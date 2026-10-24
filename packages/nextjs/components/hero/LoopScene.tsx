"use client";

import { useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

/**
 * Story progress written by the scrubbed GSAP timeline on the home page.
 * 0 idle hero · 0→1 borrow · 1→2 buy low · 2→3 sell high · 3→4 repay + seal the block.
 */
export const loopStore = { p: 0 };

const INK = new THREE.Color("#0e0e10");
const VOLT = new THREE.Color("#d9ff3d");
const LOAN = new THREE.Color("#ff5a1f");
const PROFIT = new THREE.Color("#0fa968");
const PAPER = new THREE.Color("#f7f5ef");

const VAULT = new THREE.Vector3(0, 0.55, 0);
const POOLS = [
  { name: "uniswap", pos: new THREE.Vector3(-2.6, 0, 1.5) },
  { name: "sushiswap", pos: new THREE.Vector3(2.6, 0, 1.5) },
  { name: "pancakeswap", pos: new THREE.Vector3(0, 0, -2.9) },
];

// vault → Uniswap (buy low) → SushiSwap (sell high) → vault: the route the contract takes for userData 0x0102…
const curve = new THREE.CatmullRomCurve3(
  [
    VAULT.clone(),
    new THREE.Vector3(-1.5, 1.3, 0.4),
    new THREE.Vector3(-2.6, 0.45, 1.5),
    new THREE.Vector3(0, 1.5, 2.6),
    new THREE.Vector3(2.6, 0.45, 1.5),
    new THREE.Vector3(1.5, 1.3, 0.4),
    VAULT.clone(),
  ],
  false,
  "centripetal",
);

const arcVert = /* glsl */ `
  varying float vU;
  void main() {
    vU = uv.x;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;
const arcFrag = /* glsl */ `
  uniform float uHead, uActive, uRepaid, uTime;
  uniform vec3 uInk, uVolt, uLoan, uProfit;
  varying float vU;
  void main() {
    float travelled = step(vU, uHead) * uActive;
    float d = uHead - vU;
    float pulse = smoothstep(0.22, 0.0, d) * step(0.0, d);
    float dash = 0.55 + 0.45 * step(0.5, fract(vU * 70.0 - uTime * 1.6));
    vec3 col = mix(uInk, mix(uLoan, uProfit, uRepaid), travelled);
    col = mix(col, uVolt, pulse);
    float a = (0.22 + 0.68 * travelled) * dash;
    gl_FragColor = vec4(col, max(a, pulse));
  }
`;

const Pool = ({ pos, idx }: { pos: THREE.Vector3; idx: number }) => {
  const liquid = useRef<THREE.Mesh>(null);
  const ring = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    const p = loopStore.p;
    // buy pool (0) dips as tokens leave it, sell pool (1) swells as they arrive
    const hit =
      idx === 0 ? THREE.MathUtils.smoothstep(p, 0.9, 1.6) : idx === 1 ? THREE.MathUtils.smoothstep(p, 1.9, 2.6) : 0;
    const level = idx === 0 ? 1 - 0.35 * hit : idx === 1 ? 1 + 0.35 * hit : 0.8;
    const l = liquid.current!;
    l.scale.y = THREE.MathUtils.lerp(l.scale.y, level, 0.08);
    l.position.y = -0.28 + 0.28 * l.scale.y + Math.sin(clock.elapsedTime * 1.4 + idx) * 0.02;
    (l.material as THREE.MeshStandardMaterial).emissiveIntensity =
      0.15 + hit * 0.8 * (1 - THREE.MathUtils.smoothstep(p, 3, 3.6));
    ring.current!.rotation.z = clock.elapsedTime * (0.25 + idx * 0.08);
  });
  return (
    <group position={pos}>
      <mesh rotation-x={Math.PI / 2} ref={ring}>
        <torusGeometry args={[0.95, 0.07, 16, 72]} />
        <meshStandardMaterial color={INK} roughness={0.35} metalness={0.3} />
      </mesh>
      <mesh ref={liquid} position-y={0}>
        <cylinderGeometry args={[0.82, 0.82, 0.56, 48]} />
        <meshStandardMaterial
          color={idx === 2 ? PAPER : VOLT}
          emissive={VOLT}
          emissiveIntensity={0.15}
          roughness={0.5}
          transparent
          opacity={idx === 2 ? 0.55 : 0.92}
        />
      </mesh>
      <mesh position-y={-0.32} rotation-x={-Math.PI / 2}>
        <ringGeometry args={[1.1, 1.13, 64]} />
        <meshBasicMaterial color={INK} transparent opacity={0.35} />
      </mesh>
    </group>
  );
};

const Rig = () => {
  const { camera, size, gl, setDpr } = useThree();
  const pointer = useRef({ x: 0, y: 0 });
  const frames = useRef({ sum: 0, n: 0, stepped: false });

  useEffect(() => {
    const move = (e: PointerEvent) => {
      pointer.current.x = e.clientX / window.innerWidth - 0.5;
      pointer.current.y = e.clientY / window.innerHeight - 0.5;
    };
    window.addEventListener("pointermove", move);
    return () => window.removeEventListener("pointermove", move);
  }, []);

  useEffect(() => {
    const cam = camera as THREE.PerspectiveCamera;
    const portrait = size.width < size.height;
    cam.fov = portrait ? 52 : 38;
    // desktop: subject sits right of the copy; portrait: subject sits below it
    if (portrait) cam.setViewOffset(size.width, size.height, 0, -size.height * 0.3, size.width, size.height);
    else if (size.width >= 1024)
      cam.setViewOffset(size.width, size.height, -size.width * 0.22, 0, size.width, size.height);
    else cam.clearViewOffset();
    cam.updateProjectionMatrix();
  }, [camera, size, gl]);

  useFrame(({ clock }, dt) => {
    const f = frames.current;
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
    const p = loopStore.p;
    const pull = THREE.MathUtils.smoothstep(p, 3, 4);
    const portrait = size.width < size.height;
    const radius = (portrait ? 15 : 11.5) + pull * 2.5;
    const angle = clock.elapsedTime * 0.05 + pointer.current.x * 0.35 + p * 0.28;
    const target = new THREE.Vector3(
      Math.sin(angle) * radius,
      5.2 + pull * 1.6 - pointer.current.y * 1.2,
      Math.cos(angle) * radius,
    );
    camera.position.lerp(target, 0.06);
    camera.lookAt(0, 0.4, 0);
  });
  return null;
};

const Loop = () => {
  const packet = useRef<THREE.Group>(null);
  const halo = useRef<THREE.Mesh>(null);
  const vault = useRef<THREE.Group>(null);
  const block = useRef<THREE.LineSegments>(null);
  const profit = useRef<THREE.Mesh>(null);
  const shown = useRef(0);

  const tube = useMemo(() => new THREE.TubeGeometry(curve, 240, 0.035, 8, false), []);
  const arc = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: arcVert,
        fragmentShader: arcFrag,
        transparent: true,
        depthWrite: false,
        uniforms: {
          uHead: { value: 0 },
          uActive: { value: 0 },
          uRepaid: { value: 0 },
          uTime: { value: 0 },
          uInk: { value: INK },
          uVolt: { value: VOLT },
          uLoan: { value: LOAN },
          uProfit: { value: PROFIT },
        },
      }),
    [],
  );
  const edges = useMemo(() => new THREE.EdgesGeometry(new THREE.BoxGeometry(8.4, 3.4, 8.4)), []);

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    const p = loopStore.p;
    const active = THREE.MathUtils.smoothstep(p, 0.02, 0.4);
    // idle hero: capital circles continuously; once the story starts, scroll owns the head
    const idle = (t * 0.11) % 1;
    const scrub = THREE.MathUtils.clamp(p / 3, 0, 1);
    const goal = active < 0.5 ? idle : scrub;
    shown.current = active < 0.5 ? goal : THREE.MathUtils.lerp(shown.current, goal, 0.12);
    const head = shown.current;

    const u = arc.uniforms;
    u.uHead.value = head;
    u.uActive.value = active;
    u.uRepaid.value = THREE.MathUtils.smoothstep(p, 2.9, 3.3);
    u.uTime.value = t;

    packet.current!.position.copy(curve.getPointAt(Math.min(head, 0.999)));
    const s = 1 + Math.sin(t * 6) * 0.12;
    halo.current!.scale.setScalar(s * (1.2 + active * 0.4));

    vault.current!.rotation.y = t * 0.4;
    vault.current!.position.y = Math.sin(t * 1.2) * 0.06;

    const seal = THREE.MathUtils.smoothstep(p, 3.3, 3.9);
    const b = block.current!;
    b.scale.setScalar(1.35 - seal * 0.35);
    const bm = b.material as THREE.LineBasicMaterial;
    bm.opacity = 0.12 + seal * 0.75;
    bm.color.copy(INK).lerp(PROFIT, seal);

    const pr = profit.current!;
    const rise = THREE.MathUtils.smoothstep(p, 3.1, 4);
    pr.visible = rise > 0.01;
    pr.position.set(0, 1.2 + rise * 1.6, 0);
    pr.rotation.y = t * 1.5;
    pr.scale.setScalar(rise * 0.45);
  });

  return (
    <>
      <mesh geometry={tube} material={arc} />
      <group ref={packet}>
        <mesh>
          <sphereGeometry args={[0.16, 24, 24]} />
          <meshStandardMaterial color={VOLT} emissive={VOLT} emissiveIntensity={1.2} />
        </mesh>
        <mesh ref={halo}>
          <sphereGeometry args={[0.26, 24, 24]} />
          <meshBasicMaterial color={INK} wireframe transparent opacity={0.35} />
        </mesh>
      </group>

      <group ref={vault} position={VAULT}>
        <mesh>
          <octahedronGeometry args={[0.85, 0]} />
          <meshStandardMaterial color={INK} roughness={0.25} metalness={0.6} flatShading />
        </mesh>
        <mesh>
          <octahedronGeometry args={[0.95, 0]} />
          <meshBasicMaterial color={INK} wireframe transparent opacity={0.4} />
        </mesh>
        <mesh>
          <icosahedronGeometry args={[0.3, 1]} />
          <meshStandardMaterial color={VOLT} emissive={VOLT} emissiveIntensity={2} />
        </mesh>
      </group>

      <mesh ref={profit}>
        <octahedronGeometry args={[0.6, 0]} />
        <meshStandardMaterial color={PROFIT} emissive={PROFIT} emissiveIntensity={0.6} flatShading />
      </mesh>

      {POOLS.map((pl, i) => (
        <Pool key={pl.name} pos={pl.pos} idx={i} />
      ))}

      <lineSegments ref={block} geometry={edges} position-y={0.9}>
        <lineBasicMaterial color={INK} transparent opacity={0.12} />
      </lineSegments>

      <mesh rotation-x={-Math.PI / 2} position-y={-0.34}>
        <ringGeometry args={[4.6, 4.62, 128]} />
        <meshBasicMaterial color={INK} transparent opacity={0.3} />
      </mesh>
    </>
  );
};

export default function LoopScene({ onReady }: { onReady?: () => void }) {
  return (
    <Canvas
      dpr={[1, 1.5]}
      gl={{ alpha: true, antialias: true, powerPreference: "high-performance" }}
      camera={{ position: [0, 4.2, 9], fov: 38 }}
      onCreated={() => requestAnimationFrame(() => onReady?.())}
      aria-label="3D illustration: capital leaves the Balancer vault, swaps through two DEX pools and returns inside one block"
      role="img"
    >
      <ambientLight intensity={0.9} />
      <directionalLight position={[4, 8, 5]} intensity={1.6} />
      <directionalLight position={[-6, 3, -4]} intensity={0.5} color="#d9ff3d" />
      <Rig />
      <Loop />
    </Canvas>
  );
}
