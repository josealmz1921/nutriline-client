import type { OutputData } from '@editorjs/editorjs';
import type { RefObject } from 'react';

export interface TextEditorApi { save: () => Promise<OutputData> }
export interface BlogEditorProps {
  initialValue: OutputData;
  apiRef: RefObject<TextEditorApi | null>;
}
