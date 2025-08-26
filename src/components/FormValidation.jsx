import React from 'react';
import { ExclamationTriangleIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

export const ValidationMessage = ({ type, message, className = '' }) => {
    if (!message) return null;

    const baseClasses = "flex items-center space-x-2 text-sm mt-1";
    const typeClasses = {
        error: "text-red-600",
        success: "text-green-600",
        warning: "text-yellow-600",
        info: "text-blue-600"
    };

    const icons = {
        error: <ExclamationTriangleIcon className="w-4 h-4" />,
        success: <CheckCircleIcon className="w-4 h-4" />,
        warning: <ExclamationTriangleIcon className="w-4 h-4" />,
        info: <ExclamationTriangleIcon className="w-4 h-4" />
    };

    return (
        <div className={`${baseClasses} ${typeClasses[type]} ${className}`}>
            {icons[type]}
            <span>{message}</span>
        </div>
    );
};

export const FormField = ({ 
    label, 
    required = false, 
    error, 
    success, 
    warning, 
    info,
    children, 
    className = '',
    helpText 
}) => {
    return (
        <div className={`space-y-1 ${className}`}>
            {label && (
                <label className="block text-sm font-medium text-gray-700">
                    {label}
                    {required && <span className="text-red-500 ml-1">*</span>}
                </label>
            )}
            
            <div className="relative">
                {children}
            </div>
            
            {error && <ValidationMessage type="error" message={error} />}
            {success && <ValidationMessage type="success" message={success} />}
            {warning && <ValidationMessage type="warning" message={warning} />}
            {info && <ValidationMessage type="info" message={info} />}
            
            {helpText && !error && !success && !warning && !info && (
                <p className="text-xs text-gray-500">{helpText}</p>
            )}
        </div>
    );
};

export const InputField = ({ 
    type = 'text', 
    value, 
    onChange, 
    placeholder, 
    disabled = false,
    error,
    className = '',
    ...props 
}) => {
    const baseClasses = "w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors";
    const errorClasses = error ? "border-red-500 focus:ring-red-500" : "border-gray-300";
    const disabledClasses = disabled ? "bg-gray-50 text-gray-500 cursor-not-allowed" : "bg-white";

    return (
        <input
            type={type}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            disabled={disabled}
            className={`${baseClasses} ${errorClasses} ${disabledClasses} ${className}`}
            {...props}
        />
    );
};

export const SelectField = ({ 
    value, 
    onChange, 
    options = [], 
    placeholder = "Select an option...",
    disabled = false,
    error,
    className = '',
    ...props 
}) => {
    const baseClasses = "w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors";
    const errorClasses = error ? "border-red-500 focus:ring-red-500" : "border-gray-300";
    const disabledClasses = disabled ? "bg-gray-50 text-gray-500 cursor-not-allowed" : "bg-white";

    return (
        <select
            value={value}
            onChange={onChange}
            disabled={disabled}
            className={`${baseClasses} ${errorClasses} ${disabledClasses} ${className}`}
            {...props}
        >
            <option value="">{placeholder}</option>
            {options.map((option, index) => (
                <option key={option.value || index} value={option.value}>
                    {option.label}
                </option>
            ))}
        </select>
    );
};

export const TextAreaField = ({ 
    value, 
    onChange, 
    placeholder, 
    rows = 3,
    disabled = false,
    error,
    className = '',
    ...props 
}) => {
    const baseClasses = "w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-vertical";
    const errorClasses = error ? "border-red-500 focus:ring-red-500" : "border-gray-300";
    const disabledClasses = disabled ? "bg-gray-50 text-gray-500 cursor-not-allowed" : "bg-white";

    return (
        <textarea
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            rows={rows}
            disabled={disabled}
            className={`${baseClasses} ${errorClasses} ${disabledClasses} ${className}`}
            {...props}
        />
    );
};

export const CheckboxField = ({ 
    checked, 
    onChange, 
    label, 
    disabled = false,
    error,
    className = '',
    ...props 
}) => {
    return (
        <div className={`flex items-center space-x-2 ${className}`}>
            <input
                type="checkbox"
                checked={checked}
                onChange={onChange}
                disabled={disabled}
                className={`h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded ${
                    disabled ? 'cursor-not-allowed' : 'cursor-pointer'
                } ${error ? 'border-red-500' : ''}`}
                {...props}
            />
            {label && (
                <label className={`text-sm ${disabled ? 'text-gray-500' : 'text-gray-900'} ${
                    disabled ? 'cursor-not-allowed' : 'cursor-pointer'
                }`}>
                    {label}
                </label>
            )}
        </div>
    );
};

// Validation utilities
export const validators = {
    required: (value) => {
        if (!value || (typeof value === 'string' && !value.trim())) {
            return 'This field is required';
        }
        return null;
    },

    email: (value) => {
        if (!value) return null;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(value) ? null : 'Please enter a valid email address';
    },

    minLength: (min) => (value) => {
        if (!value) return null;
        return value.length >= min ? null : `Must be at least ${min} characters`;
    },

    maxLength: (max) => (value) => {
        if (!value) return null;
        return value.length <= max ? null : `Must be no more than ${max} characters`;
    },

    numeric: (value) => {
        if (!value) return null;
        return !isNaN(value) && !isNaN(parseFloat(value)) ? null : 'Must be a valid number';
    },

    positive: (value) => {
        if (!value) return null;
        const num = parseFloat(value);
        return num > 0 ? null : 'Must be a positive number';
    },

    range: (min, max) => (value) => {
        if (!value) return null;
        const num = parseFloat(value);
        if (isNaN(num)) return 'Must be a valid number';
        if (num < min || num > max) return `Must be between ${min} and ${max}`;
        return null;
    },

    pattern: (regex, message) => (value) => {
        if (!value) return null;
        return regex.test(value) ? null : message;
    }
};

// Form validation hook
export const useFormValidation = (initialValues, validationRules) => {
    const [values, setValues] = React.useState(initialValues);
    const [errors, setErrors] = React.useState({});
    const [touched, setTouched] = React.useState({});

    const validateField = (name, value) => {
        const rules = validationRules[name];
        if (!rules) return null;

        for (const rule of Array.isArray(rules) ? rules : [rules]) {
            const error = rule(value);
            if (error) return error;
        }
        return null;
    };

    const validateAll = () => {
        const newErrors = {};
        let isValid = true;

        Object.keys(validationRules).forEach(name => {
            const error = validateField(name, values[name]);
            if (error) {
                newErrors[name] = error;
                isValid = false;
            }
        });

        setErrors(newErrors);
        return isValid;
    };

    const setValue = (name, value) => {
        setValues(prev => ({ ...prev, [name]: value }));
        
        if (touched[name]) {
            const error = validateField(name, value);
            setErrors(prev => ({ ...prev, [name]: error }));
        }
    };

    const setFieldTouched = (name) => {
        setTouched(prev => ({ ...prev, [name]: true }));
        const error = validateField(name, values[name]);
        setErrors(prev => ({ ...prev, [name]: error }));
    };

    const reset = () => {
        setValues(initialValues);
        setErrors({});
        setTouched({});
    };

    return {
        values,
        errors,
        touched,
        setValue,
        setTouched: setFieldTouched,
        validateAll,
        reset,
        isValid: Object.keys(errors).length === 0
    };
};
