import React from 'react';
import InputField from '../../../InputFieldProps';
import './ValidatedNumberInput.css';

interface ValidatedNumberInputProps {
    value: string;
    onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    onBlur: (event: React.FocusEvent<HTMLInputElement>) => void;
    onFocus: (event: React.FocusEvent<HTMLInputElement>) => void;
    min: number;
    max: number;
    maxLength?: number;
    placeholder: string;
    label?: string;
}

const ValidatedNumberInput: React.FC<ValidatedNumberInputProps> = ({
    value,
    onChange,
    onBlur,
    onFocus,
    min,
    max,
    maxLength,
    placeholder,
    label
}) => {
    return (
        <div className="validated-number-input">
            {label && <label className="input-label">{label}</label>}
            <InputField
                label=""
                type="number"
                value={value}
                onChange={onChange}
                onBlur={onBlur}
                onFocus={onFocus}
                placeholder={placeholder}
                min={min}
                max={max}
                maxLength={maxLength}
            />
        </div>
    );
};

export default ValidatedNumberInput;
