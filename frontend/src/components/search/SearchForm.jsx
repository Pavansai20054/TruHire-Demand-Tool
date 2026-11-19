import React from 'react';
import { Search, X } from 'lucide-react';
import './search.css';

export default function SearchForm({ s, onToggleFilters }) {
  const category = s.demands.find((d) => d.id === s.categoryId);

  return (
    <form className="search-form" onSubmit={(e) => { e.preventDefault(); s.run(); }} style={{ borderBottom: 'none', padding: '0.5rem 0 1rem' }}>
      {/* Top Search Bar */}
      <div className="search-bar">
        <label className="search-input">
          <Search size={18} aria-hidden="true" />
          <span className="sr-only">Keywords</span>
          <input
            type="text"
            value={s.query}
            onChange={(e) => s.setQuery(e.target.value)}
            placeholder="Search by skills, role, company or free text..."
          />
        </label>
        <button type="submit" className="btn btn-primary" disabled={s.loading} style={{ minWidth: '6.5rem' }}>
          {s.loading ? 'Searching…' : 'Search'}
        </button>
      </div>

      {/* Quick Filter Chips Row */}
      <div className="search-chips-row">
        {s.categoryId && category && (
          <span className="search-filter-chip">
            {category.name}
            <button type="button" onClick={() => s.selectCategory('')} aria-label={`Remove ${category.name} filter`}>
              <X size={13} />
            </button>
          </span>
        )}
        {s.minExp && (
          <span className="search-filter-chip">
            {s.minExp}+ years
            <button type="button" onClick={() => s.setMinExp('')} aria-label="Remove min experience filter">
              <X size={13} />
            </button>
          </span>
        )}
        {s.locations.map((loc) => (
          <span key={loc} className="search-filter-chip">
            {loc}
            <button type="button" onClick={() => s.setLocations(s.locations.filter((l) => l !== loc))} aria-label={`Remove ${loc} filter`}>
              <X size={13} />
            </button>
          </span>
        ))}
        {s.role && (
          <span className="search-filter-chip">
            {s.role}
            <button type="button" onClick={() => s.setRole('')} aria-label="Remove role filter">
              <X size={13} />
            </button>
          </span>
        )}
        <button
          type="button"
          className="search-filter-chip-add"
          onClick={onToggleFilters}
          title="Toggle search filters"
        >
          + Add filter
        </button>
      </div>
    </form>
  );
}
