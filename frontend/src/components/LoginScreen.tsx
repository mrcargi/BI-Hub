import { useState, useRef, useEffect } from 'react'
import { Mail, Lock } from 'lucide-react'
import gsap from 'gsap'
import { useStore } from '@/store/useStore'
import type { LoginResponse } from '@/types'

export function LoginScreen() {
  const { login } = useStore()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const screenRef = useRef<HTMLDivElement>(null)
  const blobsRef = useRef<HTMLDivElement>(null)

  // Animate background blobs
  useEffect(() => {
    if (!blobsRef.current) return
    const blobs = blobsRef.current.children
    Array.from(blobs).forEach((blob, i) => {
      gsap.to(blob, {
        x: `random(-60, 60)`,
        y: `random(-60, 60)`,
        scale: `random(0.8, 1.2)`,
        duration: `random(6, 10)`,
        ease: 'sine.inOut',
        repeat: -1,
        yoyo: true,
        delay: i * 0.8,
      })
    })
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (!email || !password) {
      setError('Ingresa email y contrasena')
      return
    }
    setLoading(true)
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const data: LoginResponse & { detail?: string } = await res.json()
      if (!res.ok) {
        setError(data.detail || 'Credenciales invalidas')
        return
      }
      if (!data.token) {
        setError('Error: servidor no devolvio token')
        return
      }

      await gsap.to(screenRef.current, { opacity: 0, duration: 0.4, ease: 'power2.in' })
      login(data.token, data.user)
    } catch (err) {
      setError('Error de conexion: ' + (err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div ref={screenRef} className="fixed inset-0 z-50 flex items-center justify-center min-h-screen"
      style={{ background: 'linear-gradient(135deg, #ecfdf5 0%, #f0fdf4 25%, #eff6ff 50%, #f5f3ff 75%, #ecfdf5 100%)' }}
    >
      {/* Animated background blobs */}
      <div ref={blobsRef} className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-10 -right-10 w-[550px] h-[550px] rounded-full opacity-[0.72]"
          style={{ background: 'radial-gradient(circle, #86efac 0%, transparent 60%)' }}
        />
        <div className="absolute -bottom-20 -left-20 w-[500px] h-[500px] rounded-full opacity-[0.60]"
          style={{ background: 'radial-gradient(circle, #93c5fd 0%, transparent 60%)' }}
        />
        <div className="absolute top-[15%] right-[10%] w-[400px] h-[400px] rounded-full opacity-[0.54]"
          style={{ background: 'radial-gradient(circle, #c4b5fd 0%, transparent 60%)' }}
        />
        <div className="absolute bottom-[10%] right-[35%] w-[350px] h-[350px] rounded-full opacity-[0.48]"
          style={{ background: 'radial-gradient(circle, #6ee7b7 0%, transparent 60%)' }}
        />
        <div className="absolute top-[55%] left-[15%] w-[300px] h-[300px] rounded-full opacity-[0.54]"
          style={{ background: 'radial-gradient(circle, #a5b4fc 0%, transparent 60%)' }}
        />
      </div>

      {/* Floating particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full"
            style={{
              width: 10 + i * 7,
              height: 10 + i * 7,
              top: `${10 + i * 11}%`,
              left: `${8 + i * 12}%`,
              border: `1.5px solid rgba(34, 197, 94, ${0.15 + i * 0.04})`,
              background: `rgba(34, 197, 94, ${0.03 + i * 0.01})`,
              animation: `float${i % 3} ${7 + i * 1.5}s ease-in-out infinite ${i * 0.5}s`,
            }}
          />
        ))}
        <style>{`
          @keyframes float0 { 0%,100% { transform: translateY(0) rotate(0deg); opacity: 0.3; } 50% { transform: translateY(-30px) rotate(180deg); opacity: 0.6; } }
          @keyframes float1 { 0%,100% { transform: translateY(0) translateX(0); opacity: 0.2; } 50% { transform: translateY(-20px) translateX(15px); opacity: 0.5; } }
          @keyframes float2 { 0%,100% { transform: translateY(0) scale(1); opacity: 0.25; } 50% { transform: translateY(-25px) scale(1.3); opacity: 0.5; } }
        `}</style>
      </div>

      {/* Card container */}
      <div className="relative z-10 w-full max-w-[1260px] mx-4 bg-white rounded-3xl shadow-[0_25px_60px_-12px_rgba(0,0,0,0.12)] overflow-hidden grid grid-cols-1 md:grid-cols-2 min-h-[720px]">

        {/* Left panel — green with content */}
        <div className="relative flex flex-col items-center justify-center p-10 overflow-hidden"
          style={{ background: 'linear-gradient(160deg, #14532d 0%, #166534 40%, #22c55e 100%)' }}
        >
          {/* Decorative arcs */}
          <div className="absolute inset-0 pointer-events-none">
            <svg className="absolute -top-10 -right-10 w-[250px] h-[250px] opacity-[0.08]" viewBox="0 0 200 200">
              <circle cx="100" cy="100" r="90" fill="none" stroke="white" strokeWidth="16" />
            </svg>
            <svg className="absolute bottom-10 -left-10 w-[180px] h-[180px] opacity-[0.06]" viewBox="0 0 200 200">
              <circle cx="100" cy="100" r="80" fill="none" stroke="white" strokeWidth="12" />
            </svg>
            <svg className="absolute top-1/2 right-0 w-[120px] h-[120px] opacity-[0.04]" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="40" fill="none" stroke="white" strokeWidth="8" />
            </svg>
          </div>

          <div className="relative z-10 text-center max-w-[360px]">
            <img src="/static/img/nadro-logo.png" alt="NADRO" className="h-10 mx-auto mb-10 brightness-0 invert opacity-90" />

            <h2 className="text-[34px] font-extrabold text-white leading-tight mb-4">
              Bienvenido!
            </h2>
            <p className="text-base text-white/60 leading-relaxed mb-10">
              Centraliza y organiza la documentacion de tus reportes Power BI en un solo lugar.
            </p>

            <div className="flex flex-wrap justify-center gap-2.5">
              {['Tablas', 'Medidas', 'Fuentes', 'Relaciones'].map((label, i) => (
                <span key={i} className="text-xs text-white/70 border border-white/20 px-4 py-2 rounded-full font-medium">
                  {['📊', '📐', '📁', '🔗'][i]} {label}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Right panel — form */}
        <div className="flex flex-col items-center justify-center p-10 md:p-14">
          <div className="w-full max-w-[400px]">
            {/* Logos */}
            <div className="flex items-center justify-center gap-4 mb-8">
              <img src="/static/img/nadro-logo.png" alt="NADRO" className="h-8 opacity-85" />
              <span className="text-3xl font-light text-[#d6d3d1]">&times;</span>
              <img src="/static/img/xdata-logo.png" alt="X-Data" className="h-[58px]" />
            </div>

            {/* Title */}
            <div className="text-center mb-8">
              <h1 className="text-2xl font-extrabold text-[#1c1917] mb-1.5">Iniciar Sesion</h1>
              <p className="text-sm text-[#a8a29e]">Ingresa tus credenciales para continuar</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email */}
              <div className="relative">
                <Mail size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#a8a29e]" />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="Email"
                  autoComplete="email"
                  className="w-full bg-transparent border-b-2 border-[#e7e5e4] pl-11 pr-3 py-3.5 text-[#1c1917] text-sm outline-none transition-all focus:border-[#16a34a] placeholder:text-[#a8a29e]"
                />
              </div>

              {/* Password */}
              <div className="relative">
                <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#a8a29e]" />
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Contrasena"
                  autoComplete="current-password"
                  onKeyDown={e => { if (e.key === 'Enter') handleSubmit(e) }}
                  className="w-full bg-transparent border-b-2 border-[#e7e5e4] pl-11 pr-3 py-3.5 text-[#1c1917] text-sm outline-none transition-all focus:border-[#16a34a] placeholder:text-[#a8a29e]"
                />
              </div>

              {/* Error */}
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 text-[13px] p-3 rounded-xl">
                  {error}
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 text-sm font-semibold text-white rounded-full cursor-pointer transition-all disabled:opacity-60 hover:brightness-110 hover:shadow-lg active:scale-[0.98] mt-3"
                style={{ background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)' }}
              >
                {loading ? 'Iniciando...' : 'INICIAR SESION'}
              </button>

              <p className="text-center text-xs text-[#a8a29e] mt-5">
                Contacta al administrador si no tienes cuenta
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
