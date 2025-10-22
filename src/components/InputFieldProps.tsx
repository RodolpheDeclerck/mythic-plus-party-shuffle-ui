import React from 'react';

export interface InputFieldProps {
  label: string;
  type?: string; // Add a type prop to define input type
  value: string | number;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (event: React.FocusEvent<HTMLInputElement>) => void;
  onFocus?: (event: React.FocusEvent<HTMLInputElement>) => void;
  placeholder?: string;
  min?: number;
  max?: number;
  maxLength?: number;
}

const InputField: React.FC<InputFieldProps> = ({ label, type = 'text', value, onChange, onBlur, onFocus, placeholder, min, max, maxLength }) => (
  <div className="input-box">
    <label>{label}</label>
    <input
      type={type} // Use dynamic type
      value={value}
      onChange={onChange}
      onBlur={onBlur}
      onFocus={onFocus}
      placeholder={placeholder}
      min={min}
      max={max}
      maxLength={maxLength}
      className="input-field" // Add class for styling
    />
  </div>
);

export default InputField;
