import { useFormState } from 'informed'
import { isBiochemistryUnavailable } from '../Biochemistry/biochemistryModel'

export function useBiochemistryFields() {
  const { values } = useFormState()
  return { unavailable: isBiochemistryUnavailable(values.biochemistry) }
}
