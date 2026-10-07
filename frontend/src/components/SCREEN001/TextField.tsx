interface TextFieldProps {
  id: string;
  label: string;
  name?: string;
  type?: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  required?: boolean;
  autoComplete?: string;
  placeholder?: string;
  disabled?: boolean;
}

/** Labeled single-line input with inline validation copy. */
export function TextField({
  id,
  label,
  name,
  type = "text",
  value,
  onChange,
  error,
  required,
  autoComplete,
  placeholder,
  disabled,
}: TextFieldProps) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-slate-700">
        {label}
      </label>
      <input
        id={id}
        name={name ?? id}
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        required={required}
        autoComplete={autoComplete}
        placeholder={placeholder}
        disabled={disabled}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        className={
          "mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-teal-700 focus:ring-teal-700 disabled:cursor-not-allowed disabled:bg-slate-100 sm:text-sm " +
          (error ? "border-red-400 text-red-900 placeholder-red-300" : "")
        }
      />
      {error ? (
        <p id={`${id}-error`} className="mt-1 text-sm text-red-700">
          {error}
        </p>
      ) : null}
    </div>
  );
}
