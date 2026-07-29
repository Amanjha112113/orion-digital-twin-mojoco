import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Cpu, AlertTriangle, Eye, Activity, HelpCircle, Flame, Zap, BarChart2 } from 'lucide-react';

export function SimulationView({ telemetry }) {
  const mountRef = useRef(null);
  const cameraRef = useRef(null);

  const [viewAngle, setViewAngle] = useState('perspective');
  const [showHelp, setShowHelp] = useState(false);
  const [history, setHistory] = useState([]);

  const robotRef = useRef({
    shoulderPan: null,
    shoulderLift: null,
    elbow: null,
    wrist: null,
  });

  const joints = telemetry?.joints || {};
  const vibration = telemetry?.vibration || 0.15;
  const temp = telemetry?.temp || 65.0;
  const rpm = telemetry?.rpm || 1500.0;
  const maxVel = telemetry?.max_velocity || 0.0;
  const autoPhase = telemetry?.auto_phase || 'STOPPED';
  const isShaking = vibration > 0.5;

  // Maintain rolling telemetry history for real-time sensor sparklines
  useEffect(() => {
    setHistory((prev) => {
      const next = [...prev, { time: (Date.now() / 1000) % 1000, vibration, temp, rpm, maxVel }];
      return next.slice(-40); // keep last 40 data points
    });
  }, [telemetry]);

  // WebGL 3D Viewport Setup
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight || 280;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0a0c);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(3.2, 2.6, 4.0);
    camera.lookAt(0, 0.8, 0);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    container.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    const mainLight = new THREE.DirectionalLight(0x8b5cf6, 1.6);
    mainLight.position.set(5, 8, 5);
    mainLight.castShadow = true;
    scene.add(mainLight);

    const grid = new THREE.GridHelper(10, 20, 0x8b5cf6, 0x1f1f26);
    scene.add(grid);

    // Robot structure
    const baseGeo = new THREE.CylinderGeometry(0.5, 0.65, 0.2, 32);
    const baseMat = new THREE.MeshStandardMaterial({ color: 0x18181b, metalness: 0.8, roughness: 0.2 });
    const baseMesh = new THREE.Mesh(baseGeo, baseMat);
    baseMesh.position.y = 0.1;
    scene.add(baseMesh);

    const shoulderPanGroup = new THREE.Group();
    shoulderPanGroup.position.y = 0.2;
    scene.add(shoulderPanGroup);
    robotRef.current.shoulderPan = shoulderPanGroup;

    const shoulderGeo = new THREE.CylinderGeometry(0.3, 0.3, 0.35, 32);
    const metalMat = new THREE.MeshStandardMaterial({ color: 0x8b5cf6, metalness: 0.7, roughness: 0.3 });
    const shoulderMesh = new THREE.Mesh(shoulderGeo, metalMat);
    shoulderMesh.position.y = 0.175;
    shoulderPanGroup.add(shoulderMesh);

    const shoulderLiftGroup = new THREE.Group();
    shoulderLiftGroup.position.y = 0.35;
    shoulderPanGroup.add(shoulderLiftGroup);
    robotRef.current.shoulderLift = shoulderLiftGroup;

    const upperArmGeo = new THREE.CylinderGeometry(0.12, 0.12, 1.1, 32);
    const armMat = new THREE.MeshStandardMaterial({ color: 0x3b82f6, metalness: 0.6, roughness: 0.3 });
    const upperArmMesh = new THREE.Mesh(upperArmGeo, armMat);
    upperArmMesh.position.y = 0.55;
    shoulderLiftGroup.add(upperArmMesh);

    const elbowGroup = new THREE.Group();
    elbowGroup.position.y = 1.1;
    shoulderLiftGroup.add(elbowGroup);
    robotRef.current.elbow = elbowGroup;

    const jointSphereGeo = new THREE.SphereGeometry(0.16, 32, 32);
    const jointMat = new THREE.MeshStandardMaterial({ color: 0xef4444, metalness: 0.9, roughness: 0.1 });
    const elbowMesh = new THREE.Mesh(jointSphereGeo, jointMat);
    elbowGroup.add(elbowMesh);

    const forearmGeo = new THREE.CylinderGeometry(0.09, 0.09, 0.9, 32);
    const forearmMesh = new THREE.Mesh(forearmGeo, armMat);
    forearmMesh.position.y = 0.45;
    elbowGroup.add(forearmMesh);

    const wristGroup = new THREE.Group();
    wristGroup.position.y = 0.9;
    elbowGroup.add(wristGroup);
    robotRef.current.wrist = wristGroup;

    const toolGeo = new THREE.BoxGeometry(0.22, 0.15, 0.22);
    const toolMat = new THREE.MeshStandardMaterial({ color: 0xeab308, metalness: 0.8, roughness: 0.2 });
    const toolMesh = new THREE.Mesh(toolGeo, toolMat);
    wristGroup.add(toolMesh);

    let reqId;
    const animate = () => {
      reqId = requestAnimationFrame(animate);

      if (mountRef.current && isShaking) {
        const shakeX = (Math.random() - 0.5) * 6;
        const shakeY = (Math.random() - 0.5) * 6;
        mountRef.current.style.transform = `translate(${shakeX}px, ${shakeY}px)`;
      } else if (mountRef.current) {
        mountRef.current.style.transform = 'translate(0px, 0px)';
      }

      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight || 280;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(reqId);
      window.removeEventListener('resize', handleResize);
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [isShaking]);

  // Update Joint Rotations
  useEffect(() => {
    const j = telemetry?.joints || {};
    const { shoulderPan, shoulderLift, elbow, wrist } = robotRef.current;

    if (shoulderPan && j.shoulder_pan !== undefined) shoulderPan.rotation.y = j.shoulder_pan;
    if (shoulderLift && j.shoulder_lift !== undefined) shoulderLift.rotation.z = j.shoulder_lift;
    if (elbow && j.elbow !== undefined) elbow.rotation.z = j.elbow;
    if (wrist && j.wrist !== undefined) wrist.rotation.y = j.wrist;
  }, [telemetry]);

  const setCameraAngle = (angle) => {
    setViewAngle(angle);
    const cam = cameraRef.current;
    if (!cam) return;

    switch (angle) {
      case 'perspective': cam.position.set(3.2, 2.6, 4.0); cam.lookAt(0, 0.8, 0); break;
      case 'top':         cam.position.set(0, 5.0, 0.001); cam.lookAt(0, 0, 0); break;
      case 'side':        cam.position.set(4.5, 1.2, 0);   cam.lookAt(0, 0.8, 0); break;
      case 'closeup':     cam.position.set(1.5, 1.8, 1.5); cam.lookAt(0, 1.2, 0); break;
      default:            cam.position.set(3.2, 2.6, 4.0); cam.lookAt(0, 0.8, 0);
    }
  };

  return (
    <div className="bg-slate-950 text-slate-100 p-5 rounded-2xl border border-slate-800 shadow-2xl space-y-4 font-mono relative overflow-hidden">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <Cpu className="text-purple-400" size={20} />
          <h2 className="text-base font-bold text-slate-100 tracking-wide">
            MuJoCo Desktop Simulator Twin &amp; Telemetry Inspector
          </h2>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <button
            onClick={() => setShowHelp(!showHelp)}
            className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 flex items-center gap-1 transition-all"
          >
            <HelpCircle size={13} /> {showHelp ? 'Hide Shortcuts' : 'UI Shortcuts'}
          </button>

          {/* Camera View Angle Selector */}
          <div className="bg-slate-900 p-0.5 rounded border border-slate-800 flex items-center gap-0.5">
            {[
              { id: 'perspective', label: '3D Iso' },
              { id: 'top',         label: 'Top' },
              { id: 'side',        label: 'Side' },
              { id: 'closeup',     label: 'Gripper' },
            ].map(({ id, label }) => (
              <button
                key={id}
                onClick={() => setCameraAngle(id)}
                className={`px-2 py-0.5 rounded text-[11px] font-bold transition-all ${
                  viewAngle === id
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {isShaking && (
            <span className="px-2.5 py-1 rounded bg-rose-950/80 text-rose-300 text-xs border border-rose-800/80 flex items-center gap-1 animate-pulse font-bold">
              <AlertTriangle size={12} /> FAULT: VIBRATION ({(vibration).toFixed(2)}G)
            </span>
          )}
        </div>
      </div>

      {/* Main Grid Layout: Left Watcher, Middle 3D Viewport, Right Sensor Sparklines */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        
        {/* Left MuJoCo Watch & Control Column (3 cols) */}
        <div className="lg:col-span-3 space-y-3">
          {/* Watch Panel */}
          <div className="bg-slate-900/90 p-3 rounded-xl border border-rose-950/60 space-y-2 text-[11px]">
            <div className="flex items-center justify-between text-rose-400 font-bold border-b border-rose-950/60 pb-1">
              <span>Watch Field</span>
              <span className="text-slate-500">qpos</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-slate-300">
              <div><span className="text-slate-500 block text-[10px]">Time:</span> {(history[history.length-1]?.time || 0).toFixed(2)}s</div>
              <div><span className="text-slate-500 block text-[10px]">Solver:</span> -15.0 (1 it)</div>
              <div><span className="text-slate-500 block text-[10px]">FPS:</span> 60 / 60</div>
              <div><span className="text-slate-500 block text-[10px]">Max Vel:</span> {maxVel.toFixed(2)} rad/s</div>
            </div>
          </div>

          {/* MuJoCo Joint Slider Controls (Red/Grey theme matching screenshot) */}
          <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800 space-y-2 text-[11px]">
            <div className="flex items-center justify-between text-slate-300 font-bold border-b border-slate-800 pb-1">
              <span>Joint Angle Actuators</span>
              <Activity size={12} className="text-purple-400" />
            </div>
            {[
              { name: 'shoulder_pan',  val: joints.shoulder_pan },
              { name: 'shoulder_lift', val: joints.shoulder_lift },
              { name: 'elbow_joint',   val: joints.elbow },
              { name: 'wrist_roll',    val: joints.wrist },
            ].map(({ name, val }) => {
              const v = val !== undefined ? val : 0.0;
              return (
                <div key={name} className="flex items-center justify-between text-slate-400">
                  <span className="text-[10px] text-slate-500 font-mono">{name}</span>
                  <span className="px-2 py-0.5 rounded bg-slate-950 text-purple-300 text-[10px] border border-slate-800">
                    {v.toFixed(2)} rad
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Center Column: 3D Viewport with Keyboard Shortcuts Overlay (6 cols) */}
        <div className="lg:col-span-6 relative">
          <div 
            ref={mountRef} 
            className="w-full h-[280px] rounded-xl overflow-hidden border border-slate-800 relative bg-[#0a0a0c] shadow-inner"
          />

          {/* Keyboard Shortcuts Overlay Box (matching MuJoCo image) */}
          {showHelp && (
            <div className="absolute inset-4 bg-slate-950/95 backdrop-blur-md p-4 rounded-xl border border-slate-800 text-[11px] text-slate-300 space-y-1.5 z-20 overflow-y-auto">
              <div className="flex items-center justify-between border-b border-slate-800 pb-1 text-purple-400 font-bold">
                <span>MuJoCo Desktop Controls</span>
                <span>Keyboard Shortcuts</span>
              </div>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[10px]">
                <span className="text-slate-400">Play / Pause:</span> <span>Space</span>
                <span className="text-slate-400">Speed Up / Down:</span> <span>+ -</span>
                <span className="text-slate-400">Step Back / Forward:</span> <span>Left / Right Arrow</span>
                <span className="text-slate-400">Toggle UI:</span> <span>Tab / Shift-Tab</span>
                <span className="text-slate-400">Free Camera:</span> <span>Esc</span>
                <span className="text-slate-400">Select Joint:</span> <span>Double-Click</span>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Real-Time Sensor Graphs & Sparklines (3 cols) */}
        <div className="lg:col-span-3 space-y-3">
          {/* Vibration Sensor Graph */}
          <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800 space-y-1.5">
            <div className="flex items-center justify-between text-[11px] font-bold text-rose-400">
              <span className="flex items-center gap-1"><Zap size={12} /> Vibration (G-force)</span>
              <span>{vibration.toFixed(2)} G</span>
            </div>
            {/* SVG Sparkline */}
            <div className="w-full h-12 bg-slate-950 rounded border border-slate-800/80 p-1 flex items-end">
              <svg className="w-full h-full" viewBox="0 0 100 30" preserveAspectRatio="none">
                <polyline
                  fill="none"
                  stroke={vibration > 0.5 ? '#f43f5e' : '#a855f7'}
                  strokeWidth="2"
                  points={history.map((h, i) => `${(i / 40) * 100},${30 - Math.min(30, (h.vibration / 1.5) * 30)}`).join(' ')}
                />
              </svg>
            </div>
          </div>

          {/* Thermal Heat Sensor Graph */}
          <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800 space-y-1.5">
            <div className="flex items-center justify-between text-[11px] font-bold text-amber-400">
              <span className="flex items-center gap-1"><Flame size={12} /> Motor Temp (°C)</span>
              <span>{temp.toFixed(1)} °C</span>
            </div>
            {/* SVG Sparkline */}
            <div className="w-full h-12 bg-slate-950 rounded border border-slate-800/80 p-1 flex items-end">
              <svg className="w-full h-full" viewBox="0 0 100 30" preserveAspectRatio="none">
                <polyline
                  fill="none"
                  stroke={temp > 75 ? '#f59e0b' : '#3b82f6'}
                  strokeWidth="2"
                  points={history.map((h, i) => `${(i / 40) * 100},${30 - Math.min(30, ((h.temp - 50) / 60) * 30)}`).join(' ')}
                />
              </svg>
            </div>
          </div>

          {/* Actuator RPM Graph */}
          <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800 space-y-1.5">
            <div className="flex items-center justify-between text-[11px] font-bold text-emerald-400">
              <span className="flex items-center gap-1"><BarChart2 size={12} /> Drive RPM</span>
              <span>{rpm.toFixed(0)} RPM</span>
            </div>
            {/* SVG Sparkline */}
            <div className="w-full h-12 bg-slate-950 rounded border border-slate-800/80 p-1 flex items-end">
              <svg className="w-full h-full" viewBox="0 0 100 30" preserveAspectRatio="none">
                <polyline
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="2"
                  points={history.map((h, i) => `${(i / 40) * 100},${30 - Math.min(30, (h.rpm / 2000) * 30)}`).join(' ')}
                />
              </svg>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

export default SimulationView;
