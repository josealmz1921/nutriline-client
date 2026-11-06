import styles from './BlogEditor.module.css';
import { useBlogEditor } from './useBlogEditor';
import type { BlogEditorProps } from './types';

export default function BlogEditor(props: BlogEditorProps) {
  const { holder, error } = useBlogEditor(props);
  return <div className={styles.editor}>
    {error && <p role="alert">No se pudo cargar el editor. Recarga la página para intentarlo de nuevo.</p>}
    <div ref={holder} />
  </div>;
}
