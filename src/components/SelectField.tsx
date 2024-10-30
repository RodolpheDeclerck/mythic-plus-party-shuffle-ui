import React from 'react';
import CustomSelect from './CustomSelect'; // Assurez-vous que le chemin est correct

interface SelectFieldProps {
  label: string;
  options: { value: string; label: string }[];
  value: string | null; // Permet de gérer la valeur initiale qui pourrait être nulle
  onChange: (value: string) => void; // Change pour gérer la valeur directement au lieu de l'événement
  placeholder?: string;
}

const SelectField: React.FC<SelectFieldProps> = ({ label, options, value, onChange, placeholder }) => {
  // Fonction pour gérer le changement de valeur
  const handleChange = (selectedOption: any) => {
    if (selectedOption) {
      onChange(selectedOption.value);
    } else {
      onChange(''); // Si aucune option n'est sélectionnée
    }
  };

  return (
    <div className="input-box">
      <label>{label}</label>
      <CustomSelect
        options={options}
        value={options.find(option => option.value === value) || null} // Définit la valeur sélectionnée
        placeholder={placeholder || "Select an option"}
        onChange={handleChange}
      />
    </div>
  );
};

export default SelectField;
