import { useState } from 'react';

interface UseValidatedNumberInputProps {
    initialValue: string;
    min: number;
    max: number;
    maxLength?: number;
}

export const useValidatedNumberInput = ({ 
    initialValue, 
    min, 
    max, 
    maxLength 
}: UseValidatedNumberInputProps) => {
    const [value, setValue] = useState(initialValue);
    const [isFirstInputAfterFocus, setIsFirstInputAfterFocus] = useState(false);

    // Handle input change with validation
    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const inputValue = event.target.value;
        
        // If it's the first input after focus, replace the entire value
        if (isFirstInputAfterFocus) {
            setIsFirstInputAfterFocus(false);
            // Take only the last character entered
            const lastChar = inputValue.slice(-1);
            setValue(lastChar);
            return;
        }

        // If maxLength is specified and value exceeds it, take the last character entered
        if (maxLength && inputValue.length > maxLength) {
            const lastChar = inputValue.slice(-1);
            setValue(lastChar);
            return;
        }

        // Otherwise accept the entered value (including empty)
        setValue(inputValue);
    };

    // Handle focus event
    const handleFocus = (event: React.FocusEvent<HTMLInputElement>) => {
        setIsFirstInputAfterFocus(true);
    };

    // Handle blur event with validation
    const handleBlur = (event: React.FocusEvent<HTMLInputElement>) => {
        if (value === '') {
            setValue(min.toString());
            return;
        }

        const numValue = parseInt(value);
        if (!isNaN(numValue)) {
            const clampedValue = Math.max(min, Math.min(numValue, max));
            setValue(clampedValue.toString());
        } else {
            setValue(min.toString());
        }
    };

    return {
        value,
        setValue,
        handleChange,
        handleFocus,
        handleBlur
    };
};
