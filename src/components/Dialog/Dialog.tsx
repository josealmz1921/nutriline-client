import { useDialog } from "./useDialog";
import type { DialogProps } from "./types";
import styles from './Dialog.module.css';
import { XMarkIcon } from "@heroicons/react/24/outline"; 
import Portal from "../Portal";

const Dialog = (props: DialogProps) => {

    const { children, isOpen, onClose, ariaLabel = 'Diálogo', wide = false } = props;
    const classes = styles;
    const { modalRef } = useDialog(props);

    if (!isOpen) return null;

    return (
        <Portal>
            <div className={classes.root}>
                <div
                    role="dialog"
                    aria-modal="true"
                    aria-label={ariaLabel}
                    tabIndex={-1}
                    ref={modalRef}
                    className={wide ? `${classes.content} ${classes.wide}` : classes.content}>
                    <button type="button" aria-label="Cerrar formulario" onClick={onClose} className={classes.closeButton}>
                        <XMarkIcon className={classes.icon} />
                    </button>
                    {children}
                </div>
            </div>
        </Portal>
    )
}

export default Dialog;
