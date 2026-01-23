const SelectField = ({
  label,
  name,
  value,
  onChange,
  options = [],
  required = false,
}) => {
  return (
    <div className="mb-4">
      <label className="block mb-1 font-medium">
        {label} {required && <span className="text-red-500">*</span>}
      </label>

      <select
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        className="w-full border rounded px-3 py-2 bg-white
                   focus:outline-none focus:ring-2 focus:ring-emerald-500"
      >
        <option value="">-- Select Driver --</option>

        {options.map((item) => (
          <option key={item.id} value={item.id}>
            {item.name} (ID: {item.id})
          </option>
        ))}
      </select>
    </div>
  );
};

export default SelectField;
