import React, { useState, useEffect, useRef } from 'react';
import {
  Flame,
  ShieldAlert,
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Lock,
  ArrowRight,
  ShieldCheck,
  Radio,
  Server,
  Monitor,
  Printer,
  Database,
  Terminal,
  Activity,
  Zap,
  Scissors,
  Check,
  Cpu,
  Wifi,
  Sparkles,
  Info
} from 'lucide-react';
import { api } from '../services/api';
import { AttackSimResult, AttackStep } from '../types';

export const AttackSimulation: React.FC = () => {
  const [scenarios, setScenarios] = useState<any[]>([]);
  const [selectedScenarioId, setSelectedScenarioId] = useState('comp_pc');
  const [simulationResult, setSimulationResult] = useState<AttackSimResult | null>(null);

  // Animation Engine State - Autoplay on mount so professors see live action immediately
  const [isPlaying, setIsPlaying] = useState(true);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [animSpeed, setAnimSpeed] = useState<number>(2000); // ms per step
  const [exfiltratedMb, setExfiltratedMb] = useState(0);
  const [infectionPct, setInfectionPct] = useState(15);
  const [packetsIntercepted, setPacketsIntercepted] = useState(420);
  const [isQuarantined, setIsQuarantined] = useState(false);
  const [activeTab, setActiveTab] = useState<'graph' | 'killchain' | 'telemetry'>('graph');
  const [terminalLogs, setTerminalLogs] = useState<string[]>([
    `[${new Date().toLocaleTimeString()}] [SYS_INIT] CyberShield Defensive Simulation Sandbox primed.`,
    `[${new Date().toLocaleTimeString()}] [MONITOR] Continuous telemetry monitoring active on subnet 192.168.1.0/24.`
  ]);
  const timerRef = useRef<any>(null);
  const packetTimerRef = useRef<any>(null);

  const fallbackScenarios = [
    {
      id: 'comp_pc',
      name: 'Compromised Lab PC (Lateral Movement)',
      description: 'Simulate an attacker gaining control of Lab PC-03 and attempting lateral movement across the internal laboratory subnet toward the Research Server and Database.',
      compromised_node: 'Lab PC-03'
    },
    {
      id: 'susp_login',
      name: 'Suspicious Login (Credential Stuffing on 3D Printer)',
      description: 'Simulate anomalous automated credential stuffing attempts targeting the 3D Printer controller from an unapproved external IP address.',
      compromised_node: '3D Printer'
    },
    {
      id: 'unauth_server',
      name: 'Unauthorized Server Direct Access',
      description: 'Simulate an unauthorized insider attempting direct port probing on the high-performance Research Server model repository.',
      compromised_node: 'Research Server'
    }
  ];

  const defaultResult: AttackSimResult = {
    scenario_name: 'Compromised Lab PC (Lateral Movement)',
    description: 'Simulates an attacker gaining control of Lab PC-03 via malicious payload and attempting to pivot across the internal subnet to target the Research Server and Database.',
    compromised_node: 'Lab PC-03',
    at_risk_nodes: ['Lab PC-01', 'Research Server', 'Database'],
    safe_nodes: ['IoT Sensor', '3D Printer', 'Smart Door'],
    blocked_nodes: ['Smart Door'],
    risk_delta: 45,
    potential_impact: 'Critical exfiltration of laboratory research datasets and intellectual property.',
    recommended_containment: 'Isolate Lab PC-03 network port via digital twin quarantine switch and revoke active session tokens.',
    containment_available: true,
    steps: [
      {
        step_num: 1,
        title: 'Initial Access (Phishing Macro Execution)',
        description: 'Adversary achieves initial shell on Lab PC-03 via student email attachment.',
        source_node: 'External Attacker',
        target_node: 'Lab PC-03',
        technique_id: 'T1204.002',
        status: 'Compromised'
      },
      {
        step_num: 2,
        title: 'Subnet Reconnaissance & Port Scanning',
        description: 'Attacker scans 192.168.1.0/24 discovering open SSH port 22 and SQL port 5432.',
        source_node: 'Lab PC-03',
        target_node: 'Research Server',
        technique_id: 'T1046',
        status: 'At Risk'
      },
      {
        step_num: 3,
        title: 'Credential Dumping via LSASS',
        description: 'Cached laboratory researcher credentials dumped to execute pass-the-hash on Database.',
        source_node: 'Lab PC-03',
        target_node: 'Database',
        technique_id: 'T1003.001',
        status: 'At Risk'
      },
      {
        step_num: 4,
        title: 'Adaptive Zero-Trust Defense Enforcement',
        description: 'CyberShield R-AAC engine detects abnormal port entropy and activates perimeter firewall shielding Smart Door.',
        source_node: 'CyberShield Engine',
        target_node: 'Smart Door',
        technique_id: 'D3-NDP',
        status: 'Blocked'
      }
    ]
  };

  const loadScenarioData = async (id: string) => {
    try {
      const res = await api.runAttackSimulation(id);
      if (res && Array.isArray(res.steps) && res.steps.length > 0) {
        setSimulationResult(res);
      } else {
        setSimulationResult(defaultResult);
      }
    } catch {
      setSimulationResult(defaultResult);
    }
  };

  useEffect(() => {
    setScenarios(fallbackScenarios);
    loadScenarioData(selectedScenarioId);
    resetSimulationState(false);
  }, [selectedScenarioId]);

  // Continuous subtle packet counter ticker for live laboratory feel
  useEffect(() => {
    packetTimerRef.current = setInterval(() => {
      if (!isQuarantined && isPlaying) {
        setPacketsIntercepted((prev) => prev + Math.floor(Math.random() * 8) + 3);
      }
    }, 400);
    return () => clearInterval(packetTimerRef.current);
  }, [isQuarantined, isPlaying]);

  const resetSimulationState = (pause: boolean = true) => {
    setIsPlaying(!pause);
    clearInterval(timerRef.current);
    setCurrentStepIndex(0);
    setExfiltratedMb(0);
    setInfectionPct(15);
    setIsQuarantined(false);
    setTerminalLogs([
      `[${new Date().toLocaleTimeString()}] [SYS_INIT] CyberShield Defensive Simulation Sandbox primed.`,
      `[${new Date().toLocaleTimeString()}] [READY] Kill-chain loop active. Observing lateral movement telemetry.`
    ]);
  };

  // Step-by-step automated animation loop
  useEffect(() => {
    if (isPlaying && !isQuarantined) {
      timerRef.current = setInterval(() => {
        setCurrentStepIndex((prev) => {
          const maxSteps = simulationResult?.steps?.length || 4;
          const next = prev + 1;
          if (next >= maxSteps) {
            // Loop smoothly back to step 0 after brief pause
            return 0;
          }
          return next;
        });
      }, animSpeed);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [isPlaying, animSpeed, simulationResult, isQuarantined]);

  // Update dynamic metrics & logs based on current animated step
  useEffect(() => {
    const timeStr = new Date().toLocaleTimeString();
    if (isQuarantined) return;

    if (currentStepIndex === 0) {
      setExfiltratedMb(12);
      setInfectionPct(20);
      setTerminalLogs((prev) => [
        `[${timeStr}] [ALERT] Phase 1: Initial Access payload executed on ${simulationResult?.compromised_node || 'Lab PC-03'} (T1204.002)`,
        `[${timeStr}] [BEACON] Reverse shell spawned from 192.168.1.103:4444 to adversary C2 gateway`,
        ...prev.slice(0, 6)
      ]);
    } else if (currentStepIndex === 1) {
      setExfiltratedMb(185);
      setInfectionPct(45);
      setTerminalLogs((prev) => [
        `[${timeStr}] [WARNING] Phase 2: High-velocity SYN sweep across 192.168.1.0/24 (T1046)`,
        `[${timeStr}] [PROBE] Open SSH port 22 & SQL port 5432 discovered on Research Server`,
        ...prev.slice(0, 6)
      ]);
    } else if (currentStepIndex === 2) {
      setExfiltratedMb(520);
      setInfectionPct(75);
      setTerminalLogs((prev) => [
        `[${timeStr}] [CRITICAL] Phase 3: LSASS credential extraction in progress (T1003.001)`,
        `[${timeStr}] [EXFIL] Extracted hash tables transmitted across internal bridge to Database`,
        ...prev.slice(0, 6)
      ]);
    } else if (currentStepIndex >= 3) {
      setExfiltratedMb(895);
      setInfectionPct(85);
      setTerminalLogs((prev) => [
        `[${timeStr}] [DEFENSE] Phase 4: CyberShield Zero-Trust R-AAC flags abnormal port entropy!`,
        `[${timeStr}] [SHIELD] Defensive perimeter rule triggered: Smart Door access HARD BLOCKED`,
        ...prev.slice(0, 6)
      ]);
    }
  }, [currentStepIndex, isQuarantined, simulationResult]);

  const handleStartAnimation = () => {
    if (isQuarantined) {
      resetSimulationState(false);
    }
    setIsPlaying(true);
  };

  const handlePause = () => {
    setIsPlaying(false);
  };

  const handleNextStep = () => {
    const maxSteps = simulationResult?.steps.length || 4;
    setCurrentStepIndex((prev) => (prev < maxSteps - 1 ? prev + 1 : 0));
  };

  const handleDeployQuarantine = async () => {
    setIsPlaying(false);
    clearInterval(timerRef.current);
    setIsQuarantined(true);
    setInfectionPct(0);

    const timeStr = new Date().toLocaleTimeString();
    setTerminalLogs((prev) => [
      `[${timeStr}] [CONTAINMENT] ZERO-TRUST QUARANTINE APPLIED TO ${simulationResult?.compromised_node || 'Lab PC-03'}!`,
      `[${timeStr}] [ISOLATED] Lateral propagation vector severed. 0 packet leakage.`,
      `[${timeStr}] [STATUS] Node placed into hardware isolation enclave. Threat neutralized!`,
      ...prev.slice(0, 6)
    ]);

    try {
      if (simulationResult?.compromised_node) {
        await api.containAttack(simulationResult.compromised_node);
      }
    } catch {
      // handled
    }
  };

  const currentScenario = scenarios.find((s) => s.id === selectedScenarioId) || scenarios[0];
  const activeStep = simulationResult?.steps[currentStepIndex] || defaultResult.steps[0];

  return (
    <div className="space-y-6">
      {/* Top Header with Playback Controls (matching professor demonstration workflow) */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">
              Attack Simulation (Digital Twin)
            </h2>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${isPlaying ? 'bg-rose-500 animate-ping' : 'bg-slate-400'}`} />
              {isPlaying ? 'Live MITRE ATT&CK Playback' : 'Playback Paused'}
            </span>
            {isQuarantined && (
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-cyan-50 text-cyan-700 border border-cyan-200 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                Zero-Trust Quarantine Active
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time animated malware lateral movement, packet propagation, and defensive Zero-Trust containment
          </p>
        </div>

        {/* Playback Button Group */}
        <div className="flex items-center gap-2">
          {!isPlaying ? (
            <button
              onClick={handleStartAnimation}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md shadow-rose-600/30 transition-all cursor-pointer"
            >
              <Play className="w-4 h-4 fill-white" />
              {isQuarantined ? 'Restart Attack Simulation' : 'Resume Animation'}
            </button>
          ) : (
            <button
              onClick={handlePause}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-md shadow-amber-600/30 transition-all cursor-pointer"
            >
              <Pause className="w-4 h-4" />
              Pause Playback
            </button>
          )}

          <button
            onClick={handleNextStep}
            className="px-3 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold text-xs transition-all cursor-pointer"
            title="Step to next kill-chain phase"
          >
            Step ⏭
          </button>

          <button
            onClick={() => resetSimulationState(false)}
            className="p-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-all cursor-pointer"
            title="Reset Simulation"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Speed Selector */}
          <select
            value={animSpeed}
            onChange={(e) => setAnimSpeed(Number(e.target.value))}
            className="p-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 cursor-pointer"
          >
            <option value={3000}>0.7x Speed (Presentation)</option>
            <option value={2000}>1.0x Speed (Standard)</option>
            <option value={1000}>2.0x Speed (Fast-Forward)</option>
          </select>
        </div>
      </div>

      {/* Live Phase Progress Tracker Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-2">
        <div className="flex flex-wrap justify-between items-center text-xs gap-2">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-blue-600 uppercase tracking-wider">
              Active Phase {currentStepIndex + 1} of 4:
            </span>
            <span className="font-bold text-slate-900">{activeStep.title}</span>
            <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200 font-semibold">
              MITRE {activeStep.technique_id}
            </span>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono">
            <span className="text-slate-600">
              Packets Intercepted: <strong className="text-blue-600">{packetsIntercepted}</strong>
            </span>
            <span className="text-slate-600">
              Data Exfiltrated: <strong className="text-rose-600">{exfiltratedMb} MB</strong>
            </span>
            <span className="text-slate-600">
              Subnet Compromise: <strong className="text-rose-600">{infectionPct}%</strong>
            </span>
          </div>
        </div>

        {/* Animated Multi-Segment Progress Line */}
        <div className="grid grid-cols-4 gap-1.5 h-2.5 w-full bg-slate-100 rounded-full p-0.5 overflow-hidden">
          {[0, 1, 2, 3].map((stepIdx) => (
            <div
              key={stepIdx}
              className={`h-full rounded-full transition-all duration-700 ${
                isQuarantined
                  ? 'bg-blue-600'
                  : currentStepIndex === stepIdx
                  ? 'bg-rose-500 animate-pulse'
                  : currentStepIndex > stepIdx
                  ? stepIdx === 3
                    ? 'bg-emerald-500'
                    : 'bg-rose-500'
                  : 'bg-slate-200'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Main Layout: Left Scenario Controls & Right Animated War Room Graph */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (4 cols) */}
        <div className="lg:col-span-4 space-y-5">
          {/* Scenario Selection Card */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1.5 uppercase tracking-wider">
                Select Attack Scenario
              </label>
              <select
                value={selectedScenarioId}
                onChange={(e) => setSelectedScenarioId(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 text-slate-900 text-xs font-bold bg-white cursor-pointer"
              >
                {scenarios.map((sc) => (
                  <option key={sc.id} value={sc.id}>
                    {sc.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1.5 uppercase tracking-wider">
                Scenario Threat Vector
              </label>
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-600 leading-relaxed min-h-[90px]">
                {currentScenario?.description}
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleStartAnimation}
                className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Play className="w-4 h-4 fill-white" />
                {isPlaying ? 'Running Simulation...' : 'Run Simulation'}
              </button>
              <button
                onClick={() => resetSimulationState(false)}
                className="p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition-all cursor-pointer"
                title="Restart"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Defensive Quarantine Card (The Professor "Aha!" Moment) */}
          <div className={`p-5 rounded-2xl border transition-all space-y-3 ${
            isQuarantined 
              ? 'bg-blue-50/70 border-blue-200' 
              : 'bg-white border-slate-200/80 shadow-xs'
          }`}>
            <div className="flex items-start gap-2.5">
              <ShieldAlert className={`w-5 h-5 shrink-0 mt-0.5 ${isQuarantined ? 'text-blue-600' : 'text-rose-600'}`} />
              <div>
                <h4 className="text-xs font-bold text-slate-900">
                  {isQuarantined ? 'Containment Enclave Active' : 'Zero-Trust Containment Defense'}
                </h4>
                <p className="text-[11px] text-slate-600 leading-snug mt-0.5">
                  {isQuarantined
                    ? 'Subnet isolation enforced. Lateral propagation vectors severed at SDN layer.'
                    : 'Click below to isolate the compromised node via digital twin quarantine switch.'}
                </p>
              </div>
            </div>

            {!isQuarantined ? (
              <button
                onClick={handleDeployQuarantine}
                className="w-full py-2.5 px-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md shadow-rose-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer animate-pulse"
              >
                <Scissors className="w-4 h-4" />
                Deploy Quarantine Isolation (Contain)
              </button>
            ) : (
              <div className="space-y-2">
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Node Quarantined! Attack vector severed successfully.</span>
                </div>
                <button
                  onClick={() => resetSimulationState(false)}
                  className="w-full py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Reset Quarantine & Rerun Attack
                </button>
              </div>
            )}
          </div>

          {/* Live Streaming Terminal Syslog */}
          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 text-white font-mono text-[11px] space-y-2 shadow-lg">
            <div className="flex items-center justify-between text-slate-400 border-b border-slate-800 pb-1.5 text-[10px]">
              <span className="flex items-center gap-1.5 font-bold text-slate-300">
                <Terminal className="w-3.5 h-3.5 text-blue-400" />
                LIVE SECURITY EVENT LOG
              </span>
              <span className="flex items-center gap-1 text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                STREAMING
              </span>
            </div>
            <div className="space-y-1.5 overflow-y-auto max-h-40 scrollbar-none leading-relaxed">
              {terminalLogs.map((log, i) => (
                <div
                  key={i}
                  className={`${
                    log.includes('CRITICAL')
                      ? 'text-rose-400 font-semibold'
                      : log.includes('WARNING')
                      ? 'text-amber-400'
                      : log.includes('CONTAINMENT') || log.includes('ISOLATED')
                      ? 'text-emerald-400 font-bold'
                      : log.includes('DEFENSE') || log.includes('SHIELD')
                      ? 'text-cyan-400 font-semibold'
                      : 'text-slate-300'
                  }`}
                >
                  {log}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Animated Cyber War Room Canvas (8 cols) */}
        <div className="lg:col-span-8 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-5">
          <div className="flex flex-wrap justify-between items-center gap-2">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                Digital Twin Interactive Attack Graph
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-bold">
                  SVG Active Vector Engine
                </span>
              </h3>
              <p className="text-xs text-slate-500">
                Live animated packet flow, lateral pivoting, and zero-trust perimeter containment
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs font-semibold text-slate-600">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                Safe
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
                Compromised
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-orange-500" />
                At Risk
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
                Blocked Gate
              </span>
            </div>
          </div>

          {/* Interactive Dark Cyber Animated Canvas with Moving Laser Streams */}
          <div className="relative bg-[#060D1F] rounded-2xl border border-slate-800 p-6 min-h-[380px] flex items-center justify-center overflow-hidden select-none shadow-2xl">
            {/* Background High-Tech Grid & Scanline */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#0F172A25_1px,transparent_1px),linear-gradient(to_bottom,#0F172A25_1px,transparent_1px)] bg-[size:28px_28px] pointer-events-none" />

            {/* Radar sweep beam */}
            <div className="absolute w-[450px] h-[450px] rounded-full border border-slate-800/40 pointer-events-none opacity-40">
              <div 
                className="w-full h-full rounded-full border-t-2 border-r border-blue-500/20"
                style={{ animation: 'radar-sweep 8s linear infinite' }}
              />
            </div>

            {/* Pulsing Radiation Glow under compromised node */}
            <div
              className={`absolute w-72 h-72 rounded-full blur-3xl transition-colors duration-700 pointer-events-none ${
                isQuarantined ? 'bg-cyan-600/20' : 'bg-rose-600/30 animate-pulse'
              }`}
            />

            {/* Live Telemetry HUD Overlay in Top-Left of Canvas */}
            <div className="absolute top-3 left-3 bg-slate-950/80 backdrop-blur-md border border-slate-800 rounded-xl px-3 py-2 text-[10px] font-mono text-slate-300 z-30 space-y-0.5">
              <div className="text-blue-400 font-bold flex items-center gap-1">
                <Activity className="w-3 h-3 animate-pulse" />
                NET_TELEMETRY_HUD
              </div>
              <div>C2 State: <span className={isQuarantined ? 'text-emerald-400 font-bold' : 'text-rose-400'}>{isQuarantined ? 'SEVERED (0 bps)' : 'ESTABLISHED (4444/TCP)'}</span></div>
              <div>Subnet: <span className="text-slate-400">192.168.1.0/24</span></div>
              <div>Defense SLA: <span className="text-emerald-400 font-bold">&lt; 150ms R-AAC</span></div>
            </div>

            {/* SVG Network Canvas with Continuous Moving Animated Laser Beams */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none z-10">
              <defs>
                <linearGradient id="attackGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#EF4444" />
                  <stop offset="100%" stopColor="#F97316" />
                </linearGradient>
                <linearGradient id="shieldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#06B6D4" />
                  <stop offset="100%" stopColor="#3B82F6" />
                </linearGradient>
                <filter id="glow">
                  <feGaussianBlur stdDeviation="3.5" result="coloredBlur" />
                  <feMerge>
                    <feMergeNode in="coloredBlur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              {/* Wire 1: Attacker -> Lab PC-03 (Center) */}
              <line
                x1="12%" y1="50%" x2="50%" y2="50%"
                stroke={isQuarantined ? '#64748B' : '#EF4444'}
                strokeWidth={isQuarantined ? '2' : '3'}
                strokeDasharray="6 4"
                className={isQuarantined ? '' : 'animate-dash-flow'}
                filter={isQuarantined ? undefined : 'url(#glow)'}
              />

              {/* Wire 2: Lab PC-03 -> Lab PC-01 (Top Left) */}
              <line
                x1="50%" y1="50%" x2="28%" y2="24%"
                stroke={isQuarantined ? '#10B981' : currentStepIndex >= 1 ? '#F97316' : '#334155'}
                strokeWidth="2.5"
                strokeDasharray={currentStepIndex >= 1 && !isQuarantined ? '6 4' : 'none'}
                className={currentStepIndex >= 1 && !isQuarantined ? 'animate-dash-flow' : ''}
              />

              {/* Wire 3: Lab PC-03 -> Research Server (Top Right) */}
              <line
                x1="50%" y1="50%" x2="72%" y2="24%"
                stroke={isQuarantined ? '#10B981' : currentStepIndex >= 1 ? '#EF4444' : '#334155'}
                strokeWidth="3"
                strokeDasharray={currentStepIndex >= 1 && !isQuarantined ? '6 4' : 'none'}
                className={currentStepIndex >= 1 && !isQuarantined ? 'animate-dash-flow' : ''}
                filter={currentStepIndex >= 1 && !isQuarantined ? 'url(#glow)' : undefined}
              />

              {/* Wire 4: Lab PC-03 -> Database (Bottom Right) */}
              <line
                x1="50%" y1="50%" x2="72%" y2="76%"
                stroke={isQuarantined ? '#10B981' : currentStepIndex >= 2 ? '#EF4444' : '#334155'}
                strokeWidth="3"
                strokeDasharray={currentStepIndex >= 2 && !isQuarantined ? '6 4' : 'none'}
                className={currentStepIndex >= 2 && !isQuarantined ? 'animate-dash-flow' : ''}
                filter={currentStepIndex >= 2 && !isQuarantined ? 'url(#glow)' : undefined}
              />

              {/* Wire 5: Lab PC-03 -> 3D Printer (Bottom Left) */}
              <line
                x1="50%" y1="50%" x2="28%" y2="76%"
                stroke="#10B981"
                strokeWidth="2"
              />

              {/* Wire 6: Lab PC-03 -> Smart Door (Far Right Gate - Shielded) */}
              <line
                x1="50%" y1="50%" x2="88%" y2="50%"
                stroke="#06B6D4"
                strokeWidth="3"
                strokeDasharray="4 4"
                className="animate-dash-flow"
                filter="url(#glow)"
              />

              {/* Traveling Packet Animation Particles (Real Moving SVG Elements) */}
              {!isQuarantined && isPlaying && (
                <>
                  {/* Packet traveling from Attacker to Lab PC-03 */}
                  <circle cx="28%" cy="50%" r="4.5" fill="#F87171" filter="url(#glow)">
                    <animate attributeName="cx" from="12%" to="50%" dur="1.4s" repeatCount="indefinite" />
                  </circle>

                  {/* Packet traveling from Lab PC-03 to Research Server */}
                  {currentStepIndex >= 1 && (
                    <circle cx="60%" cy="36%" r="4" fill="#F87171" filter="url(#glow)">
                      <animate attributeName="cx" from="50%" to="72%" dur="1.2s" repeatCount="indefinite" />
                      <animate attributeName="cy" from="50%" to="24%" dur="1.2s" repeatCount="indefinite" />
                    </circle>
                  )}

                  {/* Packet traveling from Lab PC-03 to Database */}
                  {currentStepIndex >= 2 && (
                    <circle cx="60%" cy="64%" r="4" fill="#FB923C" filter="url(#glow)">
                      <animate attributeName="cx" from="50%" to="72%" dur="1.2s" repeatCount="indefinite" />
                      <animate attributeName="cy" from="50%" to="76%" dur="1.2s" repeatCount="indefinite" />
                    </circle>
                  )}

                  {/* Defensive deflect flash at Smart Door */}
                  {currentStepIndex >= 3 && (
                    <circle cx="88%" cy="50%" r="9" fill="none" stroke="#22D3EE" strokeWidth="2" className="animate-ping" />
                  )}
                </>
              )}

              {/* Quarantined Cut Badge on vector */}
              {isQuarantined && (
                <g transform="translate(190, 160)">
                  <rect x="0" y="0" width="90" height="24" rx="8" fill="#0F172A" stroke="#38BDF8" strokeWidth="2" />
                  <text x="45" y="16" fill="#38BDF8" fontSize="10" fontWeight="900" textAnchor="middle" letterSpacing="1">
                    ✂ SEVERED
                  </text>
                </g>
              )}
            </svg>

            {/* Network Graph Nodes Layout */}
            <div className="relative w-full max-w-lg h-72 flex items-center justify-center z-20">
              {/* External Threat Source (Far Left) */}
              <div className="absolute left-2 top-1/2 -translate-y-1/2 flex flex-col items-center">
                <div className="w-12 h-12 rounded-xl bg-slate-900 border-2 border-rose-500 text-rose-400 flex flex-col items-center justify-center shadow-lg shadow-rose-950/60">
                  <Zap className="w-5 h-5 animate-bounce" />
                </div>
                <span className="text-[10px] font-bold text-rose-400 mt-1">Adversary C2</span>
              </div>

              {/* Central Compromised Node (Lab PC-03) */}
              <div className="z-20 flex flex-col items-center">
                <div
                  className={`w-24 h-24 rounded-2xl flex flex-col items-center justify-center font-bold text-center p-2 transition-all duration-500 shadow-2xl ${
                    isQuarantined
                      ? 'bg-slate-950 border-4 border-cyan-400 text-cyan-300 shadow-cyan-500/40 ring-4 ring-cyan-500/20'
                      : 'bg-rose-600 border-4 border-rose-300 text-white shadow-rose-600/60 scale-105 animate-pulse'
                  }`}
                >
                  {isQuarantined ? (
                    <Lock className="w-8 h-8 mb-0.5 text-cyan-300" />
                  ) : (
                    <Monitor className="w-8 h-8 mb-0.5" />
                  )}
                  <span className="text-xs font-black truncate max-w-[85px]">
                    {simulationResult?.compromised_node || 'Lab PC-03'}
                  </span>
                  <span className="text-[9px] font-mono opacity-80">192.168.1.103</span>
                </div>
                <span
                  className={`text-[10px] font-black mt-1.5 uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                    isQuarantined
                      ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40'
                      : 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                  }`}
                >
                  {isQuarantined ? 'ISOLATION ENCLAVE' : 'COMPROMISED NODE'}
                </span>
              </div>

              {/* Node: Lab PC-01 (Top Left) */}
              <div className="absolute top-2 left-20 flex flex-col items-center">
                <div
                  className={`w-14 h-14 rounded-xl border-2 flex flex-col items-center justify-center text-center p-1 transition-all ${
                    isQuarantined
                      ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300'
                      : currentStepIndex >= 1
                      ? 'bg-orange-500/20 border-orange-400 text-orange-300 animate-pulse'
                      : 'bg-slate-900 border-slate-700 text-slate-300'
                  }`}
                >
                  <Monitor className="w-5 h-5 mb-0.5" />
                  <span className="text-[9px] font-bold">PC-01</span>
                </div>
                <span className="text-[10px] font-bold mt-0.5 text-slate-300">
                  {isQuarantined ? 'Safe' : currentStepIndex >= 1 ? 'At Risk' : 'Normal'}
                </span>
              </div>

              {/* Node: Server (Top Right) */}
              <div className="absolute top-2 right-20 flex flex-col items-center">
                <div
                  className={`w-14 h-14 rounded-xl border-2 flex flex-col items-center justify-center text-center p-1 transition-all ${
                    isQuarantined
                      ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300'
                      : currentStepIndex >= 1
                      ? 'bg-rose-500/25 border-rose-400 text-rose-300 animate-pulse'
                      : 'bg-slate-900 border-slate-700 text-slate-300'
                  }`}
                >
                  <Server className="w-5 h-5 mb-0.5" />
                  <span className="text-[9px] font-bold">HPC Server</span>
                </div>
                <span className="text-[10px] font-bold mt-0.5 text-slate-300">
                  {isQuarantined ? 'Safe' : currentStepIndex >= 1 ? 'Targeted' : 'Normal'}
                </span>
              </div>

              {/* Node: Database (Bottom Right) */}
              <div className="absolute bottom-2 right-20 flex flex-col items-center">
                <div
                  className={`w-14 h-14 rounded-xl border-2 flex flex-col items-center justify-center text-center p-1 transition-all ${
                    isQuarantined
                      ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300'
                      : currentStepIndex >= 2
                      ? 'bg-rose-500/25 border-rose-400 text-rose-300 animate-pulse'
                      : 'bg-slate-900 border-slate-700 text-slate-300'
                  }`}
                >
                  <Database className="w-5 h-5 mb-0.5" />
                  <span className="text-[9px] font-bold">Database</span>
                </div>
                <span className="text-[10px] font-bold mt-0.5 text-slate-300">
                  {isQuarantined ? 'Safe' : currentStepIndex >= 2 ? 'At Risk' : 'Normal'}
                </span>
              </div>

              {/* Node: 3D Printer (Bottom Left) */}
              <div className="absolute bottom-2 left-20 flex flex-col items-center">
                <div className="w-14 h-14 rounded-xl bg-emerald-500/20 border-2 border-emerald-400 text-emerald-300 flex flex-col items-center justify-center text-center p-1">
                  <Printer className="w-5 h-5 mb-0.5" />
                  <span className="text-[9px] font-bold">3D Printer</span>
                </div>
                <span className="text-[10px] font-bold text-emerald-400 mt-0.5">Protected</span>
              </div>

              {/* Node: Smart Door (Far Right Gate - Blocked by Zero-Trust) */}
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex flex-col items-center">
                <div className="w-12 h-12 rounded-xl bg-cyan-950 border-2 border-cyan-400 text-cyan-300 flex flex-col items-center justify-center shadow-lg shadow-cyan-950">
                  <Lock className="w-5 h-5" />
                </div>
                <span className="text-[9px] font-bold text-cyan-400 mt-1">Smart Door (Blocked)</span>
              </div>
            </div>
          </div>

          {/* Kill Chain Steps Progress Table */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center justify-between">
              <span>Kill-Chain Step Analysis (MITRE ATT&CK Framework)</span>
              <span className="text-[11px] font-normal text-slate-500">Click any step to jump to phase</span>
            </h4>
            <div className="space-y-2">
              {(Array.isArray(simulationResult?.steps) ? simulationResult.steps : defaultResult.steps).map((step, idx) => {
                const isCurrent = currentStepIndex === idx && !isQuarantined;
                const isPassed = currentStepIndex > idx || isQuarantined;

                return (
                  <div
                    key={step.step_num}
                    onClick={() => {
                      setCurrentStepIndex(idx);
                      setIsPlaying(false);
                    }}
                    className={`p-3 rounded-xl border text-xs cursor-pointer transition-all flex items-center justify-between ${
                      isCurrent
                        ? 'bg-rose-50/80 border-rose-300 shadow-xs'
                        : isPassed
                        ? 'bg-slate-50/70 border-slate-200'
                        : 'bg-white border-slate-100 opacity-60'
                    }`}
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-blue-600">Step {step.step_num}:</span>
                        <span className="font-bold text-slate-900">{step.title}</span>
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200 font-semibold">
                          {step.technique_id}
                        </span>
                      </div>
                      <p className="text-slate-600 text-[11px]">{step.description}</p>
                    </div>

                    <span
                      className={`font-bold px-2 py-0.5 rounded text-[10px] shrink-0 ${
                        isQuarantined
                          ? 'bg-blue-100 text-blue-800'
                          : step.status === 'Compromised'
                          ? 'bg-rose-100 text-rose-800'
                          : step.status === 'At Risk'
                          ? 'bg-orange-100 text-orange-800'
                          : step.status === 'Blocked'
                          ? 'bg-cyan-100 text-cyan-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {isQuarantined ? 'Contained' : step.status}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

