import { useEffect } from 'react'

export function useNotFound() {
  useEffect(() => { document.title = 'Página no encontrada · Nutriline' }, [])
}
