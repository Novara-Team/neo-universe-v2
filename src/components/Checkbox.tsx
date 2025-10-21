import { Check } from 'lucide-react';

interface CheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: React.ReactNode;
  id?: string;
  className?: string;
  labelClassName?: string;
}

export default function Checkbox({
  checked,
  onChange,
  label,
  id,
  className = '',
  labelClassName = ''
}: CheckboxProps) {
  const handleChange = () => {
    onChange(!checked);
  };

  return (
    <label
      htmlFor={id}
      className={`flex items-center space-x-3 cursor-pointer group ${className}`}
    >
      <div className="relative">
        <input
          type="checkbox"
          id={id}
          checked={checked}
          onChange={handleChange}
          className="sr-only"
        />
        <div
          className={`
            w-5 h-5 rounded-md border-2 transition-all duration-200
            flex items-center justify-center
            ${checked
              ? 'bg-gradient-to-br from-cyan-500 to-blue-500 border-cyan-500 shadow-lg shadow-cyan-500/30'
              : 'bg-slate-700/50 border-slate-600 group-hover:border-cyan-500/50'
            }
          `}
        >
          {checked && (
            <Check className="w-3.5 h-3.5 text-white animate-in zoom-in-50 duration-200" />
          )}
        </div>
      </div>
      {label && (
        <span className={`text-sm text-slate-300 group-hover:text-cyan-400 transition-colors select-none ${labelClassName}`}>
          {label}
        </span>
      )}
    </label>
  );
}
