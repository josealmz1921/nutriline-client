import type { ReactNode } from 'react'
import styles from './SummaryCard.module.css'

interface Props {
  icon: ReactNode
  label: string
  value: number
  description: string
}

export default function SummaryCard({ icon, label, value, description }: Props) {
  return <div className={styles.card}>
    <dt><span className={styles.icon} aria-hidden="true">{icon}</span>{label}</dt>
    <dd><strong>{value}</strong><span>{description}</span></dd>
  </div>
}
