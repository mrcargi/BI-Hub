import { useRef, useEffect } from 'react'
import gsap from 'gsap'
import { Settings2, Table2, Columns3, FunctionSquare, Link2, ClipboardList, Database, Calendar, User, Layers, Plug, Wifi, FileType, Globe } from 'lucide-react'
import type { Reporte } from '@/types'
import { TypeBadge, EstadoBadge } from '@/components/ui/Badge'

export function TabResumen({ doc }: { doc: Reporte }) {
  const heroRef = useRef<HTMLDivElement>(null)

  const totalMeasures = (doc.folders || []).reduce((s, f) => s + (f.measures || []).length, 0)
  const activeRels = (doc.relations || []).filter(r => r.active).length
  const tables = doc.tables || []

  useEffect(() => {
    if (!heroRef.current) return
    gsap.fromTo(heroRef.current,
      { scale: 0.97, opacity: 0.3 },
      { scale: 1, opacity: 1, duration: 0.5, ease: 'power2.out', clearProps: 'transform,opacity' },
    )
  }, [doc.id])

  return (
    <div className="space-y-4">
      {/* Hero card */}
      <div
        ref={heroRef}
        className="relative overflow-hidden rounded-2xl p-6 lg:p-8"
        style={{ background: 'linear-gradient(160deg, #0f4c2a 0%, #14532d 35%, #166534 70%, #1a7a40 100%)' }}
      >
        {/* Geometric decorative elements */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {/* Large arc top-right */}
          <svg className="absolute -top-20 -right-20 w-[320px] h-[320px] opacity-[0.07]" viewBox="0 0 300 300">
            <circle cx="150" cy="150" r="140" fill="none" stroke="white" strokeWidth="20" />
          </svg>
          {/* Medium arc center-right */}
          <svg className="absolute top-10 -right-10 w-[200px] h-[200px] opacity-[0.05]" viewBox="0 0 200 200">
            <circle cx="100" cy="100" r="80" fill="none" stroke="white" strokeWidth="15" />
          </svg>
          {/* Subtle diagonal line */}
          <svg className="absolute bottom-0 right-0 w-full h-full opacity-[0.03]" viewBox="0 0 400 200" preserveAspectRatio="none">
            <line x1="200" y1="200" x2="400" y2="0" stroke="white" strokeWidth="1" />
            <line x1="250" y1="200" x2="450" y2="0" stroke="white" strokeWidth="1" />
          </svg>
        </div>

        <div className="relative z-10">
          {/* Overline label */}
          <span className="inline-block px-3 py-1 rounded-full border border-white/25 text-white/70 text-2xs font-semibold uppercase tracking-[0.15em] mb-5">
            Operational Overview
          </span>

          {/* Title */}
          <h2 className="text-2xl lg:text-[28px] font-extrabold text-white leading-tight mb-2.5">
            {doc.name}
          </h2>

          {/* Description */}
          {doc.desc && (
            <p className="text-white/50 text-[13px] max-w-md leading-relaxed mb-5">{doc.desc}</p>
          )}

          {/* Badges row */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-white/25 text-white text-2xs font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              {doc.estado || 'activo'}
            </span>
            {doc.direccion && (
              <span className="px-3 py-1.5 rounded-full border border-white/20 text-white/80 text-2xs font-medium">
                {doc.direccion}
              </span>
            )}
            {doc.area && (
              <span className="px-3 py-1.5 rounded-full border border-white/20 text-white/80 text-2xs font-medium">
                {doc.area}
              </span>
            )}
            {doc.updatedAt && (
              <span className="px-3 py-1.5 rounded-full border border-white/20 text-white/80 text-2xs font-medium">
                {doc.updatedAt}
              </span>
            )}
          </div>
        </div>

        {/* Settings icon bottom-right */}
        <div className="absolute bottom-5 right-5 w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center backdrop-blur-sm">
          <Settings2 size={16} className="text-white/60" />
        </div>
      </div>

      {/* Metrics row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard icon={Table2} value={tables.length} label="Tablas" color="text-brand-600" border="border-t-brand-500" />
        <MetricCard icon={Columns3} value={(doc.columns || []).length} label="Columnas" color="text-blue-600" border="border-t-blue-500" />
        <MetricCard icon={FunctionSquare} value={totalMeasures} label="Medidas DAX" color="text-violet-600" border="border-t-violet-500" />
        <MetricCard icon={Link2} value={activeRels} label="Relaciones" color="text-amber-600" border="border-t-amber-500" />
      </div>

      {/* Details + Source row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="card card-body border-t-2 border-t-brand-500 space-y-1">
          <div className="flex items-center gap-2.5 mb-3">
            <div className="w-9 h-9 rounded-xl bg-brand-50 flex items-center justify-center text-brand-600">
              <ClipboardList size={18} />
            </div>
            <h3 className="text-sm font-bold text-ink-900">Detalles</h3>
          </div>
          <DetailRow icon={Layers} label="Area" value={doc.area || '—'} accent="text-brand-500" />
          <DetailRow icon={Layers} label="Direccion" value={doc.direccion || '—'} accent="text-brand-500" />
          <DetailRow icon={User} label="Responsable" value={doc.responsable || '—'} accent="text-blue-500" />
          <DetailRow icon={Layers} label="Compatibilidad" value={`PBI ${doc.compat || '—'}`} accent="text-violet-500" />
          <DetailRow icon={Calendar} label="Creado" value={doc.createdAt || '—'} accent="text-amber-500" />
          <DetailRow icon={Calendar} label="Actualizado" value={doc.updatedAt || '—'} accent="text-amber-500" />
        </div>

        {doc.source && (
          <div className="card card-body border-t-2 border-t-amber-500 space-y-1">
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
                <Database size={18} />
              </div>
              <h3 className="text-sm font-bold text-ink-900">Fuente</h3>
            </div>
            <DetailRow icon={Plug} label="Conector" value={doc.source.connector || '—'} accent="text-amber-500" />
            <DetailRow icon={Wifi} label="Modo" value={doc.source.mode || '—'} accent="text-blue-500" />
            {doc.source.url && <DetailRow icon={Globe} label="URL" value={doc.source.url} accent="text-violet-500" />}
            {doc.source.fileType && <DetailRow icon={FileType} label="Archivos" value={doc.source.fileType} accent="text-brand-500" />}
          </div>
        )}
      </div>

      {/* Tables — full width */}
      <div className="card border-t-2 border-t-blue-500">
        <div className="card-header flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
              <Table2 size={18} />
            </div>
            <h3 className="text-sm font-bold text-ink-900">Tablas del Modelo</h3>
          </div>
          <span className="text-2xs text-ink-400 font-mono bg-surface-50 px-2.5 py-1 rounded-full">{tables.length} tablas</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-surface-100">
                {['Tabla', 'Tipo', 'Cols', 'Filas', 'Descripcion'].map(h => (
                  <th key={h} className="px-5 py-3 text-left text-2xs font-semibold text-ink-400 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tables.map((t, i) => (
                <tr key={i} className="border-b border-surface-100/60 last:border-0 hover:bg-surface-50 transition-colors">
                  <td className="px-5 py-3 text-[13px] font-semibold text-ink-900 whitespace-nowrap">{t.name}</td>
                  <td className="px-5 py-3"><TypeBadge type={t.type} /></td>
                  <td className="px-5 py-3 font-mono text-xs text-ink-500">{t.cols}</td>
                  <td className="px-5 py-3 font-mono text-xs text-ink-400 whitespace-nowrap">{t.rows}</td>
                  <td className="px-5 py-3 text-xs text-ink-500 leading-relaxed">{t.desc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

function MetricCard({ icon: Icon, value, label, color, border }: {
  icon: React.ElementType; value: number; label: string; color: string; border: string
}) {
  return (
    <div className={`card card-body border-t-2 ${border}`}>
      <div className="flex items-center justify-between mb-3">
        <div className={`w-9 h-9 rounded-xl bg-surface-100 flex items-center justify-center ${color}`}>
          <Icon size={18} />
        </div>
      </div>
      <div className={`text-2xl font-extrabold ${color} font-mono`}>{value}</div>
      <div className="text-2xs text-ink-400 uppercase tracking-wider font-semibold mt-1">{label}</div>
    </div>
  )
}

function DetailRow({ icon: Icon, label, value, accent }: { icon?: React.ElementType; label: string; value: string; accent?: string }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-surface-100/60 last:border-0 group">
      <div className="flex items-center gap-2">
        {Icon && (
          <Icon size={14} className={`${accent || 'text-ink-300'} opacity-60 group-hover:opacity-100 transition-opacity`} />
        )}
        <span className="text-xs text-ink-400">{label}</span>
      </div>
      <span className="text-xs text-ink-700 font-medium">{value}</span>
    </div>
  )
}
