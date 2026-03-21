import { useState } from 'react'
import { LogOut, Users, Lock } from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { useStore } from '@/store/useStore'
import { apiFetch } from '@/api/client'

interface Props {
  open: boolean
  onClose: () => void
  onOpenUsers: () => void
}

export function UserMenuModal({ open, onClose, onOpenUsers }: Props) {
  const { user, logout, showToast } = useStore()
  const [newPass, setNewPass] = useState('')

  async function savePassword() {
    if (newPass) {
      if (newPass.length < 6) { showToast('Minimo 6 caracteres', '⚠'); return }
      try {
        await apiFetch('/auth/password', {
          method: 'PUT', body: JSON.stringify({ password: newPass }),
        })
        showToast('Contrasena actualizada', '✓')
      } catch (e) {
        showToast((e as Error).message, '✗')
      }
    }
    onClose()
  }

  return (
    <Modal open={open} onClose={onClose} maxWidth="max-w-[460px]">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-200 to-brand-400 flex items-center justify-center">
          <span className="text-brand-900 text-xs font-bold">{(user?.name || 'U').slice(0, 2).toUpperCase()}</span>
        </div>
        <div>
          <h2 className="text-sm font-bold text-ink-900">{user?.name}</h2>
          <p className="text-2xs text-ink-400">{user?.email} · <span className="capitalize font-medium">{user?.role}</span></p>
        </div>
      </div>

      <div className="mb-4">
        <label className="flex items-center gap-1.5 text-2xs font-semibold text-ink-400 mb-1.5 uppercase tracking-wider">
          <Lock size={12} /> Nueva contrasena
        </label>
        <input
          type="password"
          value={newPass}
          onChange={e => setNewPass(e.target.value)}
          placeholder="Dejar vacio para no cambiar"
          className="form-input"
        />
      </div>

      <div className="flex items-center gap-2 pt-1">
        <button onClick={() => { logout(); onClose() }} className="btn hover:!border-red-300 hover:!text-red-600 hover:!bg-red-50">
          <LogOut size={14} /> Salir
        </button>
        {user?.role === 'admin' && (
          <button onClick={() => { onClose(); onOpenUsers() }} className="btn">
            <Users size={14} /> Usuarios
          </button>
        )}
        <button onClick={onClose} className="btn ml-auto">Cerrar</button>
        <button onClick={savePassword} className="btn-primary">Guardar</button>
      </div>
    </Modal>
  )
}
