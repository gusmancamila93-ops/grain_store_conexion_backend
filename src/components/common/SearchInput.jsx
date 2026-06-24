function SearchInput({ value, onChange, placeholder = "Buscar..." }) {
  return (
    <label className="block">
      <span className="sr-only">{placeholder}</span>
      <input
        className="gs-input"
        onChange={onChange}
        placeholder={placeholder}
        type="search"
        value={value}
      />
    </label>
  );
}

export default SearchInput;
