import React from 'react';

interface InputFieldProps {
  label: string;
  type?: string; // Ajout d'un prop type pour définir le type d'input
  value: string | number;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  min?: number;
  max?: number;
}

const InputField: React.FC<InputFieldProps> = ({ label, type = 'text', value, onChange, placeholder, min, max }) => (
  <div className="input-box">
    <label>{label}</label>
    <input
      type={type} // Utilisation du type dynamique
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      min={min}
      max={max}
      className="input-field" // Ajout d'une classe pour le style
    />
  </div>
);

export default InputField;
