const dateFormat = new Intl.DateTimeFormat('es-MX', {
  day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  hourCycle: 'h23', timeZone: 'America/Mexico_City',
})

export function formatConsultation(instant: string) {
  return dateFormat.format(new Date(instant))
}
