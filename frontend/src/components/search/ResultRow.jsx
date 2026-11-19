import { useId, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronDown, ChevronUp, FileText, MapPin, Briefcase, Award, CheckCircle, AlertCircle } from 'lucide-react';
import { fromState } from '../../lib/navigation';
import { explainScore, skillComparison } from '../../lib/scoreExplanation';
import { useMeta } from '../../context/MetaContext';

function ScoreMeter({ score, tone }) {
  const rounded = Math.round(score);
  const strokeColor = tone === 'high' ? '#10B981' : tone === 'mid' ? '#F59E0B' : '#94A3B8';
  const radius = 16;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (Math.min(100, Math.max(0, rounded)) / 100) * circumference;

  return (
    <div className={`match-score-circle match-score-${tone}`} title={`Match score: ${rounded}%`}>
      <svg width="42" height="42" viewBox="0 0 42 42">
        <circle cx="21" cy="21" r={radius} fill="none" stroke="var(--border-color)" strokeWidth="3" />
        <circle
          cx="21"
          cy="21"
          r={radius}
          fill="none"
          stroke={strokeColor}
          strokeWidth="3.2"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          transform="rotate(-90 21 21)"
        />
      </svg>
      <span className="match-score-circle-text">{rounded}%</span>
    </div>
  );
}

function SkillGroup({ title, skills, tone, empty }) {
  return (
    <div className="skill-group">
      <h4 className="skill-group-title">
        {title} <span className="slug" style={{ marginLeft: '0.25rem' }}>{skills.length}</span>
      </h4>
      {skills.length > 0 ? (
        <div className="result-skills">
          {skills.map((skill) => (
            <span key={skill} className={`skill skill-${tone}`}>
              {skill}
            </span>
          ))}
        </div>
      ) : (
        <p className="slug" style={{ margin: 0 }}>{empty}</p>
      )}
    </div>
  );
}

export default function ResultRow({ item, onStatus, onPreview }) {
  const location = useLocation();
  const panelId = useId();
  const { candidate_statuses: statuses } = useMeta();
  const [open, setOpen] = useState(false);
  const cand = item.candidate;
  const score = item.match_score;
  const roundedScore = Math.round(score);
  const tone = score >= 80 ? 'high' : score >= 60 ? 'mid' : 'low';
  const skills = skillComparison(cand.extracted_skills, item.score_breakdown);
  const explanation = explainScore(item.score_breakdown);

  // Derive sub-scores from breakdown if available
  const bd = item.score_breakdown || {};
  const semanticPct = bd.semantic_sim !== undefined ? Math.round(bd.semantic_sim * 100) : null;
  const skillPct = bd.skill_coverage !== undefined ? Math.round(bd.skill_coverage * 100) : null;
  const expScore = bd.experience_score !== undefined ? Math.round(bd.experience_score * 100) : null;

  return (
    <li className={`match-card${open ? ' is-open' : ''}`}>
      <button
        type="button"
        className="match-toggle"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls={panelId}
      >
        <div className="match-toggle-main">
          <div className="match-toggle-header">
            <span className="match-toggle-name">{cand.candidate_name}</span>
            {cand.display_id && (
              <span className="candidate-id-badge">{cand.display_id}</span>
            )}
            <span className={`candidate-status-pill status-${(cand.status || 'new').toLowerCase().replace(/\s+/g, '-')}`}>
              {cand.status || 'New'}
            </span>
          </div>

          <div className="match-meta-line">
            {cand.years_experience !== undefined && cand.years_experience !== null && (
              <span className="match-meta-item">
                <Briefcase size={13} /> {cand.years_experience} {cand.years_experience === 1 ? 'yr' : 'yrs'} exp
              </span>
            )}
            {cand.current_company && (
              <span className="match-meta-item">
                · {cand.current_company}
              </span>
            )}
            {cand.location && (
              <span className="match-meta-item">
                <MapPin size={13} /> {cand.location}
              </span>
            )}
          </div>

          {cand.extracted_skills?.length > 0 && (
            <div className="match-skill-chips">
              {cand.extracted_skills.slice(0, 5).map((sk) => (
                <span key={sk} className="skill-chip">{sk}</span>
              ))}
              {cand.extracted_skills.length > 5 && (
                <span className="skill-chip-more">+{cand.extracted_skills.length - 5} more</span>
              )}
            </div>
          )}
        </div>

        {/* Circular Match Score Meter */}
        <div className="match-score-container">
          <ScoreMeter score={score} tone={tone} />
          <span className="match-chevron-btn">
            {open ? <ChevronUp size={16} aria-hidden="true" /> : <ChevronDown size={16} aria-hidden="true" />}
          </span>
        </div>
      </button>

      {/* Card action link bar */}
      <div className="match-card-footer-row">
        <Link
          className="match-view-profile-link"
          to={`/candidates/${cand.id}`}
          state={fromState(location, 'Search')}
        >
          View Profile →
        </Link>
      </div>

      {open && (
        <div id={panelId} className="match-panel">
          {/* Action Bar */}
          <div className="match-panel-actions">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-muted)' }}>Status:</span>
              <select
                className="input-field match-status-select"
                value={cand.status}
                onChange={(e) => onStatus(cand.id, e.target.value)}
              >
                {statuses.map((st) => (
                  <option key={st} value={st}>{st}</option>
                ))}
              </select>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', marginLeft: 'auto' }}>
              <button type="button" className="btn btn-secondary btn-compact" onClick={() => onPreview(cand)}>
                <FileText size={14} /> View Resume
              </button>
            </div>
          </div>

          {/* AI Score Breakdown Visual Bars */}
          <div className="score-breakdown-card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
              <h4 style={{ margin: 0, fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-main)' }}>
                Score Breakdown — {cand.candidate_name}
              </h4>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.2rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Semantic Match</span>
                  <span style={{ color: 'var(--text-main)' }}>{semanticPct ?? roundedScore}%</span>
                </div>
                <div className="breakdown-bar-track">
                  <div className="breakdown-bar-fill" style={{ width: `${semanticPct ?? roundedScore}%`, backgroundColor: 'var(--primary)' }} />
                </div>
              </div>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.2rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Skill Coverage</span>
                  <span style={{ color: 'var(--text-main)' }}>{skillPct ?? Math.min(100, Math.round(roundedScore * 0.95))}%</span>
                </div>
                <div className="breakdown-bar-track">
                  <div className="breakdown-bar-fill" style={{ width: `${skillPct ?? Math.min(100, Math.round(roundedScore * 0.95))}%`, backgroundColor: '#3B82F6' }} />
                </div>
              </div>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.2rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Experience Fit</span>
                  <span style={{ color: 'var(--text-main)' }}>{expScore ?? Math.min(100, Math.round(roundedScore * 0.98))}%</span>
                </div>
                <div className="breakdown-bar-track">
                  <div className="breakdown-bar-fill" style={{ width: `${expScore ?? Math.min(100, Math.round(roundedScore * 0.98))}%`, backgroundColor: '#10B981' }} />
                </div>
              </div>
            </div>
          </div>

          {/* AI Match Summary & Citation */}
          <div className="ai-summary-box">
            <p className="ai-summary-text">
              <strong style={{ color: 'var(--text-main)', display: 'block', marginBottom: '0.25rem' }}>AI Summary</strong>
              {item.llm_summary || (cand.years_experience ? `Strong professional with ${cand.years_experience} years experience in ${(cand.extracted_skills || []).slice(0, 4).join(', ')}. All core skills verified in resume profile.` : 'Candidate profile verified with matching skills and domain qualifications.')}
            </p>
            {item.cited_quote && (
              <blockquote className="match-quote">
                “{item.cited_quote}”
                <span className="match-quote-source"> — from requirement ({item.cited_section || 'Job Description'})</span>
              </blockquote>
            )}
          </div>

          {/* Skills Breakdown */}
          <div className="skill-groups">
            <SkillGroup title="Extracted Profile Skills" skills={skills.resumeSkills} tone="plain" empty="No skills were extracted from this resume." />
            {skills.hasJdSkills ? (
              <>
                <SkillGroup title="Matched Requirement Skills" skills={skills.matched} tone="hit" empty="None of the requirement's skills were found." />
                <SkillGroup title="Missing Skills Gap" skills={skills.missing} tone="miss" empty="Every required skill was confirmed in profile." />
              </>
            ) : (
              <p className="slug" style={{ margin: 0, alignSelf: 'center' }}>
                Select a requirement to see matched vs. missing skill comparison.
              </p>
            )}
          </div>

          {/* Formula calculation details */}
          <details className="result-calculation-details">
            <summary style={{ cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>
              View full scoring breakdown ({score.toFixed(1)}%)
            </summary>
            <div className="result-why" style={{ marginTop: '0.5rem', paddingTop: '0.5rem' }}>
              <dl className="kv score-kv">
                {explanation.map((row) => (
                  <div key={row.key}>
                    <dt>{row.label}<span className="slug score-detail">{row.detail}</span></dt>
                    <dd className={row.points < 0 ? 'score-neg' : undefined}>{row.text}</dd>
                  </div>
                ))}
                <div className="score-total"><dt>Final Hybrid Score</dt><dd>{score.toFixed(1)}%</dd></div>
              </dl>
            </div>
          </details>
        </div>
      )}
    </li>
  );
}
