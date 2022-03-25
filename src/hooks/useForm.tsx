import React, { useCallback, useState } from 'react';

export type FormError<T> = Partial<{ [key in keyof T]: string }>;

export type FormValidationHandler<T> = (data: T) => FormError<T>;

function useForm<T extends { _id?: string }>(
  initialValues: T,
  validateOnChange: boolean,
  validation: FormValidationHandler<T>,
) {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<FormError<T>>({});

  const handleInputBlur = useCallback<
    React.FocusEventHandler<HTMLTextAreaElement | HTMLInputElement>
  >(
    ({ target: { name, value } }) => {
      setValues((values) => {
        const index: keyof T = (name as unknown) as keyof T;
        values[index] = (value as unknown) as T[keyof T];
        return values;
      });
      if (validateOnChange) setErrors(validation(values));
    },
    [validateOnChange, validation, values],
  );

  const handleSwitchChange = useCallback<
    (event: React.ChangeEvent<HTMLInputElement>, checked: boolean) => void
  >(({ target: { name } }, checked) => {
    setValues((values) => {
      const index: keyof T = (name as unknown) as keyof T;
      values[index] = (checked as unknown) as T[keyof T];
      return values;
    });
  }, []);

  const handleSelectChange = useCallback<
    (
      event: React.ChangeEvent<{ name?: string; value: unknown }>,
      child: React.ReactNode,
    ) => void
  >(({ target: { name, value } }) => {
    setValues((values) => {
      const index: keyof T = (name as unknown) as keyof T;
      values[index] = (value as unknown) as T[keyof T];
      console.log('ETO VALUES', values)
      return { ...values };
    });
  }, []);

  const handleInputChange = useCallback<
    React.ChangeEventHandler<HTMLTextAreaElement | HTMLInputElement>
  >(
    ({ target: { name, value } }) => {
      setValues((values) => {
        const index: keyof T = (name as unknown) as keyof T;
        values[index] = (value as unknown) as T[keyof T];
        return { ...values };
      });
      if (validateOnChange) setErrors(validation(values));
    },
    [validateOnChange, validation, values],
  );

  const resetForm = useCallback(() => {
    setValues(initialValues);
    setErrors({});
  }, [initialValues]);

  const validate = useCallback(() => {
    setErrors(validation(values));
    const isValid = JSON.stringify(validation(values)) === '{}';
    return isValid;
  }, [validation, values]);

  return {
    values,
    setValues,
    errors,
    validate,
    handleSelectChange,
    handleInputChange,
    handleInputBlur,
    handleSwitchChange,
    resetForm,
  };
}

export default useForm;
