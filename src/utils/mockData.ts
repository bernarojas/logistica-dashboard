// ============================================================
// MOCK DATA GENERATOR
// Simulates realistic survey and interview data for the
// Alto Hospicio logistics study based on PDF instruments.
// ============================================================

export interface SurveyRecord {
  id: number;
  // Block 1: Identification
  fecha: string;
  numeroEncuesta: number;
  encuestador: string;
  // Block 2: Truck Driver Profile
  edadConductor: number;
  sexo: "Masculino" | "Femenino";
  paisOrigen: string;
  aniosExperiencia: number;
  tipoLicencia: "A1" | "A2" | "A3" | "A4" | "A5";
  tipoContrato: "Empleado empresa" | "Trabajador independiente" | "Empresa propia";
  // Block 3: Route & Operation
  rutaPrincipal: string;
  frecuenciaVisita: "Diaria" | "Semanal" | "Quincenal" | "Mensual" | "Ocasional";
  tipoCarga: string[];
  destinoPrincipal: string;
  horasEspera: number;
  // Block 4: Parking Needs
  motivoParqueo: string[];
  tiempoPromedioPermanencia: string;
  horarioPreferido: string;
  usaParqueoActual: "Sí" | "No";
  lugarParqueoActual: string;
  // Block 5: Deficiencies
  problemasActuales: string[];
  nivelInsatisfaccion: 1 | 2 | 3 | 4 | 5;
  // Block 6: Services Required
  serviciosDeseados: string[];
  disposicionPago: string;
  montoDisposicion: string;
  // Block 7: Digital Platform
  tieneSmartphone: "Sí" | "No";
  usaAppsLogistica: "Sí" | "No";
  appsUsadas: string[];
  disposicionAppParqueo: 1 | 2 | 3 | 4 | 5;
  tipoConectividad: string;
  // Block 8: Security
  haExperienciadoRobo: "Sí" | "No";
  nivelInseguridadPercibida: 1 | 2 | 3 | 4 | 5;
  medidasSeguridadDeseadas: string[];
}

export interface InterviewRecord {
  id: number;
  tipo: "Generador de Carga" | "Agente Logístico" | "Operador de Transporte" | "Actor Institucional";
  empresa: string;
  cargo: string;
  tamanoEmpresa: "Micro" | "Pequeña" | "Mediana" | "Grande";
  rubros: string[];
  // Logistics platform opinions
  conocePlataformasLogisticas: boolean;
  usaPlataformasActualmente: boolean;
  plataformasUsadas: string[];
  principalesProblemaCadena: string[];
  disposicionUsarPlataforma: 1 | 2 | 3 | 4 | 5;
  funcionesClave: string[];
  barrerasAdopcion: string[];
  disposicionPagoPlataforma: string;
  // Match with parking
  importanciaParqueoSeguro: 1 | 2 | 3 | 4 | 5;
  relacionadoConCamioneros: boolean;
  problemasConTransportistas: string[];
}

// ── Seed helpers ──────────────────────────────────────────────
function seededRand(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return (s >>> 0) / 0xffffffff;
  };
}

function pick<T>(arr: T[], r: () => number): T {
  return arr[Math.floor(r() * arr.length)];
}

function pickMultiple<T>(arr: T[], min: number, max: number, r: () => number): T[] {
  const count = min + Math.floor(r() * (max - min + 1));
  const shuffled = [...arr].sort(() => r() - 0.5);
  return shuffled.slice(0, count);
}

function randInt(min: number, max: number, r: () => number) {
  return Math.floor(r() * (max - min + 1)) + min;
}

// ── Survey Data ───────────────────────────────────────────────
export function generateSurveyData(count = 120): SurveyRecord[] {
  const r = seededRand(42);

  const paises = ["Chile", "Bolivia", "Perú", "Argentina", "Paraguay", "Brasil"];
  const paisWeights = [0.35, 0.28, 0.18, 0.08, 0.07, 0.04];

  const rutas = [
    "Alto Hospicio – Puerto Iquique",
    "Paso de Jama – Iquique",
    "Paso Sico – Antofagasta",
    "Colchane – Iquique",
    "Iquique – Arica",
    "Iquique – Antofagasta",
    "Iquique – Santiago",
  ];

  const tiposCarga = [
    "Carga general seca",
    "Carga refrigerada",
    "Minerales",
    "Combustibles",
    "Maquinaria pesada",
    "Productos agrícolas",
    "Mercancías peligrosas",
    "Contenedores",
  ];

  const motivosParqueo = [
    "Descanso obligatorio del conductor",
    "Espera de aduana",
    "Espera de carga/descarga",
    "Pernocte entre jornadas",
    "Revisión mecánica",
    "Abastecimiento de combustible",
  ];

  const problemas = [
    "Inseguridad / robos",
    "Falta de servicios higiénicos",
    "Sin agua potable",
    "Sin duchas",
    "Sin área de descanso",
    "Sin iluminación nocturna",
    "Sin vigilancia",
    "Sin servicios de alimentación",
    "Sin WiFi",
    "Señalización deficiente",
  ];

  const servicios = [
    "Seguridad 24/7",
    "Duchas y servicios higiénicos",
    "Área de descanso techada",
    "Alimentación / restorán",
    "WiFi gratuito",
    "Abastecimiento de combustible",
    "Mantención mecánica",
    "Pesaje de camiones",
    "Reserva online",
    "Estacionamiento techado",
  ];

  const medidas = [
    "Cámaras de vigilancia",
    "Guardia de seguridad",
    "Cerco perimetral",
    "Control de acceso",
    "Iluminación LED",
    "Sistema de alarma",
  ];

  const apps = ["Waze", "Google Maps", "WhatsApp", "Truckmap", "Ninguna específica"];

  const montos = ["5.000–10.000 CLP", "10.000–15.000 CLP", "15.000–20.000 CLP", "20.000–30.000 CLP", ">30.000 CLP"];

  const pickWeighted = (items: string[], weights: number[]): string => {
    const cumulative: number[] = [];
    let sum = 0;
    for (const w of weights) { sum += w; cumulative.push(sum); }
    const val = r() * sum;
    for (let i = 0; i < cumulative.length; i++) {
      if (val <= cumulative[i]) return items[i];
    }
    return items[items.length - 1];
  };

  const records: SurveyRecord[] = [];
  const encuestadores = ["Ana Morales", "Luis Carreño", "Sofía Tapia"];
  const fechaBase = new Date("2025-03-01");

  for (let i = 0; i < count; i++) {
    const daysOffset = randInt(0, 90, r);
    const fecha = new Date(fechaBase.getTime() + daysOffset * 86400000);
    const usaApp = r() > 0.4;

    records.push({
      id: i + 1,
      fecha: fecha.toISOString().slice(0, 10),
      numeroEncuesta: i + 1,
      encuestador: pick(encuestadores, r),
      edadConductor: randInt(22, 62, r),
      sexo: r() > 0.08 ? "Masculino" : "Femenino",
      paisOrigen: pickWeighted(paises, paisWeights),
      aniosExperiencia: randInt(1, 35, r),
      tipoLicencia: pick(["A3", "A4", "A5", "A4", "A5", "A5"], r),
      tipoContrato: pick(["Empleado empresa", "Trabajador independiente", "Empresa propia", "Empleado empresa", "Trabajador independiente"], r),
      rutaPrincipal: pick(rutas, r),
      frecuenciaVisita: pick(["Diaria", "Semanal", "Semanal", "Quincenal", "Mensual", "Ocasional"], r),
      tipoCarga: pickMultiple(tiposCarga, 1, 3, r),
      destinoPrincipal: pick(["Puerto Iquique", "Zona Franca Iquique", "Antofagasta", "Arica", "Santiago", "Exportación Bolivia"], r),
      horasEspera: randInt(1, 72, r),
      motivoParqueo: pickMultiple(motivosParqueo, 1, 3, r),
      tiempoPromedioPermanencia: pick(["< 4 horas", "4–8 horas", "8–12 horas", "12–24 horas", "> 24 horas"], r),
      horarioPreferido: pick(["Diurno (06–18h)", "Nocturno (18–06h)", "Indistinto"], r),
      usaParqueoActual: r() > 0.3 ? "Sí" : "No",
      lugarParqueoActual: pick(["Berma de carretera", "Estacionamiento informal", "Playa puerto", "Patio empresa", "Sin lugar fijo"], r),
      problemasActuales: pickMultiple(problemas, 2, 5, r),
      nivelInsatisfaccion: pick([1, 2, 3, 3, 4, 4, 5, 5, 5], r) as 1|2|3|4|5,
      serviciosDeseados: pickMultiple(servicios, 3, 6, r),
      disposicionPago: r() > 0.2 ? "Sí" : "No",
      montoDisposicion: pick(montos, r),
      tieneSmartphone: r() > 0.05 ? "Sí" : "No",
      usaAppsLogistica: usaApp ? "Sí" : "No",
      appsUsadas: usaApp ? pickMultiple(apps.slice(0, 4), 1, 2, r) : [],
      disposicionAppParqueo: pick([2, 3, 3, 4, 4, 5, 5, 5], r) as 1|2|3|4|5,
      tipoConectividad: pick(["4G LTE", "3G", "WiFi zona", "Sin conexión frecuente"], r),
      haExperienciadoRobo: r() > 0.55 ? "Sí" : "No",
      nivelInseguridadPercibida: pick([2, 3, 3, 4, 4, 5, 5], r) as 1|2|3|4|5,
      medidasSeguridadDeseadas: pickMultiple(medidas, 2, 4, r),
    });
  }
  return records;
}

// ── Interview Data ────────────────────────────────────────────
export function generateInterviewData(count = 20): InterviewRecord[] {
  const r = seededRand(99);

  const empresasGeneradores = [
    "Compañía Minera Doña Inés de Collahuasi",
    "Teck Chile Ltda.",
    "Zofri S.A.",
    "Agroexport Tarapacá",
    "Retail Norte S.A.",
    "Cementos Bío Bío Norte",
    "Pesquera Coloso",
  ];

  const empresasAgentes = [
    "Kuehne+Nagel Chile",
    "DHL Supply Chain",
    "Agencia Marítima Ultramar",
    "Geodis Chile",
    "Aduanas & Logística Norte Ltda.",
    "Cargo Norte S.A.",
  ];

  const empresasOperadores = [
    "Transportes TIL S.A.",
    "Carga Express Ltda.",
    "Camiones del Norte",
    "Flota Altiplano",
    "Trans-Andes Ltda.",
  ];

  const empresasInstitucionales = [
    "Municipalidad de Alto Hospicio",
    "Seremi de Transportes Tarapacá",
    "Puerto Iquique S.A.",
    "Cámara de Comercio Iquique",
  ];

  const problemasCadena = [
    "Falta de trazabilidad en tiempo real",
    "Coordinación deficiente entre actores",
    "Demoras en pasos fronterizos",
    "Escasez de conductores calificados",
    "Altos costos operacionales",
    "Infraestructura insuficiente",
    "Informalidad del sector",
    "Falta de digitalización",
  ];

  const funciones = [
    "Reserva de espacios de parqueo",
    "Tracking GPS en tiempo real",
    "Gestión de documentos aduaneros",
    "Matching carga-transporte",
    "Control de temperatura (reefer)",
    "Facturación electrónica integrada",
    "Alertas de seguridad",
    "Historial de conductores",
    "Portal de licitaciones",
  ];

  const barreras = [
    "Desconfianza tecnológica",
    "Costo de implementación",
    "Falta de capacitación",
    "Conectividad limitada en ruta",
    "Resistencia al cambio",
    "Preocupaciones de privacidad de datos",
  ];

  const plataformas = ["TMS SAP", "Oracle TMS", "Excel/Manual", "WhatsApp grupos", "Sistema propio", "Ninguno"];

  const tipos: InterviewRecord["tipo"][] = [
    "Generador de Carga", "Generador de Carga", "Generador de Carga",
    "Agente Logístico", "Agente Logístico",
    "Operador de Transporte", "Operador de Transporte", "Operador de Transporte",
    "Actor Institucional",
  ];

  const records: InterviewRecord[] = [];

  for (let i = 0; i < count; i++) {
    const tipo = tipos[i % tipos.length];
    let empresa = "";
    let cargo = "";

    if (tipo === "Generador de Carga") {
      empresa = pick(empresasGeneradores, r);
      cargo = pick(["Gerente Logística", "Jefe Operaciones", "Coordinador Supply Chain", "Sub-Gerente Comercial"], r);
    } else if (tipo === "Agente Logístico") {
      empresa = pick(empresasAgentes, r);
      cargo = pick(["Ejecutivo de Cuentas", "Gerente de Operaciones", "Jefe de Aduanas"], r);
    } else if (tipo === "Operador de Transporte") {
      empresa = pick(empresasOperadores, r);
      cargo = pick(["Dueño/Gerente", "Jefe de Flota", "Coordinador de Rutas"], r);
    } else {
      empresa = pick(empresasInstitucionales, r);
      cargo = pick(["Director", "Jefe de División", "Coordinador Regional"], r);
    }

    const usaPlataforma = r() > 0.45;

    records.push({
      id: i + 1,
      tipo,
      empresa,
      cargo,
      tamanoEmpresa: pick(["Pequeña", "Mediana", "Grande", "Grande", "Grande"], r),
      rubros: pickMultiple(["Minería", "Comercio", "Pesca", "Retail", "Logística", "Transporte", "Institución pública"], 1, 2, r),
      conocePlataformasLogisticas: r() > 0.15,
      usaPlataformasActualmente: usaPlataforma,
      plataformasUsadas: usaPlataforma ? pickMultiple(plataformas, 1, 2, r) : [],
      principalesProblemaCadena: pickMultiple(problemasCadena, 2, 4, r),
      disposicionUsarPlataforma: pick([2, 3, 3, 4, 4, 4, 5, 5], r) as 1|2|3|4|5,
      funcionesClave: pickMultiple(funciones, 3, 5, r),
      barrerasAdopcion: pickMultiple(barreras, 1, 3, r),
      disposicionPagoPlataforma: pick(["No pagaría", "USD 50–100/mes", "USD 100–300/mes", "USD 300–500/mes", "> USD 500/mes"], r),
      importanciaParqueoSeguro: pick([3, 3, 4, 4, 4, 5, 5], r) as 1|2|3|4|5,
      relacionadoConCamioneros: r() > 0.3,
      problemasConTransportistas: pickMultiple([
        "Impuntualidad",
        "Falta de comunicación",
        "Documentación incompleta",
        "Condición de la mercancía",
        "Conductas de riesgo",
        "Sin rastreo GPS",
      ], 1, 3, r),
    });
  }
  return records;
}

// ── Statistics helpers ────────────────────────────────────────
export function countBy<T>(data: T[], key: keyof T): Record<string, number> {
  const result: Record<string, number> = {};
  for (const item of data) {
    const val = String(item[key]);
    result[val] = (result[val] || 0) + 1;
  }
  return result;
}

export function countArrayField<T>(data: T[], key: keyof T): Record<string, number> {
  const result: Record<string, number> = {};
  for (const item of data) {
    const vals = item[key] as unknown as string[];
    if (Array.isArray(vals)) {
      for (const v of vals) {
        result[v] = (result[v] || 0) + 1;
      }
    }
  }
  return result;
}

export function toChartData(counts: Record<string, number>, maxItems = 10) {
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, maxItems)
    .map(([label, value]) => ({ label, value }));
}

export function crossTab(
  data: SurveyRecord[],
  keyA: keyof SurveyRecord,
  keyB: keyof SurveyRecord
): { rowLabel: string; colLabel: string; count: number }[] {
  const result: Record<string, Record<string, number>> = {};
  for (const item of data) {
    const a = String(item[keyA]);
    const b = String(item[keyB]);
    if (!result[a]) result[a] = {};
    result[a][b] = (result[a][b] || 0) + 1;
  }
  const out: { rowLabel: string; colLabel: string; count: number }[] = [];
  for (const [row, cols] of Object.entries(result)) {
    for (const [col, count] of Object.entries(cols)) {
      out.push({ rowLabel: row, colLabel: col, count });
    }
  }
  return out;
}
