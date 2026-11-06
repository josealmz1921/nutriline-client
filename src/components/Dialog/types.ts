import type { ReactNode } from "react";

export type DialogProps = {
    isOpen: boolean;
    children: ReactNode;
    ariaLabel?: string;
    wide?: boolean;
    onClose: () => void;
}
export type UseDialogProps = Pick<DialogProps, 'onClose' | 'isOpen'>;
