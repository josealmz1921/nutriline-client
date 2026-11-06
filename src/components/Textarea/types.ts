import type { HTMLInputTypeAttribute, ReactNode } from 'react';

export type CallbackFunction = (
  value: unknown,
  values: Record<string, unknown>
) => unknown;

export type InputProps = {
  identifier: string;
  label?: string;
  placeholder?: string;
  required?: boolean | string;
  maxLength?: number;
  type?: HTMLInputTypeAttribute;
  className?: string;
  classes?: Record<string, string>;
  validate?: CallbackFunction;
  disabled?: boolean;
  after?: ReactNode;
  before?: ReactNode;
};
