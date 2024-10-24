import React from 'react';
import Select, { SingleValue } from 'react-select';

const customStyles = {
    control: (base: any) => ({
        ...base,
        background: 'transparent',
        border: '2px solid rgba(255, 255, 255, .2)',
        borderRadius: '40px',
        padding: '5px',
        color: '#fff',
        boxShadow: 'none',
        '&:hover': {
            border: '2px solid rgba(255, 255, 255, .4)',
        },
    }),
    option: (base: any, state: any) => ({
        ...base,
        background: state.isFocused ? 'rgba(255, 255, 255, .2)' : 'transparent',
        color: '#fff',
        cursor: 'pointer',
        '&:hover': {
            background: 'rgba(255, 255, 255, .3)',
        },
    }),
    menu: (base: any) => ({
        ...base,
        background: '#333',
        borderRadius: '10px',
        marginTop: '5px',
    }),
    singleValue: (base: any) => ({
        ...base,
        color: '#fff',
        textAlign: 'left', // Aligne le texte à gauche
    }),
    placeholder: (base: any) => ({
        ...base,
        color: '#fff',
        textAlign: 'left', // Aligne le texte à gauche
    }),
};

interface CustomSelectProps {
    options: { value: string; label: string }[];
    placeholder?: string;
    onChange: (selectedOption: SingleValue<{ value: string; label: string }>) => void;
}

const CustomSelect: React.FC<CustomSelectProps> = ({ options, placeholder = "Select an option", onChange }) => {
    return (
        <Select
            styles={customStyles}
            options={options}
            placeholder={placeholder}
            onChange={onChange}
        />
    );
};

export default CustomSelect;
