import React from 'react';

interface InputFieldProps {
  label: string;
  type?: string; // Ajout d'un prop type pour définir le type d'input
  value: string | number;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
}

const InputField: React.FC<InputFieldProps> = ({ label, type = 'text', value, onChange, placeholder }) => (
  <div className="input-box">
    <label>{label}</label>
    <input
      type={type} // Utilisation du type dynamique
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="input-field" // Ajout d'une classe pour le style
    />
  </div>
);

export default InputField;
