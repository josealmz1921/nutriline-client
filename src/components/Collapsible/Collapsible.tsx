import styles from './Collapsible.module.css'
import type {CollapsibleProps} from './types'
import { useCollapsible } from './useCollapsible'
import { ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/24/outline";  
import clsx from 'clsx'

const Collapsible = (props: CollapsibleProps) => {
    const {
        title,
        children,
        classes: propClasses,
        type
    } = props

    const classes = {...styles, ...propClasses}
    const { open, toggle, panelId } = useCollapsible(props)

    const alternativeStyle = type === "comments" ? classes.comments : null;

    return (
        <div className={`${classes.container} ${alternativeStyle}`}>
            <button
                type="button"
                className={open ? classes.button : classes.buttonCollapse}
                onClick={toggle}
                aria-expanded={open}
                aria-controls={panelId}
            >
                <span className={classes.title}>{title}</span>
                <span className={classes.icon}>
                    {open ? <ChevronUpIcon /> : <ChevronDownIcon />}
                </span>
            </button>

            <div
                id={panelId}
                hidden={!open}
                className={clsx(
                    classes.panel,
                    !open && classes.panelHidden
                )}
            >
                {children}
            </div>
        </div>
    )
}

export default Collapsible
