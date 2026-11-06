import type { HTMLInputTypeAttribute, InputHTMLAttributes, ReactNode } from 'react';

export type CallbackFunction = (
  value: unknown,
  values: Record<string, unknown>
) => unknown;

export type InputProps = {
    identifier: string;
    id?: string;
  label?: string;
  placeholder?: string;
  required?: boolean | string;
    type?: HTMLInputTypeAttribute;
    inputMode?: InputHTMLAttributes<HTMLInputElement>['inputMode'];
  className?: string;
  classes?: Record<string, string>;
  validate?: CallbackFunction;
  disabled?: boolean;
  autoComplete?: string;
  min?: string | number;
  max?: string | number;
  maxLength?: number;
  after?: ReactNode;
  before?: ReactNode;
};
