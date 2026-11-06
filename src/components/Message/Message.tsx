import styles from './Message.module.css';
import { useMessage } from './useMessage';

const Message: React.FC<{ field: string; id?: string }> = ({ field, id = `${field}-error` }) => {
    const error = useMessage(field);
    if (!error) return null;
    return (
        <div className={styles.root} id={id}>
            <p className={styles.error} role="alert">{error}</p>
        </div>
    )
}

export default Message;
