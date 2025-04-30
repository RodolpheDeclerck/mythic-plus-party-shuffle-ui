import React from 'react';

export interface InputFieldProps {
  label: string;
  type?: string; // Ajout d'un prop type pour définir le type d'input
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
      type={type} // Utilisation du type dynamique
      value={value}
      onChange={onChange}
      onBlur={onBlur}
      onFocus={onFocus}
      placeholder={placeholder}
      min={min}
      max={max}
      maxLength={maxLength}
      className="input-field" // Ajout d'une classe pour le style
    />
  </div>
);

export default InputField;
