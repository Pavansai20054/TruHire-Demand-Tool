import { useState } from 'react';
import { Download, FileSpreadsheet, SlidersHorizontal } from 'lucide-react';
import useSearch from '../hooks/useSearch';
import SearchForm from '../components/search/SearchForm';
import SearchFilterSidebar from '../components/search/SearchFilterSidebar';
import ResultsPanel from '../components/search/ResultsPanel';
import CandidateLookup from '../components/search/CandidateLookup';
import Notice from '../components/ui/Notice';
import { COPY } from '../config/copy';
import ResumePreviewModal from '../components/ResumePreviewModal';
import '../components/requirements/requirements.css';
import '../components/search/search.css';

export default function SearchPage() {
  const s = useSearch();
  const [preview, setPreview] = useState(null);
  const [showFilters, setShowFilters] = useState(true);

  const resultsCount = s.results?.results?.length || 0;
  const totalMatches = s.results?.total_matches || 0;

  return (
    <div className="page-body page">
      <header className="page-head" style={{ alignItems: 'flex-start', marginBottom: '0.75rem' }}>
        <div>
          <h1 className="page-header-title" style={{ margin: 0, fontSize: '1.875rem', letterSpacing: '-0.02em' }}>
            Search Candidates
          </h1>
          <p style={{ margin: '0.25rem 0 0', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            Hybrid semantic vector & keyword search with AI fit scoring across the talent repository.
          </p>
        </div>
      </header>

      {/* Top Search Input & Filter Chips */}
      <SearchForm s={s} onToggleFilters={() => setShowFilters((v) => !v)} />

      {/* Actions & Results Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem', margin: '1rem 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button
            type="button"
            className={`btn ${showFilters ? 'btn-primary' : 'btn-secondary'} btn-compact`}
            onClick={() => setShowFilters((v) => !v)}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
          >
            <SlidersHorizontal size={14} /> Filter
          </button>
          <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-muted)' }}>
            {s.results ? `Showing ${resultsCount} of ${totalMatches} matches` : 'Ready to search'}
          </span>
        </div>

        <span className="cluster cluster-tight">
          <button
            type="button"
            className="btn btn-secondary btn-compact"
            onClick={() => s.exportCandidates('xlsx')}
            disabled={s.exporting !== null}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <FileSpreadsheet size={14} /> {s.exporting === 'xlsx' ? 'Exporting…' : 'Export Excel'}
          </button>
          <button
            type="button"
            className="btn btn-secondary btn-compact"
            onClick={() => s.exportCandidates('csv')}
            disabled={s.exporting !== null}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <Download size={14} /> {s.exporting === 'csv' ? 'Exporting…' : 'Export CSV'}
          </button>
        </span>
      </div>

      <CandidateLookup matches={s.candidateMatches} />
      {s.notice && (
        <div className="page-notice">
          <Notice type={s.notice === COPY.nothingToSearch ? 'warning' : 'info'}>{s.notice}</Notice>
        </div>
      )}

      {/* Main Two-Column Layout (Filters Sidebar + Candidate Results Grid) */}
      <div className={showFilters ? 'search-layout-two-column' : undefined}>
        {showFilters && <SearchFilterSidebar s={s} />}
        <div style={{ minWidth: 0 }}>
          <ResultsPanel s={s} onPreview={setPreview} />
        </div>
      </div>

      <ResumePreviewModal isOpen={!!preview} onClose={() => setPreview(null)} candidate={preview} />
    </div>
  );
}
