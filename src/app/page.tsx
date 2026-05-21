"use client";

import { useEffect, useMemo, useState } from "react";
import {
  generateSurveyData,
  generateInterviewData,
  countBy,
  countArrayField,
  toChartData,
  crossTab,
  type SurveyRecord,
  type InterviewRecord,
} from "@/utils/mockData";
import { BarChart, DonutChart, Heatmap, StatCard, RatingBar } from "@/components/Charts";

// ── Colour palette ─────────────────────────────────────────────
const COLORS = ["#06d6f0", "#10f0a0", "#f0a010", "#8b5cf6", "#f05060", "#f06010", "#0062ff", "#00e5ff"];

const TABS = [
  { id: "overview", label: "Vista General", icon: "🏠" },
  { id: "descriptivo", label: "Análisis Descriptivo", icon: "📊" },
  { id: "relaciones", label: "Relaciones & Cruces", icon: "🔗" },
  { id: "perfiles", label: "Perfiles de Cliente", icon: "👤" },
  { id: "match", label: "Match de Instrumentos", icon: "🔀" },
];

// ── Cross-tab variable options ─────────────────────────────────
const CROSS_OPTIONS: { label: string; key: keyof SurveyRecord }[] = [
  { label: "País de origen", key: "paisOrigen" },
  { label: "Tipo de contrato", key: "tipoContrato" },
  { label: "Frecuencia de visita", key: "frecuenciaVisita" },
  { label: "¿Usa parqueo actual?", key: "usaParqueoActual" },
  { label: "Rango horario preferido", key: "horarioPreferido" },
  { label: "Tiempo permanencia", key: "tiempoPromedioPermanencia" },
  { label: "Disposición de pago", key: "disposicionPago" },
  { label: "¿Ha sufrido robo?", key: "haExperienciadoRobo" },
  { label: "Conectividad", key: "tipoConectividad" },
  { label: "¿Usa apps logística?", key: "usaAppsLogistica" },
];

export default function Dashboard() {
  // ── Data loaded client-side only to avoid SSR/hydration mismatch ──
  const [surveys, setSurveys] = useState<SurveyRecord[]>([]);
  const [interviews, setInterviews] = useState<InterviewRecord[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setSurveys(generateSurveyData(120));
    setInterviews(generateInterviewData(20));
    setMounted(true);
  }, []);

  const [activeTab, setActiveTab] = useState("overview");
  const [tabKey, setTabKey] = useState(0);
  const [crossA, setCrossA] = useState<keyof SurveyRecord>("paisOrigen");
  const [crossB, setCrossB] = useState<keyof SurveyRecord>("disposicionPago");

  const handleTabChange = (id: string) => {
    if (id === activeTab) return;
    setActiveTab(id);
    setTabKey((k) => k + 1);
    window.scrollTo(0, 0);
  };

  // ── Overview stats ──────────────────────────────────────────
  const totalSurveys = surveys.length || 120;
  const pctSmartphone = surveys.length ? Math.round((surveys.filter((s) => s.tieneSmartphone === "Sí").length / surveys.length) * 100) : 0;
  const pctRobo = surveys.length ? Math.round((surveys.filter((s) => s.haExperienciadoRobo === "Sí").length / surveys.length) * 100) : 0;
  const pctPago = surveys.length ? Math.round((surveys.filter((s) => s.disposicionPago === "Sí").length / surveys.length) * 100) : 0;
  const avgInsatisfaccion = surveys.length ? (surveys.reduce((s, r) => s + r.nivelInsatisfaccion, 0) / surveys.length).toFixed(1) : "0.0";


  // ── Descriptive ─────────────────────────────────────────────
  const paisData = toChartData(countBy(surveys, "paisOrigen"));
  const contratoData = toChartData(countBy(surveys, "tipoContrato"));
  const frecuenciaData = toChartData(countBy(surveys, "frecuenciaVisita"));
  const rutaData = toChartData(countBy(surveys, "rutaPrincipal"), 7);
  const permanenciaData = toChartData(countBy(surveys, "tiempoPromedioPermanencia"));
  const problemasData = toChartData(countArrayField(surveys, "problemasActuales"), 10);
  const serviciosData = toChartData(countArrayField(surveys, "serviciosDeseados"), 10);
  const motivoData = toChartData(countArrayField(surveys, "motivoParqueo"));
  const seguridadData = toChartData(countArrayField(surveys, "medidasSeguridadDeseadas"));
  const montoData = toChartData(countBy(surveys, "montoDisposicion"));
  const conectividadData = toChartData(countBy(surveys, "tipoConectividad"));
  const horarioData = toChartData(countBy(surveys, "horarioPreferido"));

  // ── Cross-tab ────────────────────────────────────────────────
  const crossData = useMemo(() => crossTab(surveys, crossA, crossB), [surveys, crossA, crossB]);
  const rowLabels = [...new Set(crossData.map((d) => d.rowLabel))].sort();
  const colLabels = [...new Set(crossData.map((d) => d.colLabel))].sort();
  const heatMatrix = rowLabels.map((row) =>
    colLabels.map((col) => {
      const found = crossData.find((d) => d.rowLabel === row && d.colLabel === col);
      return found?.count ?? 0;
    })
  );

  // ── Client profiles ──────────────────────────────────────────
  const profiles = [
    {
      name: "El Tránsito Internacional",
      icon: "🌍",
      color: "#06d6f0",
      description: "Conductores bolivianos o peruanos que transitan regularmente por el Paso de Jama o Colchane. Transportan minerales o carga general hacia el Puerto de Iquique. Permanecen 12–48 h y su mayor preocupación es la seguridad.",
      tags: ["Bolivia/Perú", "Paso fronterizo", "Minerales", "Pernocte", "Alta inseguridad"],
      pct: 34,
      metrics: { insatisfaccion: 4, app: 4, pago: "10.000–20.000 CLP" },
    },
    {
      name: "El Operador de Cabotaje",
      icon: "🚛",
      color: "#10f0a0",
      description: "Camionero chileno que opera entre Iquique y el sur del país. Vínculo contractual con empresa. Visitas semanales, carga seca variada. Exige WiFi, duchas y área de descanso. Alta disposición a usar app.",
      tags: ["Chile", "Empleado empresa", "Carga seca", "Semanal", "Alta tech"],
      pct: 28,
      metrics: { insatisfaccion: 3, app: 5, pago: "15.000–20.000 CLP" },
    },
    {
      name: "El Independiente Local",
      icon: "🔧",
      color: "#f0a010",
      description: "Transportista independiente o dueño de camión individual. Opera rutas cortas hacia la Zona Franca de Iquique o el puerto. Sensible al precio, pero abierto a pagar si el servicio justifica el costo.",
      tags: ["Chile", "Independiente", "Zona Franca", "Diario", "Precio-sensible"],
      pct: 22,
      metrics: { insatisfaccion: 3, app: 3, pago: "5.000–10.000 CLP" },
    },
    {
      name: "El Conductor Interregional",
      icon: "📦",
      color: "#8b5cf6",
      description: "Transita entre Iquique y Antofagasta/Arica con carga reefer o combustibles. Alta experiencia (>10 años). Prioriza la seguridad del vehículo y la mercancía. Conectividad 4G y app usadas habitualmente.",
      tags: ["Chile/Argentina", "Empresa propia", "Reefer/Combustibles", "Quincenal", "Experiencia alta"],
      pct: 16,
      metrics: { insatisfaccion: 4, app: 4, pago: "20.000–30.000 CLP" },
    },
  ];

  // ── Match matrix ─────────────────────────────────────────────
  const matchRows = [
    "Seguridad 24/7",
    "Tracking GPS",
    "Reserva online",
    "Documentación digital",
    "Servicio de duchas",
    "WiFi y conectividad",
    "Control de temperatura",
    "Historial conductores",
  ];

  const matchCols = ["Camionero", "Generador Carga", "Agente Logístico", "Institucional"];

  const matchScores = [
    [5, 4, 3, 5],
    [3, 5, 5, 3],
    [4, 4, 4, 2],
    [2, 5, 5, 4],
    [5, 1, 1, 3],
    [5, 3, 3, 3],
    [3, 5, 4, 2],
    [2, 4, 5, 3],
  ];

  // Render a minimal skeleton during SSR / before hydration
  if (!mounted) {
    return (
      <div className="min-h-screen bg-grid flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-400 to-emerald-400 flex items-center justify-center text-2xl animate-pulse-slow">
            🚛
          </div>
          <p className="text-sm text-[var(--color-brand-muted-text)] animate-pulse-slow">Cargando dashboard logístico...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-grid">
      {/* ── Header ── */}
      <header className="border-b border-[var(--color-brand-border)] bg-[var(--color-brand-surface)]/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-br from-cyan-400 to-emerald-400 flex items-center justify-center text-base sm:text-lg shadow-lg shadow-cyan-500/30 shrink-0">
              🚛
            </div>
            <div className="min-w-0">
              <h1 className="text-sm sm:text-base font-bold gradient-text-cyan leading-tight truncate">Dashboard Logístico</h1>
              <p className="text-[9px] sm:text-[10px] text-[var(--color-brand-muted-text)] hidden xs:block sm:block">Alto Hospicio, Tarapacá · Análisis de Instrumentos</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="animate-pulse-slow w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-emerald-400" />
            <span className="text-[10px] sm:text-xs text-[var(--color-brand-muted-text)] whitespace-nowrap">
              <span className="hidden sm:inline">Datos simulados · </span>
              <span className="font-medium text-[var(--color-brand-text)]">{surveys.length}</span>
              <span className="hidden sm:inline"> registros</span>
              <span className="sm:hidden"> enc.</span>
            </span>
          </div>
        </div>
      </header>

      {/* ── Tab nav ── */}
      <nav className="border-b border-[var(--color-brand-border)] bg-[var(--color-brand-surface)]/50 sticky top-[57px] sm:top-[65px] z-40 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-1 sm:px-6 flex overflow-x-auto scrollbar-none">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                id={`tab-${tab.id}`}
                onClick={() => handleTabChange(tab.id)}
                className={`relative flex items-center justify-center gap-1.5 px-3 sm:px-4 py-3 text-xs font-medium whitespace-nowrap transition-colors duration-200 flex-1 sm:flex-none ${
                  isActive
                    ? "text-[var(--color-brand-cyan)]"
                    : "text-[var(--color-brand-muted-text)] hover:text-[var(--color-brand-text)]"
                }`}
              >
                <span
                  style={{
                    display: "inline-block",
                    transition: "transform 0.2s ease",
                    transform: isActive ? "scale(1.2)" : "scale(1)",
                    fontSize: "16px",
                  }}
                >
                  {tab.icon}
                </span>
                {/* Label: hidden on xs, shown from sm */}
                <span className="hidden sm:inline">{tab.label}</span>
                {/* Underline */}
                <span
                  className="absolute bottom-0 left-0 h-[2px] rounded-t-sm"
                  style={{
                    width: "100%",
                    background: "var(--color-brand-cyan)",
                    transform: isActive ? "scaleX(1)" : "scaleX(0)",
                    transformOrigin: "center",
                    transition: "transform 0.28s cubic-bezier(0.22, 1, 0.36, 1)",
                  }}
                />
              </button>
            );
          })}
        </div>
      </nav>

      {/* ── Content ── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">

        {/* ─── TAB: OVERVIEW ─── */}
        {activeTab === "overview" && (
          <div key={tabKey} className="space-y-8 animate-tab-enter">
            <div>
              <h2 className="text-2xl font-bold gradient-text-cyan mb-1">Vista General</h2>
              <p className="text-[var(--color-brand-muted-text)] text-sm">
                Resumen ejecutivo del estudio logístico. Datos simulados basados en los instrumentos validados.
              </p>
            </div>

            {/* Stats grid — staggered entry + counter animation */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <StatCard label="Encuestas" value={totalSurveys} sub="Conductores encuestados" color="#06d6f0" icon="📋" delay={0} />
              <StatCard label="Entrevistas" value={interviews.length} sub="Actores del ecosistema" color="#10f0a0" icon="🎙️" delay={80} />
              <StatCard label="Con Smartphone" value={`${pctSmartphone}%`} sub="Dispuestos a usar app" color="#8b5cf6" icon="📱" delay={160} />
              <StatCard label="Han sufrido robo" value={`${pctRobo}%`} sub="Inseguridad crítica" color="#f05060" icon="⚠️" delay={240} />
              <StatCard label="Pagarían" value={`${pctPago}%`} sub="Por servicios de parqueo" color="#f0a010" icon="💰" delay={320} />
              <StatCard label="Insatisfacción" value={`${avgInsatisfaccion}/5`} sub="Nivel promedio" color="#f05060" icon="😤" delay={400} />
            </div>

            {/* 2-col row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="glass-card p-6">
                <DonutChart
                  title="Distribución por país de origen"
                  data={paisData.slice(0, 6).map((d, i) => ({ label: d.label, value: d.value, color: COLORS[i] }))}
                />
              </div>
              <div className="glass-card p-6">
                <BarChart title="Problemas más frecuentes" data={problemasData.slice(0, 7)} color="#f05060" />
              </div>
            </div>

            {/* Info callouts */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="glass-card p-5 border-l-4 border-[var(--color-brand-cyan)]">
                <p className="text-xs font-bold text-[var(--color-brand-cyan)] uppercase tracking-wider mb-2">🚛 Instrumento 1</p>
                <p className="text-sm font-semibold text-[var(--color-brand-text)] mb-1">Encuesta de Usuarios de Parqueo</p>
                <p className="text-xs text-[var(--color-brand-muted-text)]">34 preguntas en 8 bloques temáticos. Dirigida a conductores que utilizan zonas de parqueo en Alto Hospicio.</p>
              </div>
              <div className="glass-card p-5 border-l-4 border-[var(--color-brand-emerald)]">
                <p className="text-xs font-bold text-[var(--color-brand-emerald)] uppercase tracking-wider mb-2">💼 Instrumento 2</p>
                <p className="text-sm font-semibold text-[var(--color-brand-text)] mb-1">Entrevistas Semiestructuradas</p>
                <p className="text-xs text-[var(--color-brand-muted-text)]">Aplicada a generadores de carga, agentes logísticos, operadores de transporte y actores institucionales.</p>
              </div>
              <div className="glass-card p-5 border-l-4 border-[var(--color-brand-amber)]">
                <p className="text-xs font-bold text-[var(--color-brand-amber)] uppercase tracking-wider mb-2">🎯 Objetivo</p>
                <p className="text-sm font-semibold text-[var(--color-brand-text)] mb-1">Caracterización de clientes</p>
                <p className="text-xs text-[var(--color-brand-muted-text)]">Identificar perfiles de usuario, relaciones entre variables y el match entre ambas plataformas.</p>
              </div>
            </div>
          </div>
        )}

        {/* ─── TAB: DESCRIPTIVO ─── */}
        {activeTab === "descriptivo" && (
          <div key={tabKey} className="space-y-8 animate-tab-enter">
            <div>
              <h2 className="text-2xl font-bold gradient-text-cyan mb-1">Análisis Descriptivo</h2>
              <p className="text-[var(--color-brand-muted-text)] text-sm">Resultados por pregunta agrupados en bloques temáticos.</p>
            </div>

            {/* Block 2: Profile */}
            <section>
              <h3 className="text-sm font-bold text-[var(--color-brand-text)] uppercase tracking-widest mb-4 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-cyan-500/20 text-[var(--color-brand-cyan)] flex items-center justify-center text-xs font-bold">2</span>
                Perfil del Conductor
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                <div className="glass-card p-5">
                  <BarChart title="País de Origen" data={paisData} color="#06d6f0" />
                </div>
                <div className="glass-card p-5">
                  <BarChart title="Tipo de Contrato" data={contratoData} color="#8b5cf6" />
                </div>
                <div className="glass-card p-5">
                  <p className="text-xs font-semibold text-[var(--color-brand-muted-text)] uppercase tracking-widest mb-3">Sexo del conductor</p>
                  <DonutChart
                    data={[
                      { label: "Masculino", value: surveys.filter((s) => s.sexo === "Masculino").length, color: "#06d6f0" },
                      { label: "Femenino", value: surveys.filter((s) => s.sexo === "Femenino").length, color: "#f05060" },
                    ]}
                    size={140}
                  />
                </div>
              </div>
            </section>

            {/* Block 3: Routes */}
            <section>
              <h3 className="text-sm font-bold text-[var(--color-brand-text)] uppercase tracking-widest mb-4 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-[var(--color-brand-emerald)] flex items-center justify-center text-xs font-bold">3</span>
                Rutas y Operación
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="glass-card p-5">
                  <BarChart title="Ruta Principal" data={rutaData} color="#10f0a0" />
                </div>
                <div className="glass-card p-5">
                  <BarChart title="Frecuencia de Visita" data={frecuenciaData} color="#10f0a0" />
                </div>
              </div>
            </section>

            {/* Block 4: Parking */}
            <section>
              <h3 className="text-sm font-bold text-[var(--color-brand-text)] uppercase tracking-widest mb-4 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-amber-500/20 text-[var(--color-brand-amber)] flex items-center justify-center text-xs font-bold">4</span>
                Necesidades de Parqueo
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                <div className="glass-card p-5">
                  <BarChart title="Motivo de Parqueo" data={motivoData} color="#f0a010" />
                </div>
                <div className="glass-card p-5">
                  <BarChart title="Tiempo de Permanencia" data={permanenciaData} color="#f0a010" />
                </div>
                <div className="glass-card p-5">
                  <BarChart title="Horario Preferido" data={horarioData} color="#f0a010" />
                </div>
              </div>
            </section>

            {/* Block 5 & 6 */}
            <section>
              <h3 className="text-sm font-bold text-[var(--color-brand-text)] uppercase tracking-widest mb-4 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-rose-500/20 text-[var(--color-brand-rose)] flex items-center justify-center text-xs font-bold">5</span>
                Deficiencias y Servicios Deseados
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="glass-card p-5">
                  <BarChart title="Problemas Actuales" data={problemasData} color="#f05060" />
                </div>
                <div className="glass-card p-5">
                  <BarChart title="Servicios Deseados" data={serviciosData} color="#8b5cf6" />
                </div>
              </div>
            </section>

            {/* Block 7 & 8 */}
            <section>
              <h3 className="text-sm font-bold text-[var(--color-brand-text)] uppercase tracking-widest mb-4 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-violet-500/20 text-[var(--color-brand-violet)] flex items-center justify-center text-xs font-bold">7</span>
                Digitalización y Seguridad
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                <div className="glass-card p-5">
                  <BarChart title="Tipo de Conectividad" data={conectividadData} color="#8b5cf6" />
                </div>
                <div className="glass-card p-5">
                  <BarChart title="Monto Dispuesto a Pagar" data={montoData} color="#f0a010" />
                </div>
                <div className="glass-card p-5">
                  <BarChart title="Medidas de Seguridad Deseadas" data={seguridadData} color="#f05060" />
                </div>
              </div>
            </section>
          </div>
        )}

        {/* ─── TAB: RELACIONES ─── */}
        {activeTab === "relaciones" && (
          <div key={tabKey} className="space-y-8 animate-tab-enter">
            <div>
              <h2 className="text-2xl font-bold gradient-text-cyan mb-1">Relaciones & Cruces de Variables</h2>
              <p className="text-[var(--color-brand-muted-text)] text-sm">Selecciona dos variables para explorar su relación. La intensidad del color indica mayor frecuencia.</p>
            </div>

            {/* Selectors */}
            <div className="glass-card p-4 sm:p-6">
              <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_1fr] gap-3 sm:gap-4 items-end">
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-semibold text-[var(--color-brand-muted-text)] uppercase tracking-widest">Variable A (Filas)</label>
                  <select
                    id="crossA"
                    value={crossA}
                    onChange={(e) => setCrossA(e.target.value as keyof SurveyRecord)}
                    className="w-full bg-[var(--color-brand-muted)] border border-[var(--color-brand-border)] text-[var(--color-brand-text)] text-xs rounded-lg px-3 py-2.5 focus:outline-none focus:border-[var(--color-brand-cyan)]"
                  >
                    {CROSS_OPTIONS.filter((o) => o.key !== crossB).map((o) => (
                      <option key={o.key} value={o.key}>{o.label}</option>
                    ))}
                  </select>
                </div>
                <div className="text-[var(--color-brand-muted-text)] font-bold text-xl text-center py-1">×</div>
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-semibold text-[var(--color-brand-muted-text)] uppercase tracking-widest">Variable B (Columnas)</label>
                  <select
                    id="crossB"
                    value={crossB}
                    onChange={(e) => setCrossB(e.target.value as keyof SurveyRecord)}
                    className="w-full bg-[var(--color-brand-muted)] border border-[var(--color-brand-border)] text-[var(--color-brand-text)] text-xs rounded-lg px-3 py-2.5 focus:outline-none focus:border-[var(--color-brand-cyan)]"
                  >
                    {CROSS_OPTIONS.filter((o) => o.key !== crossA).map((o) => (
                      <option key={o.key} value={o.key}>{o.label}</option>
                    ))}
                  </select>
                </div>
              </div>
              <p className="mt-3 text-[10px] text-[var(--color-brand-muted-text)] text-right">
                {crossData.length} combinaciones · {rowLabels.length} × {colLabels.length}
              </p>
            </div>

            {/* Heatmap */}
            <div className="glass-card p-6">
              <p className="text-xs font-semibold text-[var(--color-brand-muted-text)] uppercase tracking-widest mb-4">
                {CROSS_OPTIONS.find((o) => o.key === crossA)?.label} × {CROSS_OPTIONS.find((o) => o.key === crossB)?.label}
              </p>
              <Heatmap rows={rowLabels} cols={colLabels} data={heatMatrix} />
            </div>

            {/* Pre-built insights */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="glass-card p-6">
                <p className="text-xs font-bold text-[var(--color-brand-cyan)] uppercase tracking-widest mb-3">📌 Relación: País × Disposición de Pago</p>
                <Heatmap
                  rows={["Bolivia", "Chile", "Perú"]}
                  cols={["No", "Sí"]}
                  data={[
                    [surveys.filter((s) => s.paisOrigen === "Bolivia" && s.disposicionPago === "No").length,
                     surveys.filter((s) => s.paisOrigen === "Bolivia" && s.disposicionPago === "Sí").length],
                    [surveys.filter((s) => s.paisOrigen === "Chile" && s.disposicionPago === "No").length,
                     surveys.filter((s) => s.paisOrigen === "Chile" && s.disposicionPago === "Sí").length],
                    [surveys.filter((s) => s.paisOrigen === "Perú" && s.disposicionPago === "No").length,
                     surveys.filter((s) => s.paisOrigen === "Perú" && s.disposicionPago === "Sí").length],
                  ]}
                />
              </div>
              <div className="glass-card p-6">
                <p className="text-xs font-bold text-[var(--color-brand-emerald)] uppercase tracking-widest mb-3">📌 Relación: Contrato × App Logística</p>
                <Heatmap
                  rows={["Empleado empresa", "Trabajador independiente", "Empresa propia"]}
                  cols={["No", "Sí"]}
                  data={[
                    [surveys.filter((s) => s.tipoContrato === "Empleado empresa" && s.usaAppsLogistica === "No").length,
                     surveys.filter((s) => s.tipoContrato === "Empleado empresa" && s.usaAppsLogistica === "Sí").length],
                    [surveys.filter((s) => s.tipoContrato === "Trabajador independiente" && s.usaAppsLogistica === "No").length,
                     surveys.filter((s) => s.tipoContrato === "Trabajador independiente" && s.usaAppsLogistica === "Sí").length],
                    [surveys.filter((s) => s.tipoContrato === "Empresa propia" && s.usaAppsLogistica === "No").length,
                     surveys.filter((s) => s.tipoContrato === "Empresa propia" && s.usaAppsLogistica === "Sí").length],
                  ]}
                  colorHigh="#10f0a0"
                />
              </div>
            </div>
          </div>
        )}

        {/* ─── TAB: PERFILES ─── */}
        {activeTab === "perfiles" && (
          <div key={tabKey} className="space-y-8 animate-tab-enter">
            <div>
              <h2 className="text-2xl font-bold gradient-text-cyan mb-1">Perfiles de Cliente</h2>
              <p className="text-[var(--color-brand-muted-text)] text-sm">Arquetipos identificados a partir del análisis de clúster de la encuesta de parqueo.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 stagger">
              {profiles.map((p) => (
                <div key={p.name} className="glass-card p-6 hover-lift cursor-default" style={{ borderTop: `3px solid ${p.color}` }}>
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shrink-0" style={{ background: `${p.color}20` }}>
                      {p.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-[var(--color-brand-text)] text-base leading-tight">{p.name}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="h-1.5 rounded-full bg-[var(--color-brand-muted)] flex-1">
                          <div className="h-full rounded-full bar-fill" style={{ width: `${p.pct}%`, background: p.color }} />
                        </div>
                        <span className="text-xs font-bold" style={{ color: p.color }}>{p.pct}%</span>
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-[var(--color-brand-muted-text)] leading-relaxed mb-4">{p.description}</p>
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {p.tags.map((tag) => (
                      <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full font-medium" style={{ background: `${p.color}20`, color: p.color }}>
                        {tag}
                      </span>
                    ))}
                  </div>
                  <div className="border-t border-[var(--color-brand-border)] pt-4 grid grid-cols-3 gap-3">
                    <div>
                      <p className="text-[9px] text-[var(--color-brand-muted-text)] uppercase tracking-widest mb-1">Insatisfacción</p>
                      <RatingBar value={p.metrics.insatisfaccion} color={p.color} />
                    </div>
                    <div>
                      <p className="text-[9px] text-[var(--color-brand-muted-text)] uppercase tracking-widest mb-1">Apertura App</p>
                      <RatingBar value={p.metrics.app} color={p.color} />
                    </div>
                    <div>
                      <p className="text-[9px] text-[var(--color-brand-muted-text)] uppercase tracking-widest mb-1">Rango de Pago</p>
                      <p className="text-[10px] font-bold" style={{ color: p.color }}>{p.metrics.pago}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Interview personas */}
            <div>
              <h3 className="text-lg font-bold text-[var(--color-brand-text)] mb-4">Actores de la Plataforma Logística</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { tipo: "Generador de Carga", icon: "🏭", color: "#06d6f0", desc: "Grandes empresas mineras y comerciales que contratan transporte. Priorizan trazabilidad, documentación digital y control de flota.", count: interviews.filter((i) => i.tipo === "Generador de Carga").length },
                  { tipo: "Agente Logístico", icon: "🔗", color: "#10f0a0", desc: "Intermediarios que coordinan entre generadores y transportistas. Gestionan documentación aduanera y licitaciones.", count: interviews.filter((i) => i.tipo === "Agente Logístico").length },
                  { tipo: "Operador de Transporte", icon: "🚚", color: "#f0a010", desc: "Empresas de transporte que gestionan flotas. Necesitan gestión de conductores, rutas y parqueos seguros.", count: interviews.filter((i) => i.tipo === "Operador de Transporte").length },
                  { tipo: "Actor Institucional", icon: "🏛️", color: "#8b5cf6", desc: "Municipalidades, Seremi y puertos. Rol normativo y de habilitación de infraestructura.", count: interviews.filter((i) => i.tipo === "Actor Institucional").length },
                ].map((actor) => (
                  <div key={actor.tipo} className="glass-card p-5" style={{ borderLeft: `3px solid ${actor.color}` }}>
                    <div className="text-2xl mb-3">{actor.icon}</div>
                    <p className="text-sm font-bold text-[var(--color-brand-text)] mb-2">{actor.tipo}</p>
                    <p className="text-[10px] text-[var(--color-brand-muted-text)] leading-relaxed mb-3">{actor.desc}</p>
                    <p className="text-xs font-bold" style={{ color: actor.color }}>{actor.count} entrevistas</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ─── TAB: MATCH ─── */}
        {activeTab === "match" && (
          <div key={tabKey} className="space-y-8 animate-tab-enter">
            <div>
              <h2 className="text-2xl font-bold gradient-text-cyan mb-1">Match de Instrumentos</h2>
              <p className="text-[var(--color-brand-muted-text)] text-sm">
                Alineación entre las necesidades detectadas en la encuesta de parqueo y los requerimientos de la plataforma logística.
                Mayor color = mayor convergencia.
              </p>
            </div>

            {/* Match heatmap */}
            <div className="glass-card p-6">
              <p className="text-xs font-semibold text-[var(--color-brand-muted-text)] uppercase tracking-widest mb-6">
                Dimensión de Demanda × Actor del Ecosistema (escala 1–5)
              </p>
              <Heatmap rows={matchRows} cols={matchCols} data={matchScores} colorHigh="#10f0a0" />
            </div>

            {/* Convergence & Gaps */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="glass-card p-6">
                <h3 className="text-sm font-bold text-[var(--color-brand-emerald)] uppercase tracking-widest mb-4">✅ Zonas de Alta Convergencia</h3>
                <ul className="space-y-3">
                  {[
                    { item: "Seguridad 24/7", desc: "Crítica tanto para camioneros como para instituciones y generadores de carga." },
                    { item: "Tracking GPS en tiempo real", desc: "Demandado con alta intensidad por generadores y agentes logísticos." },
                    { item: "Reserva online", desc: "Bien valorada en todos los actores. Reduce fricciones operacionales." },
                    { item: "Documentación digital", desc: "Alta prioridad para agentes y generadores; es el cuello de botella actual." },
                  ].map((c) => (
                    <li key={c.item} className="flex gap-3 items-start">
                      <span className="w-2 h-2 mt-1 rounded-full bg-emerald-400 shrink-0" />
                      <div>
                        <p className="text-xs font-semibold text-[var(--color-brand-text)]">{c.item}</p>
                        <p className="text-[10px] text-[var(--color-brand-muted-text)]">{c.desc}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="glass-card p-6">
                <h3 className="text-sm font-bold text-[var(--color-brand-rose)] uppercase tracking-widest mb-4">⚡ Brechas Identificadas</h3>
                <ul className="space-y-3">
                  {[
                    { item: "Servicios higiénicos y duchas", desc: "Alta prioridad para camioneros, irrelevante para generadores de carga." },
                    { item: "Control de temperatura (reefer)", desc: "Crítico para generadores, pero no es prioridad para el conductor promedio." },
                    { item: "Historial de conductores", desc: "Muy demandado por agentes y generadores; los conductores lo perciben como control." },
                    { item: "WiFi y conectividad", desc: "Alta demanda del conductor de campo vs. menor urgencia para actores institucionales." },
                  ].map((c) => (
                    <li key={c.item} className="flex gap-3 items-start">
                      <span className="w-2 h-2 mt-1 rounded-full bg-rose-400 shrink-0" />
                      <div>
                        <p className="text-xs font-semibold text-[var(--color-brand-text)]">{c.item}</p>
                        <p className="text-[10px] text-[var(--color-brand-muted-text)]">{c.desc}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Interview summary */}
            <div className="glass-card p-6">
              <h3 className="text-sm font-bold text-[var(--color-brand-text)] uppercase tracking-widest mb-4">📋 Resumen de Entrevistas por Tipo de Actor</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-[var(--color-brand-border)]">
                      {["Empresa", "Tipo", "Conoce Plataformas", "Usa Plataformas", "Disposición (1–5)", "Problema Principal"].map((h) => (
                        <th key={h} className="text-left py-2 px-3 text-[var(--color-brand-muted-text)] font-medium whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {interviews.slice(0, 12).map((iv) => (
                      <tr key={iv.id} className="border-b border-[var(--color-brand-border)]/30 hover:bg-[var(--color-brand-muted)]/20 transition-colors">
                        <td className="py-2 px-3 font-medium text-[var(--color-brand-text)] max-w-48 truncate" title={iv.empresa}>{iv.empresa}</td>
                        <td className="py-2 px-3">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-medium"
                            style={{
                              background: iv.tipo === "Generador de Carga" ? "#06d6f020" : iv.tipo === "Agente Logístico" ? "#10f0a020" : iv.tipo === "Operador de Transporte" ? "#f0a01020" : "#8b5cf620",
                              color: iv.tipo === "Generador de Carga" ? "#06d6f0" : iv.tipo === "Agente Logístico" ? "#10f0a0" : iv.tipo === "Operador de Transporte" ? "#f0a010" : "#8b5cf6",
                            }}>
                            {iv.tipo}
                          </span>
                        </td>
                        <td className="py-2 px-3">{iv.conocePlataformasLogisticas ? "✅" : "❌"}</td>
                        <td className="py-2 px-3">{iv.usaPlataformasActualmente ? "✅" : "❌"}</td>
                        <td className="py-2 px-3">
                          <RatingBar value={iv.disposicionUsarPlataforma} color="#10f0a0" />
                        </td>
                        <td className="py-2 px-3 text-[var(--color-brand-muted-text)] max-w-48 truncate" title={iv.principalesProblemaCadena[0]}>{iv.principalesProblemaCadena[0]}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>

      <footer className="border-t border-[var(--color-brand-border)] mt-16 py-6 text-center text-xs text-[var(--color-brand-muted-text)]">
        Dashboard Logístico · Alto Hospicio, Tarapacá · Datos simulados para visualización y análisis
      </footer>
    </div>
  );
}
