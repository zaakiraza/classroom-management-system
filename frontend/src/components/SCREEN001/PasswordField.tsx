import { useId, useState } from "react";

interface PasswordFieldProps {
  id?: string;
  label: string;
  name?: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  required?: boolean;
  autoComplete?: string;
  placeholder?: string;
  disabled?: boolean;
}

/** Secret input with a show/hide toggle (accessible name stays "Show"/"Hide" on purpose). */
export function PasswordField({
  id,
  label,
  name,
  value,
  onChange,
  error,
  required,
  autoComplete,
  placeholder,
  disabled,
}: PasswordFieldProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const [visible, setVisible] = useState(false);
  return (
    <div>
      <label htmlFor={inputId} className="block text-sm font-medium text-slate-700">
        {label}
      </label>
      <div className="relative mt-1">
        <input
          id={inputId}
          name={name ?? inputId}
          type={visible ? "text" : "password"}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          required={required}
          autoComplete={autoComplete}
          placeholder={placeholder}
          disabled={disabled}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${inputId}-error` : undefined}
          className={
            "block w-full rounded-md border-slate-300 pr-14 shadow-sm focus:border-teal-700 focus:ring-teal-700 disabled:cursor-not-allowed disabled:bg-slate-100 sm:text-sm " +
            (error ? "border-red-400 text-red-900 placeholder-red-300" : "")
          }
        />
        <button
          type="button"
          aria-pressed={visible}
          aria-label={visible ? "Hide" : "Show"}
          onClick={() => setVisible((current) => !current)}
          className="absolute inset-y-0 right-0 flex items-center px-3 text-sm font-medium text-slate-600 hover:text-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-700"
        >
          {visible ? "Hide" : "Show"}
        </button>
      </div>
      {error ? (
        <p id={`${inputId}-error`} className="mt-1 text-sm text-red-700">
          {error}
        </p>
      ) : null}
    </div>
  );
}
