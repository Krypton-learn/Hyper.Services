import React, { forwardRef, useId } from 'react';

export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'password' | 'number' | 'textarea' | 'select' | 'checkbox' | 'radio' | 'date' | 'tel' | 'url';
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  options?: { value: string; label: string }[];
  className?: string;
  helperText?: string;
  validation?: {
    minLength?: number;
    maxLength?: number;
    pattern?: string;
    min?: number;
    max?: number;
  };
}

export interface FormButton {
  type: 'submit' | 'reset' | 'button';
  label: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  className?: string;
  onClick?: () => void;
}

export interface FormProps {
  title?: string;
  description?: string;
  fields: FormField[];
  buttons: FormButton[];
  onSubmit?: (data: Record<string, unknown>) => void;
  className?: string;
  layout?: 'vertical' | 'horizontal';
  showLabels?: boolean;
  showPlaceholders?: boolean;
  initialValues?: Record<string, unknown>;
}

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  hasError?: boolean;
}

interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  hasError?: boolean;
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  hasError?: boolean;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', hasError, ...props }, ref) => {
    const baseClasses = 'w-full px-4 py-2.5 text-base border bg text-foreground placeholder:text-muted/60 focus:outline-none transition-all duration-200 rounded-lg';
    const errorClasses = hasError ? 'border-red-400 focus:border-red-400' : 'border-muted/40 focus:border-primary';
    const disabledClasses = props.disabled ? 'bg-muted/10 cursor-not-allowed opacity-50' : '';

    return (
      <input
        ref={ref}
        className={`${baseClasses} ${errorClasses} ${disabledClasses} ${className}`}
        {...props}
      />
    );
  }
);
Input.displayName = 'Input';

const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
  ({ className = '', hasError, ...props }, ref) => {
    const baseClasses = 'w-full px-4 py-2.5 text-base border bg text-foreground placeholder:text-muted/60 focus:outline-none transition-all duration-200 resize-none rounded-lg';
    const errorClasses = hasError ? 'border-red-400 focus:border-red-400' : 'border-muted/40 focus:border-primary';
    const disabledClasses = props.disabled ? 'bg-muted/10 cursor-not-allowed opacity-50' : '';

    return (
      <textarea
        ref={ref}
        className={`${baseClasses} ${errorClasses} ${disabledClasses} ${className}`}
        rows={3}
        {...props}
      />
    );
  }
);
TextArea.displayName = 'TextArea';

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className = '', hasError, children, ...props }, ref) => {
    const baseClasses = 'w-full px-4 py-2.5 text-base border bg text-foreground focus:outline-none transition-all duration-200 cursor-pointer rounded-lg';
    const errorClasses = hasError ? 'border-red-400 focus:border-red-400' : 'border-muted/40 focus:border-primary';
    const disabledClasses = props.disabled ? 'bg-muted/10 cursor-not-allowed opacity-50' : '';

    return (
      <select
        ref={ref}
        className={`${baseClasses} ${errorClasses} ${disabledClasses} ${className}`}
        {...props}
      >
        {children}
      </select>
    );
  }
);
Select.displayName = 'Select';

const getButtonClasses = (variant: FormButton['variant'] = 'primary', size: FormButton['size'] = 'md', _disabled?: boolean) => {
  const baseClasses = 'inline-flex items-center justify-center font-medium text-base transition-all duration-200 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed';

  const variants = {
    primary: 'bg-primary text-white hover:bg-primary/90',
    secondary: 'bg-secondary text-white hover:bg-secondary/90',
    outline: 'border border-primary text-primary hover:bg-primary/5',
    danger: 'bg-red-500 text-white hover:bg-red-600',
    ghost: 'text-muted hover:text-foreground hover:bg-muted/20',
  };

  const sizes = {
    sm: 'px-3 py-1.5',
    md: 'px-4 py-2',
    lg: 'px-5 py-2.5',
  };

  return `${baseClasses} ${variants[variant]} ${sizes[size]}`;
};

export const Form = forwardRef<HTMLFormElement, FormProps>(
  (
    {
      title,
      description,
      fields,
      buttons,
      onSubmit,
      className = '',
      layout = 'vertical',
      showLabels = true,
      showPlaceholders = true,
      initialValues = {},
    },
    ref
  ) => {
    const [formData, setFormData] = React.useState<Record<string, unknown>>(initialValues);
    const [errors, setErrors] = React.useState<Record<string, string>>({});
    const [touched, setTouched] = React.useState<Record<string, boolean>>({});
    const [showPassword, setShowPassword] = React.useState<Record<string, boolean>>({});

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const { name, value, type } = e.target;
      let finalValue: string | boolean = value;

      if (type === 'checkbox') {
        finalValue = (e.target as HTMLInputElement).checked;
      }

      setFormData((prev) => ({ ...prev, [name]: finalValue }));

      if (touched[name]) {
        validateField(name, finalValue);
      }
    };

    const handleBlur = (fieldName: string) => {
      setTouched((prev) => ({ ...prev, [fieldName]: true }));
      validateField(fieldName, formData[fieldName]);
    };

    const validateField = (name: string, value: unknown) => {
      const field = fields.find((f) => f.name === name);
      if (!field) return;

      let error = '';

      if (field.required && !value) {
        error = `${field.label} is required`;
      }

      if (value && field.validation) {
        if (field.validation.minLength && typeof value === 'string' && value.length < field.validation.minLength) {
          error = `${field.label} must be at least ${field.validation.minLength} characters`;
        }
        if (field.validation.maxLength && typeof value === 'string' && value.length > field.validation.maxLength) {
          error = `${field.label} must be at most ${field.validation.maxLength} characters`;
        }
        if (field.validation.pattern && typeof value === 'string') {
          const regex = new RegExp(field.validation.pattern);
          if (!regex.test(value)) {
            error = `${field.label} format is invalid`;
          }
        }
        if (field.validation.min !== undefined && typeof value === 'number' && value < field.validation.min) {
          error = `${field.label} must be at least ${field.validation.min}`;
        }
        if (field.validation.max !== undefined && typeof value === 'number' && value > field.validation.max) {
          error = `${field.label} must be at most ${field.validation.max}`;
        }
      }

      setErrors((prev) => ({ ...prev, [name]: error }));
      return error;
    };

    const togglePasswordVisibility = (fieldName: string) => {
      setShowPassword((prev) => ({ ...prev, [fieldName]: !prev[fieldName] }));
    };

    const validateAll = () => {
      const newErrors: Record<string, string> = {};
      let isValid = true;

      fields.forEach((field) => {
        const error = validateField(field.name, formData[field.name]);
        if (error) {
          newErrors[field.name] = error;
          isValid = false;
        }
      });

      setErrors(newErrors);
      return isValid;
    };

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();

      const allTouched: Record<string, boolean> = {};
      fields.forEach((field) => {
        allTouched[field.name] = true;
      });
      setTouched(allTouched);

      if (validateAll()) {
        onSubmit?.(formData);
      }
    };

    const handleReset = () => {
      setFormData(initialValues);
      setErrors({});
      setTouched({});
    };

    const renderField = (field: FormField) => {
      const uniqueId = useId();
      const error = errors[field.name];
      const isTouched = touched[field.name];
      const hasError = isTouched && !!error;

      const labelClassName = 'block text-base font-medium text-foreground/80';
      const errorClassName = 'mt-1.5 text-sm text-red-500';
      const helperClassName = 'mt-1.5 text-sm text-muted/70';

      const inputWrapperClass = layout === 'horizontal' ? 'flex items-center gap-4' : 'space-y-1';

      switch (field.type) {
        case 'textarea':
          return (
            <div key={field.name} className={layout === 'horizontal' ? inputWrapperClass : ''}>
              {showLabels && (
                <label htmlFor={uniqueId} className={layout === 'horizontal' ? 'w-32 shrink-0' : labelClassName}>
                  {field.label}
                  {field.required && <span className="text-red-500 ml-0.5"></span>}
                </label>
              )}
              <div className={layout === 'horizontal' ? 'flex-1' : ''}>
                <TextArea
                  id={uniqueId}
                  name={field.name}
                  placeholder={showPlaceholders ? field.placeholder : undefined}
                  required={field.required}
                  disabled={field.disabled}
                  value={formData[field.name] as string || ''}
                  onChange={handleChange}
                  onBlur={() => handleBlur(field.name)}
                  hasError={hasError}
                  className={field.className}
                />
                {hasError && <p className={errorClassName}>{error}</p>}
                {!hasError && field.helperText && <p className={helperClassName}>{field.helperText}</p>}
              </div>
            </div>
          );

        case 'select':
          return (
            <div key={field.name} className={layout === 'horizontal' ? inputWrapperClass : ''}>
              {showLabels && (
                <label htmlFor={uniqueId} className={layout === 'horizontal' ? 'w-32 shrink-0' : labelClassName}>
                  {field.label}
                  {field.required && <span className="text-red-500 ml-0.5"></span>}
                </label>
              )}
              <div className={layout === 'horizontal' ? 'flex-1' : ''}>
                <Select
                  id={uniqueId}
                  name={field.name}
                  required={field.required}
                  disabled={field.disabled}
                  value={formData[field.name] as string || ''}
                  onChange={handleChange}
                  onBlur={() => handleBlur(field.name)}
                  hasError={hasError}
                  className={field.className}
                >
                  <option value="">{field.placeholder || 'Select an option'}</option>
                  {field.options?.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Select>
                {hasError && <p className={errorClassName}>{error}</p>}
                {!hasError && field.helperText && <p className={helperClassName}>{field.helperText}</p>}
              </div>
            </div>
          );

        case 'checkbox':
          return (
            <div key={field.name} className={layout === 'horizontal' ? inputWrapperClass : ''}>
              <div className={layout === 'horizontal' ? 'flex-1' : ''}>
                <label className="flex items-center gap-2.5 cursor-pointer group">
                  <input
                    type="checkbox"
                    name={field.name}
                    required={field.required}
                    disabled={field.disabled}
                    checked={!!formData[field.name]}
                    onChange={handleChange}
                    className="w-4 h-4 rounded border-muted/50 text-primary focus:ring-0 focus:ring-offset-0 cursor-pointer"
                  />
                  <span className="text-sm text-foreground/80 group-hover:text-foreground transition-colors">
                    {field.label}
                    {field.required && <span className="text-red-500 ml-0.5"></span>}
                  </span>
                </label>
                {field.helperText && <p className={`${layout === 'horizontal' ? 'ml-6.5' : 'ml-6.5'} ${helperClassName}`}>{field.helperText}</p>}
              </div>
            </div>
          );

        case 'radio':
          return (
            <div key={field.name} className={layout === 'horizontal' ? inputWrapperClass : ''}>
              {showLabels && (
                <label className={layout === 'horizontal' ? 'w-32 shrink-0' : `${labelClassName} mb-0`}>
                  {field.label}
                  {field.required && <span className="text-red-500 ml-0.5"></span>}
                </label>
              )}
              <div className={layout === 'horizontal' ? 'flex-1' : ''}>
                <div className="space-y-2">
                  {field.options?.map((option) => (
                    <label key={option.value} className="flex items-center gap-2.5 cursor-pointer group">
                      <input
                        type="radio"
                        name={field.name}
                        value={option.value}
                        required={field.required}
                        disabled={field.disabled}
                        checked={formData[field.name] === option.value}
                        onChange={handleChange}
                        className="w-4 h-4 border-muted/50 text-primary focus:ring-0 focus:ring-offset-0 cursor-pointer"
                      />
                      <span className="text-sm text-foreground/80 group-hover:text-foreground transition-colors">
                        {option.label}
                      </span>
                    </label>
                  ))}
                </div>
                {hasError && <p className={errorClassName}>{error}</p>}
                {!hasError && field.helperText && <p className={helperClassName}>{field.helperText}</p>}
              </div>
            </div>
          );

        default:
          return (
            <div key={field.name} className={layout === 'horizontal' ? inputWrapperClass : ''}>
              {showLabels && (
                <label htmlFor={uniqueId} className={layout === 'horizontal' ? 'w-32 shrink-0' : labelClassName}>
                  {field.label}
                  {field.required && <span className="text-red-500 ml-0.5"></span>}
                </label>
              )}
              <div className={layout === 'horizontal' ? 'flex-1 relative' : 'relative'}>
                <Input
                  id={uniqueId}
                  name={field.name}
                  type={field.type === 'password' ? (showPassword[field.name] ? 'text' : 'password') : field.type}
                  placeholder={showPlaceholders ? field.placeholder : undefined}
                  required={field.required}
                  disabled={field.disabled}
                  value={formData[field.name] as string || ''}
                  onChange={handleChange}
                  onBlur={() => handleBlur(field.name)}
                  hasError={hasError}
                  className={field.type === 'password' ? 'pr-10' : field.className}
                  min={field.validation?.min}
                  max={field.validation?.max}
                  minLength={field.validation?.minLength}
                  maxLength={field.validation?.maxLength}
                  pattern={field.validation?.pattern}
                />
                {field.type === 'password' && (
                  <div className="absolute right-3 top-0 bottom-0 flex items-center">
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility(field.name)}
                      className="text-muted hover:text-foreground transition-colors"
                    >
                      {showPassword[field.name] ? (
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.72a3 3 0 1 1-4.24-4.24"></path>
                          <line x1="1" y1="1" x2="23" y2="23"></line>
                        </svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                          <circle cx="12" cy="12" r="3"></circle>
                        </svg>
                      )}
                    </button>
                  </div>
                )}
                {hasError && <p className={errorClassName}>{error}</p>}
                {!hasError && field.helperText && <p className={helperClassName}>{field.helperText}</p>}
              </div>
            </div>
          );
      }
    };

    const containerClass = layout === 'horizontal'
      ? 'flex flex-wrap gap-x-6 gap-y-5'
      : 'space-y-6';

    return (
      <form
        ref={ref}
        onSubmit={handleSubmit}
        className={`bg border border-muted/30 rounded-xl p-10 ${className}`}
      >
        {title && (
          <div className="mb-5">
            <h2 className="text-xl font-medium text-foreground">{title}</h2>
            {description && <p className="mt-1 text-sm text-muted/70">{description}</p>}
          </div>
        )}

        <div className={containerClass}>
          {fields.map(renderField)}
        </div>

        {buttons.length > 0 && (
          <div className="mt-5 pt-4 border-t border-muted/20 flex gap-2 w-full">
            {buttons.map((button, index) => (
              <button
                key={index}
                type={button.type}
                onClick={button.type === 'reset' ? handleReset : button.onClick}
                disabled={button.disabled}
                className={`${getButtonClasses(button.variant, button.size, button.disabled)} ${buttons.length > 1 ? 'flex-1' : ''}`}
              >
                {button.label}
              </button>
            ))}
          </div>
        )}
      </form>
    );
  }
);

Form.displayName = 'Form';

export default Form;
