import React from 'react';
import { Minus, Plus } from 'lucide-react';
import { filterJdChoices, jdsInCategory } from '../../lib/categories';
import './search.css';

export default function SearchFilterSidebar({ s }) {
  const inCategory = jdsInCategory(s.jds, s.categoryId);
  const choices = filterJdChoices(inCategory, { text: s.query, positions: s.positions, selectedId: s.jdId });

  const currentExp = parseFloat(s.minExp) || 0;
  const handleDecrementExp = () => {
    const next = Math.max(0, currentExp - 1);
    s.setMinExp(next > 0 ? String(next) : '');
  };
  const handleIncrementExp = () => {
    s.setMinExp(String(currentExp + 1));
  };

  return (
    <aside className="search-filters-sidebar" aria-label="Candidate filters">
      <div className="search-filters-header">
        <h3 className="search-filters-title">Filters</h3>
        <button type="button" className="search-filters-clear-btn" onClick={s.reset}>
          Clear All
        </button>
      </div>

      {/* Category Dropdown */}
      <div className="sidebar-filter-field">
        <label htmlFor="search-filter-category" className="sidebar-filter-label">Category</label>
        <select
          id="search-filter-category"
          className="input-field"
          value={s.categoryId || ''}
          onChange={(e) => s.selectCategory(e.target.value)}
        >
          <option value="">All Practices</option>
          {s.demands.map((d) => (
            <option key={d.id} value={d.id}>{d.name}</option>
          ))}
        </select>
      </div>

      {/* Min Experience Stepper */}
      <div className="sidebar-filter-field">
        <label className="sidebar-filter-label">Min Experience</label>
        <div className="stepper-control">
          <button
            type="button"
            className="stepper-btn"
            onClick={handleDecrementExp}
            aria-label="Decrease min experience"
          >
            <Minus size={14} />
          </button>
          <span className="stepper-display">
            {currentExp > 0 ? `${currentExp} years` : 'Any exp'}
          </span>
          <button
            type="button"
            className="stepper-btn"
            onClick={handleIncrementExp}
            aria-label="Increase min experience"
          >
            <Plus size={14} />
          </button>
        </div>
      </div>

      {/* Location Input */}
      <div className="sidebar-filter-field">
        <label htmlFor="search-filter-location" className="sidebar-filter-label">Location</label>
        <input
          id="search-filter-location"
          type="text"
          className="input-field"
          value={s.locations[0] || ''}
          onChange={(e) => s.setLocations(e.target.value ? [e.target.value] : [])}
          placeholder="e.g. Bangalore, Pune"
        />
      </div>

      {/* Role Input */}
      <div className="sidebar-filter-field">
        <label htmlFor="search-filter-role" className="sidebar-filter-label">Role</label>
        <input
          id="search-filter-role"
          type="text"
          className="input-field"
          value={s.role}
          onChange={(e) => s.setRole(e.target.value)}
          placeholder="Any role"
        />
      </div>

      {/* Requirement / JD */}
      <div className="sidebar-filter-field">
        <label htmlFor="search-filter-jd" className="sidebar-filter-label">Requirement</label>
        <select
          id="search-filter-jd"
          className="input-field"
          value={s.jdId}
          onChange={(e) => s.selectJd(e.target.value)}
        >
          <option value="">— Any —</option>
          {choices.map((jd) => (
            <option key={jd.id} value={jd.id}>
              {jd.display_id ? `${jd.display_id} · ` : ''}{jd.title}
            </option>
          ))}
        </select>
      </div>

      {/* Results limit */}
      <div className="sidebar-filter-field">
        <label htmlFor="search-filter-topn" className="sidebar-filter-label">Results</label>
        <select
          id="search-filter-topn"
          className="input-field"
          value={s.topN}
          onChange={(e) => s.setTopN(Number(e.target.value))}
        >
          <option value="10">10</option>
          <option value="20">20</option>
          <option value="50">50</option>
          <option value="100">100</option>
        </select>
      </div>

      <div style={{ paddingTop: '0.5rem', borderTop: '1px dashed var(--border-color)' }}>
        <button
          type="button"
          className="btn btn-secondary btn-compact"
          style={{ width: '100%', justifyContent: 'center' }}
          onClick={s.reset}
        >
          Clear all filters
        </button>
      </div>
    </aside>
  );
}
