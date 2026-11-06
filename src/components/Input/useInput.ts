import { useField } from 'informed'
import type { ChangeEvent, FocusEvent } from 'react'
import type { InputProps } from './types'

interface Props extends Pick<InputProps, 'identifier' | 'type' | 'required' | 'validate'> {
  formatter?: (value: string) => (string | RegExp)[]
  parse?: (value: string) => string | RegExp
}

export function useInput({ identifier, type, required, validate, formatter, parse }: Props) {
  const { fieldState, fieldApi, render, ref } = useField({
    name: identifier, type, required, validate, formatter, parser: parse,
  })
  return {
    render, ref,
    value: fieldState.maskedValue == null ? '' : String(fieldState.maskedValue),
    invalid: Boolean(fieldState.error),
    onChange: (event: ChangeEvent<HTMLInputElement>) => fieldApi.setValue(event.target.value, event),
    onBlur: (event: FocusEvent<HTMLInputElement>) => fieldApi.setTouched(true, event),
    onFocus: (event: FocusEvent<HTMLInputElement>) => fieldApi.setFocused(true, event),
  }
}
