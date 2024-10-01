import React from 'react';

interface SelectFieldProps {
  label: string;
  options: { value: string; label: string }[];
  value: string;
  onChange: (event: React.ChangeEvent<HTMLSelectElement>) => void;
  placeholder?: string; // Add an optional placeholder prop
}

const SelectField: React.FC<SelectFieldProps> = ({ label, options, value, onChange, placeholder }) => {
  return (
    <div className="select-field">
      <label>{label}</label>
      <select value={value} onChange={onChange}>
        {/* Add a placeholder option if provided */}
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default SelectField;
