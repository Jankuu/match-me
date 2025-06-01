import React from 'react';
import { Form } from 'react-bootstrap';

interface BirthDateSelectorProps {
  birthDate: string; // make it required (since both RegisterForm and ProfileForm track it)
  onChange: (value: string) => void; // not React.ChangeEvent<HTMLInputElement>
  label?: string;
  required?: boolean;
  disabled?: boolean;
}

const BirthDateSelector: React.FC<BirthDateSelectorProps> = ({
  birthDate,
  onChange,
  label = 'Birth Date',
  required = false,
  disabled = false
}) => {
  return (
    <Form.Group controlId="formBirthDate" className="mb-3">
      <Form.Label>{label}</Form.Label>
      <Form.Control
        type="date"
        value={birthDate}
        onChange={(e) => onChange(e.target.value)}
        // required={required}
        disabled={disabled}
      />
    </Form.Group>
  );
};

export default BirthDateSelector;
