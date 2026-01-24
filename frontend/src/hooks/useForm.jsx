import { useState } from 'react';

/**
 * Custom hook for form handling
 * Manages form state, validation, and submission
 */
const useForm = (initialValues = {}, validate = null) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handle input change
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    setValues((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));

    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  // Handle input blur (mark as touched)
  const handleBlur = (e) => {
    const { name } = e.target;
    
    setTouched((prev) => ({
      ...prev,
      [name]: true,
    }));

    // Validate field on blur if validator exists
    if (validate) {
      const fieldErrors = validate({ [name]: values[name] });
      if (fieldErrors[name]) {
        setErrors((prev) => ({
          ...prev,
          [name]: fieldErrors[name],
        }));
      }
    }
  };

  // Set a specific field value
  const setFieldValue = (name, value) => {
    setValues((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Set a specific field error
  const setFieldError = (name, error) => {
    setErrors((prev) => ({
      ...prev,
      [name]: error,
    }));
  };

  // Set multiple field values
  const setFieldValues = (newValues) => {
    setValues((prev) => ({
      ...prev,
      ...newValues,
    }));
  };

  // Reset form to initial values
  const resetForm = () => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
    setIsSubmitting(false);
  };

  // Handle form submission
  const handleSubmit = async (e, onSubmit) => {
    e.preventDefault();
    
    // Mark all fields as touched
    const allTouched = Object.keys(values).reduce((acc, key) => {
      acc[key] = true;
      return acc;
    }, {});
    setTouched(allTouched);

    // Validate all fields
    if (validate) {
      const validationErrors = validate(values);
      
      if (Object.keys(validationErrors).length > 0) {
        setErrors(validationErrors);
        return;
      }
    }

    // Submit form
    setIsSubmitting(true);
    try {
      await onSubmit(values);
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Check if form is valid
  const isValid = () => {
    if (!validate) return true;
    const validationErrors = validate(values);
    return Object.keys(validationErrors).length === 0;
  };

  // Check if field has error and is touched
  const getFieldError = (name) => {
    return touched[name] && errors[name];
  };

  // Check if any field is dirty (changed from initial)
  const isDirty = () => {
    return JSON.stringify(values) !== JSON.stringify(initialValues);
  };

  return {
    values,
    errors,
    touched,
    isSubmitting,
    handleChange,
    handleBlur,
    handleSubmit,
    setFieldValue,
    setFieldError,
    setFieldValues,
    resetForm,
    isValid,
    getFieldError,
    isDirty,
  };
};

export default useForm;