import Tippy from '@tippyjs/react';
import 'tippy.js/dist/tippy.css';
import 'tippy.js/dist/svg-arrow.css';
import styles from './ToolTip.module.css';
import { InformationCircleIcon } from '@heroicons/react/24/outline';
import { useToolTip } from './useToolTip';

const ToolTip = ({ content }: { content: string }) => {
    const { isMobile } = useToolTip();
    return (
        <div>
            <Tippy
                content={
                    <span className={styles.tooltipContent}>
                        {content}
                    </span>
                }
                placement={isMobile ? "bottom" : "right"}
                arrow={true}
                theme="custom-blue"
                trigger="click"
                hideOnClick={true}
            >
                <button type='button' className={styles.trigger} aria-label="Más información">
                    <InformationCircleIcon />
                </button>
            </Tippy>
        </div>
    )
}

export default ToolTip;
