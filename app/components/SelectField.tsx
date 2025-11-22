import React from 'react';
import CustomSelect from './CustomSelect'; // Make sure the path is correct

interface SelectFieldProps {
  label: string;
  options: { value: string; label: string }[];
  value: string | null; // Allows handling initial value that could be null
  onChange: (value: string) => void; // Change to handle value directly instead of event
  placeholder?: string;
}

const SelectField: React.FC<SelectFieldProps> = ({ label, options, value, onChange, placeholder }) => {
  // Function to handle value change
  const handleChange = (selectedOption: any) => {
    if (selectedOption) {
      onChange(selectedOption.value);
    } else {
      onChange(''); // If no option is selected
    }
  };

  return (
    <div className="input-box">
      <label>{label}</label>
      <CustomSelect
        options={options}
        value={options.find(option => option.value === value) || null} // Set selected value
        placeholder={placeholder || "Select an option"}
        onChange={handleChange}
      />
    </div>
  );
};

export default SelectField;
