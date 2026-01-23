const InputField = ({
  label,
  name,
  type = "text",
  value,
  onChange,
  required = false,
  placeholder = "",
  icon = null,
}) => {
  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-sm font-semibold text-gray-700">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}

      <div className="relative">
        {icon && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            {icon}
          </span>
        )}

        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          required={required}
          placeholder={placeholder}
          className={`w-full rounded-xl border 
            ${icon ? "pl-10" : "pl-3"} pr-3 py-2.5
            text-sm text-gray-700
            border-gray-300
            focus:outline-none focus:ring-2 focus:ring-emerald-500
            focus:border-emerald-500
            transition`}
        />
      </div>
    </div>
  );
};

export default InputField;
