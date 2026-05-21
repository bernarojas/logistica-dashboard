"use client";

import React, { useEffect, useRef, useState } from "react";

// ── Animated Bar Chart ────────────────────────────────────────
interface BarChartProps {
  data: { label: string; value: number }[];
  color?: string;
  title?: string;
}

export function BarChart({ data, color = "#06d6f0", title }: BarChartProps) {
  const max = Math.max(...data.map((d) => d.value), 1);
  const [triggered, setTriggered] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Small delay so bars animate after the tab slide-in completes
    const t = setTimeout(() => setTriggered(true), 80);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="w-full" ref={ref}>
      {title && (
        <p className="text-xs font-semibold text-[var(--color-brand-muted-text)] uppercase tracking-widest mb-3">
          {title}
        </p>
      )}
      <div className="space-y-2.5">
        {data.map((d, i) => {
          const pct = (d.value / max) * 100;
          return (
            <div key={i} className="flex items-center gap-2 sm:gap-3">
              <span
                className="text-[10px] sm:text-xs text-[var(--color-brand-muted-text)] w-24 sm:w-36 shrink-0 truncate"
                title={d.label}
              >
                {d.label}
              </span>
              <div className="flex-1 h-5 sm:h-6 bg-[var(--color-brand-muted)] rounded-full overflow-hidden relative">
                <div
                  className="h-full rounded-full flex items-center justify-end pr-2 transition-[width] duration-700 ease-out"
                  style={{
                    width: triggered ? `${pct}%` : "0%",
                    transitionDelay: `${i * 60}ms`,
                    background: `linear-gradient(90deg, ${color}88, ${color})`,
                  }}
                >
                  <span className="text-[9px] sm:text-[10px] font-bold text-white/80 whitespace-nowrap">{d.value}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Animated Donut Chart ──────────────────────────────────────
interface DonutChartProps {
  data: { label: string; value: number; color: string }[];
  title?: string;
  size?: number;
}

export function DonutChart({ data, title, size = 160 }: DonutChartProps) {
  const [triggered, setTriggered] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setTriggered(true), 120);
    return () => clearTimeout(t);
  }, []);

  const total = data.reduce((s, d) => s + d.value, 0);
  let cumulative = 0;

  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const cx = size / 2;
  const cy = size / 2;
  const outerR = size / 2 - 4;
  const innerR = outerR * 0.62;

  const segments = data.map((d) => {
    const start = (cumulative / total) * 360;
    cumulative += d.value;
    const end = (cumulative / total) * 360;
    return { ...d, startAngle: start, endAngle: end };
  });

  const describeArc = (startAngle: number, endAngle: number) => {
    const start = {
      x: cx + outerR * Math.sin(toRad(startAngle)),
      y: cy - outerR * Math.cos(toRad(startAngle)),
    };
    const end = {
      x: cx + outerR * Math.sin(toRad(endAngle)),
      y: cy - outerR * Math.cos(toRad(endAngle)),
    };
    const innerStart = {
      x: cx + innerR * Math.sin(toRad(endAngle)),
      y: cy - innerR * Math.cos(toRad(endAngle)),
    };
    const innerEnd = {
      x: cx + innerR * Math.sin(toRad(startAngle)),
      y: cy - innerR * Math.cos(toRad(startAngle)),
    };
    const largeArc = endAngle - startAngle > 180 ? 1 : 0;
    return `M ${start.x} ${start.y} A ${outerR} ${outerR} 0 ${largeArc} 1 ${end.x} ${end.y} L ${innerStart.x} ${innerStart.y} A ${innerR} ${innerR} 0 ${largeArc} 0 ${innerEnd.x} ${innerEnd.y} Z`;
  };

  return (
    <div className="flex flex-col items-center gap-3 w-full">
      {title && (
        <p className="text-xs font-semibold text-[var(--color-brand-muted-text)] uppercase tracking-widest">
          {title}
        </p>
      )}
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        style={{ overflow: "visible" }}
      >
        {segments.map((seg, i) => (
          <path
            key={i}
            d={describeArc(seg.startAngle, Math.min(seg.endAngle, seg.startAngle + 359.9))}
            fill={seg.color}
            style={{
              opacity: triggered ? 0.9 : 0,
              transform: triggered ? "scale(1)" : "scale(0.3)",
              transformOrigin: `${cx}px ${cy}px`,
              transition: `opacity 0.45s ease ${i * 80}ms, transform 0.5s cubic-bezier(0.34,1.56,0.64,1) ${i * 80}ms`,
            }}
            className="hover:opacity-100 cursor-default"
          />
        ))}
        <text
          x={cx}
          y={cy - 8}
          textAnchor="middle"
          fill="#e2eaf8"
          fontSize="18"
          fontWeight="bold"
        >
          {total}
        </text>
        <text x={cx} y={cy + 10} textAnchor="middle" fill="#7a90b8" fontSize="9">
          encuestas
        </text>
      </svg>
      <div className="grid grid-cols-2 gap-x-4 gap-y-1 w-full">
        {data.map((d, i) => (
          <div key={i} className="flex items-center gap-2">
            <span
              className="w-2.5 h-2.5 rounded-full shrink-0"
              style={{ background: d.color }}
            />
            <span className="text-[10px] text-[var(--color-brand-muted-text)] truncate">
              {d.label}
            </span>
            <span className="text-[10px] font-bold text-[var(--color-brand-text)] ml-auto">
              {Math.round((d.value / total) * 100)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Animated Heatmap ──────────────────────────────────────────
interface HeatmapProps {
  rows: string[];
  cols: string[];
  data: number[][];
  colorHigh?: string;
}

export function Heatmap({ rows, cols, data, colorHigh = "#06d6f0" }: HeatmapProps) {
  const max = Math.max(...data.flat(), 1);
  const [triggered, setTriggered] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setTriggered(true), 60);
    return () => clearTimeout(t);
  }, [rows, cols]);

  const hexToRgb = (hex: string) => {
    const res = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return res
      ? { r: parseInt(res[1], 16), g: parseInt(res[2], 16), b: parseInt(res[3], 16) }
      : { r: 6, g: 214, b: 240 };
  };
  const { r, g, b } = hexToRgb(colorHigh);

  return (
    <div className="overflow-x-auto w-full">
      <table className="w-full border-collapse text-[10px]">
        <thead>
          <tr>
            <th className="p-1 text-left text-[var(--color-brand-muted-text)]"></th>
            {cols.map((c, i) => (
              <th
                key={i}
                className="p-1 text-center text-[var(--color-brand-muted-text)] font-normal max-w-16"
              >
                <span className="block truncate" title={c}>
                  {c}
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, ri) => (
            <tr key={ri}>
              <td className="p-1 text-[var(--color-brand-muted-text)] whitespace-nowrap pr-3 font-medium">
                {row}
              </td>
              {cols.map((_, ci) => {
                const val = data[ri]?.[ci] ?? 0;
                const intensity = triggered ? val / max : 0;
                const delay = (ri * cols.length + ci) * 18;
                return (
                  <td
                    key={ci}
                    className="p-0.5 text-center font-bold cursor-default rounded"
                    style={{
                      background: `rgba(${r}, ${g}, ${b}, ${intensity * 0.85})`,
                      color: intensity > 0.5 ? "#fff" : "#7a90b8",
                      transition: `background 0.55s ease ${delay}ms, color 0.3s ease ${delay}ms`,
                    }}
                    title={`${row} × ${cols[ci]}: ${val}`}
                  >
                    <span className="block px-1 py-0.5 rounded text-[9px]">
                      {val > 0 ? val : ""}
                    </span>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ── Animated Rating Bar ────────────────────────────────────────
export function RatingBar({
  value,
  max = 5,
  color = "#06d6f0",
}: {
  value: number;
  max?: number;
  color?: string;
}) {
  const [filled, setFilled] = useState(0);

  useEffect(() => {
    let frame = 0;
    const interval = setInterval(() => {
      frame++;
      if (frame <= value) setFilled(frame);
      else clearInterval(interval);
    }, 120);
    return () => clearInterval(interval);
  }, [value]);

  return (
    <div className="flex gap-1">
      {Array.from({ length: max }).map((_, i) => (
        <div
          key={i}
          className="w-3 h-3 rounded-sm"
          style={{
            background: i < filled ? color : "rgba(42,58,92,0.8)",
            transition: `background 0.2s ease ${i * 80}ms`,
          }}
        />
      ))}
    </div>
  );
}

// ── Animated Stat Card ────────────────────────────────────────
interface StatCardProps {
  label: string;
  value: string | number;
  sub?: string;
  color?: string;
  icon?: string;
  delay?: number;
}

export function StatCard({ label, value, sub, color = "#06d6f0", icon, delay = 0 }: StatCardProps) {
  const [display, setDisplay] = useState<string | number>("");
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const showTimer = setTimeout(() => setVisible(true), delay);

    // Numeric counter animation
    const numMatch = String(value).match(/^(\d+(?:\.\d+)?)(.*)?$/);
    if (numMatch) {
      const target = parseFloat(numMatch[1]);
      const suffix = numMatch[2] || "";
      const duration = 900;
      const steps = 40;
      const stepTime = duration / steps;
      let step = 0;
      const timer = setTimeout(() => {
        const interval = setInterval(() => {
          step++;
          const progress = step / steps;
          // ease-out curve
          const eased = 1 - Math.pow(1 - progress, 3);
          const current = target * eased;
          setDisplay(
            Number.isInteger(target)
              ? Math.round(current) + suffix
              : current.toFixed(1) + suffix
          );
          if (step >= steps) {
            clearInterval(interval);
            setDisplay(value);
          }
        }, stepTime);
        return () => clearInterval(interval);
      }, delay + 100);

      return () => {
        clearTimeout(showTimer);
        clearTimeout(timer);
      };
    } else {
      setTimeout(() => setDisplay(value), delay + 100);
    }
    return () => clearTimeout(showTimer);
  }, [value, delay]);

  return (
    <div
      className="glass-card p-5 flex flex-col gap-2 hover-lift stat-card-glow cursor-default"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(12px)",
        transition: `opacity 0.4s ease ${delay}ms, transform 0.45s cubic-bezier(0.22,1,0.36,1) ${delay}ms`,
      }}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs text-[var(--color-brand-muted-text)] uppercase tracking-widest">
          {label}
        </span>
        {icon && (
          <span className="text-xl" style={{ animation: `float 3s ease-in-out ${delay}ms infinite` }}>
            {icon}
          </span>
        )}
      </div>
      <span
        className="text-3xl font-bold stat-value-enter"
        style={{ color, animationDelay: `${delay + 100}ms` }}
      >
        {display}
      </span>
      {sub && (
        <span className="text-xs text-[var(--color-brand-muted-text)]">{sub}</span>
      )}
    </div>
  );
}
