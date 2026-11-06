import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import { ChevronDownIcon } from "@heroicons/react/24/outline";  
import styles from "./BulkActions.module.css";
import type { BulkActionsProps } from "./types";

const BulkActions = (props: BulkActionsProps) => {
    const {
        variant = "outline-gray",
        label = "Acciones",
        placeholder,
        classes: propClasses,
        actions,
        disabled
    } = props;
    const classes = { ...styles, ...propClasses };
    return (
        <div className={classes.root}>
            <Menu>
                <MenuButton
                    disabled={disabled}
                    className={`${classes.button}`}
                    data-label={label}
                >
                    <span>{variant.includes('outline') ? placeholder || label : label}</span>
                    <span><ChevronDownIcon className={classes.icon} /></span>
                </MenuButton>

                <MenuItems className={classes.items}>
                    {actions?.map((action, i) => {
                        return (
                            <MenuItem key={i}>
                                {({ disabled }) => (
                                    <button
                                        type="button"
                                        onClick={() => action?.onClick && action?.onClick()}
                                        disabled={disabled}
                                        className={`${classes.actionButton} ${disabled ? classes.activeAction : ""
                                            }`}
                                    >
                                        {action?.icon}
                                        {action.label}
                                    </button>
                                )}
                            </MenuItem>
                        )
                    })}
                </MenuItems>
            </Menu>
        </div>
    );
};

export default BulkActions;
