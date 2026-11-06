import { useEffect, useRef, useState, type ChangeEvent } from 'react';
import { useField } from 'informed';
import type { UseInputFileProps, FileValue } from './types';

function isFileValue(value: unknown): value is FileValue {
  return typeof value === 'object' && value !== null && 'name' in value && typeof value.name === 'string';
}

export function useInputFile({ name, validate, onChange }: UseInputFileProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { fieldState, fieldApi, render } = useField({ name, validate, inputRef: fileInputRef });
  const reader = useRef<FileReader | null>(null);
  const [error, setError] = useState<string>();
  useEffect(() => () => { reader.current?.abort(); }, []);
  const removeFile = () => {
    reader.current?.abort();
    if (fileInputRef.current) fileInputRef.current.value = '';
    fieldApi.setValue(undefined);
    fieldApi.setTouched(true);
    setError(undefined);
  };
  const handleOnChange = (event: ChangeEvent<HTMLInputElement>) => {
    reader.current?.abort();
    setError(undefined);
    const file = event.target.files?.[0];
    if (file) {
      const current = new FileReader();
      reader.current = current;
      current.onload = () => {
        if (typeof current.result !== 'string') return;
        fieldApi.setValue({ file, base64: current.result, name: file.name, type: file.type, size: file.size });
        fieldApi.setTouched(true);
      };
      current.onerror = () => { setError('No se pudo leer el archivo.'); };
      current.readAsDataURL(file);
    }
    onChange?.(event);
  };
  return { fileInputRef, value: isFileValue(fieldState.value) ? fieldState.value : undefined,
    removeFile, handleOnChange, render, error };
}
