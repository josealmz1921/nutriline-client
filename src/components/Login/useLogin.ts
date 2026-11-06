import { useEffect, useState } from 'react'

export function useLogin() {
  useEffect(() => { document.title = 'Iniciar sesión · Nutriline' }, [])
  const [showPassword, setShowPassword] = useState(false)
  const [notice, setNotice] = useState('')

  const handleSubmit = () => {
    setNotice('Esta es una vista previa. El inicio de sesión aún no está conectado; no se enviaron tus datos.')
  }
  const handleRecovery = () => {
    setNotice('La recuperación de contraseña estará disponible cuando conectemos la autenticación.')
  }

  return { showPassword, notice, handleSubmit, handleRecovery,
    togglePassword: () => setShowPassword(value => !value) }
}
