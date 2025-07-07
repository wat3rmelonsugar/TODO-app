export function Select({ value, onChange, options = [], className = "" }) {
    return (
      <select value={value} onChange={onChange} className={`border p-2 rounded-lg ${className}`}>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    );
  }
  