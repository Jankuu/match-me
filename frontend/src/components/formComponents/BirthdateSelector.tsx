import React, { useState, useEffect, useCallback } from 'react';
import { Form, Alert } from 'react-bootstrap';

interface BirthDateSelectorProps {
  birthDate: string;
  onChange: (value: string) => void;
  label?: string;
  required?: boolean;
  disabled?: boolean;
  onValidate?: (isValid: boolean) => void; // Callback for validation status
  minAge?: number;
  maxAge?: number;
}

const BirthDateSelector: React.FC<BirthDateSelectorProps> = ({
  birthDate,
  onChange,
  label = 'Birth Date',
  required = false,
  disabled = false,
  onValidate,
  minAge = 18,
  maxAge = 120
}) => {
  const [ageError, setAgeError] = useState<string | null>(null);

  // Effect to validate birth date whenever it changes
  useEffect(() => {
    let isValid = true;
    let errorMessage: string | null = null;

    if (birthDate) {
      const birth = new Date(birthDate);
      const today = new Date();
      let userAge = today.getFullYear() - birth.getFullYear();
      const monthDiff = today.getMonth() - birth.getMonth();

      // Adjust age if birth month/day hasn't occurred yet this year
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
        userAge--;
      }

      // Check if age is within the allowed range
      if (userAge < minAge || userAge > maxAge) {
        errorMessage = `You must be between ${minAge} and ${maxAge} years old.`;
        isValid = false;
      }
    } else if (required) {
      errorMessage = 'Birth date is required.';
      isValid = false;
    }

    setAgeError(errorMessage); // Update local error state

    // Call the parent's onValidate callback with the validation status.
    // Using setTimeout to defer the call and prevent potential synchronous state update issues
    // that might occur if a parent component updates its state directly based on this validation.
    if (onValidate) {
      setTimeout(() => {
          onValidate(isValid);
      }, 0);
    }
  }, [birthDate, required, onValidate, minAge, maxAge]); // Dependencies for useEffect

  // Memoized handler for date input changes
  const handleDateChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  }, [onChange]); // Dependency: onChange callback from parent

  return (
    <Form.Group controlId="formBirthDate" className="mb-3">
      <Form.Label>{label}</Form.Label>
      <Form.Control
        type="date"
        value={birthDate}
        onChange={handleDateChange}
        required={required}
        disabled={disabled}
        isInvalid={!!ageError} // Mark as invalid if there's an error
      />
      {ageError && <Form.Control.Feedback type="invalid">{ageError}</Form.Control.Feedback>}
    </Form.Group>
  );
};

export default React.memo(BirthDateSelector); // Memoize the component for performance