import type { ReactNode } from "react";

export type BulkActionsProps = {

    variant?:
    | "outline-primary"
    | "outline-danger"
    | "outline-gray"
    | "solid"
    | "ghost";
    label?: ReactNode;
    placeholder?: string
    classes?: { [key: string]: string };
    disabled?: boolean;
    actions?: Array<{
        onClick?: () => void;
        label: string;
        icon?: ReactNode;
    }>
};
