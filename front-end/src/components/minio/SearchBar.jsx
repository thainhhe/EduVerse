import { useState } from 'react';
import { Search } from 'lucide-react';

const SearchBar = ({ onSearch }) => {
  const [query, setQuery] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(query);
    }
  };

  const handleChange = (e) => {
    setQuery(e.target.value);
    // Auto-search on empty to show all files
    if (e.target.value === '' && onSearch) {
      onSearch('');
    }
  };

  return (
    <form className="search-bar" onSubmit={handleSearch}>
      <Search size={20} className="search-icon" />
      <input
        type="text"
        placeholder="Search files..."
        value={query}
        onChange={handleChange}
        className="search-input"
      />
    </form>
  );
};

export default SearchBar;
