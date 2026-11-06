import { useSortableItem } from './useSortableItem';
import styles from './SortableItem.module.css';

const SortableItem = ({ id, children, disabled = false }: { id: string; children: React.ReactNode; disabled?: boolean }) => {
  const { attributes, listeners, setNodeRef, style } = useSortableItem(id, disabled);

  return (
    <div ref={setNodeRef} style={style} className={disabled ? styles.disabled : styles.root} {...attributes} {...listeners}>
      {children}
    </div>
  );
}

export default SortableItem;
