interface SelectFieldProps {
  label: string;
  options: { value: string; label: string }[]; // Mise à jour du type pour accepter des objets
  value: string;
  onChange: (event: React.ChangeEvent<HTMLSelectElement>) => void;
}

const SelectField: React.FC<SelectFieldProps> = ({ label, options, value, onChange }) => {
  return (
    <div className="select-field">
      <label>{label}</label>
      <select value={value} onChange={onChange}>
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
