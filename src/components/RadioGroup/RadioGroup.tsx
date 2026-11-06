import {
    RadioGroup as RadioGroupInformed,
    Radio
} from "informed";
import styles from "./RadioGroup.module.css";
import { useRadioGroup } from './useRadioGroup';
import type { MyRadioGroupProps } from "./types";
import Message from "../Message";

const RadioGroup = ({
    name,
    data,
    disabled = false,
    validate,
    onChange
}: MyRadioGroupProps) => {
    const { currentValue, handleChange } = useRadioGroup({ name, data, onChange });
    const classes = styles;
    return (
        <RadioGroupInformed 
        showErrorIfError={false}
            showErrorIfTouched={false}
        name={name} disabled={disabled} validate={validate}>
            <div onChange={handleChange} className={`${classes.root} ${disabled ? classes.rootDisable : ''}`}>
                {data.map((radio) => {
                    const itemDisabled = disabled || radio.disabled || radio.disable;
                    return (
                        <div
                            key={radio.id}
                            className={`
                            ${classes.radio}
                            ${currentValue === radio.value ? classes[`radioActive${currentValue}`] : ""}
                            ${itemDisabled ? classes.disabledRadio : ""}
                        `}
                        >
                            <Radio
                                label={radio.label}
                                value={radio.value}
                                disabled={itemDisabled}
                            />
                        </div>
                    );
                })}
            </div>
            <Message field={name} />
        </RadioGroupInformed>
    );
};

export default RadioGroup;
