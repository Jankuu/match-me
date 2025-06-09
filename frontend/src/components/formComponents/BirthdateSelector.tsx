import React, { useState, useEffect, useCallback } from 'react'; // Import React, state, effect, and callback hooks
import { Form } from 'react-bootstrap'; // Import Form and Alert components from React-Bootstrap

/**
 * Defines the props for the BirthDateSelector component.
 * @property {string} birthDate - The current selected birth date in 'YYYY-MM-DD' format.
 * @property {(value: string) => void} onChange - Callback function to update the birth date in the parent component.
 * @property {string} [label='Birth Date'] - Optional label for the input field. Defaults to 'Birth Date'.
 * @property {boolean} [required=false] - Optional boolean indicating if the field is required. Defaults to false.
 * @property {boolean} [disabled=false] - Optional boolean to disable the input field. Defaults to false.
 * @property {(isValid: boolean) => void} [onValidate] - Optional callback to inform the parent about the validation status.
 * @property {number} [minAge=18] - Minimum allowed age. Defaults to 18.
 * @property {number} [maxAge=120] - Maximum allowed age. Defaults to 120.
 */
interface BirthDateSelectorProps {
  birthDate: string;
  onChange: (value: string) => void;
  label?: string;
  required?: boolean;
  disabled?: boolean;
  onValidate?: (isValid: boolean) => void;
  minAge?: number;
  maxAge?: number;
}

/**
 * BirthDateSelector component.
 * This component provides a date input field for selecting a birth date.
 * It includes client-side validation to ensure the user's age falls within a specified range.
 */
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
  // State to store any age-related error message. Null if no error.
  const [ageError, setAgeError] = useState<string | null>(null);

  /**
   * useEffect hook for validating the birth date whenever `birthDate`, `required`,
   * `onValidate`, `minAge`, or `maxAge` props change.
   */
  useEffect(() => {
    let isValid = true; // Assume valid initially
    let errorMessage: string | null = null; // No error message initially

    if (birthDate) {
      const birth = new Date(birthDate); // Convert birthDate string to Date object
      const today = new Date(); // Get current date
      let userAge = today.getFullYear() - birth.getFullYear(); // Calculate preliminary age

      const monthDiff = today.getMonth() - birth.getMonth();

      // Adjust age if the birth month/day hasn't occurred yet this year
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
        userAge--;
      }

      // Check if the calculated age is outside the allowed minimum or maximum age.
      if (userAge < minAge || userAge > maxAge) {
        errorMessage = `You must be between ${minAge} and ${maxAge} years old.`;
        isValid = false;
      }
    } else if (required) {
      // If no birth date is selected and the field is required, set an error.
      errorMessage = 'Birth date is required.';
      isValid = false;
    }

    setAgeError(errorMessage); // Update the component's local error state

    // If an `onValidate` callback is provided, call it to inform the parent component
    // about the current validation status.
    // Using setTimeout(..., 0) defers the call to the next tick of the event loop.
    // This can prevent potential issues where a parent component might try to
    // update its state synchronously based on this callback, which could lead to
    // render issues or warnings (e.g., "Cannot update a component while rendering a different component").
    if (onValidate) {
      setTimeout(() => {
          onValidate(isValid);
      }, 0);
    }
  }, [birthDate, required, onValidate, minAge, maxAge]); // Dependencies: Re-run effect when these values change

  /**
   * Memoized handler for the date input's onChange event.
   * `useCallback` ensures this function is stable across renders, which can help
   * prevent unnecessary re-renders of the <Form.Control> if it were memoized.
   */
  const handleDateChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value); // Call the parent's onChange prop with the new date value
  }, [onChange]); // Dependency: `onChange` callback from parent (stable reference)

  return (
    // Form group for the birth date input, providing Bootstrap styling and layout.
    <Form.Group controlId="formBirthDate" className="mb-3">
      <Form.Label>{label}</Form.Label> {/* Label for the date input */}
      <Form.Control
        type="date" // HTML5 date input type
        value={birthDate} // Binds the input's value to the `birthDate` prop
        onChange={handleDateChange} // Handles changes to the input field
        required={required} // Applies the HTML 'required' attribute if `required` prop is true
        disabled={disabled} // Disables the input field if `disabled` prop is true
        isInvalid={!!ageError} // Bootstrap prop: marks the input as invalid if `ageError` is not null/empty
      />
      {/* Conditionally renders Bootstrap's invalid feedback message if an ageError exists. */}
      {ageError && <Form.Control.Feedback type="invalid">{ageError}</Form.Control.Feedback>}
    </Form.Group>
  );
};

// `React.memo` is used to memoize the component, preventing unnecessary re-renders
// if its props (birthDate, onChange, label, etc.) have not shallowly changed.
export default React.memo(BirthDateSelector);