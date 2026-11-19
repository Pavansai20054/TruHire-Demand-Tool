import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  Users,
  FileText,
  Award,
  Layers,
  Calendar,
  Sparkles,
  TrendingUp,
  Briefcase,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import { analyticsApi, jdApi } from '../lib/api';

export default function AnalyticsPage() {
  const [data, setData] = useState(null);
  const [jds, setJds] = useState([]);
  const [selectedJdId, setSelectedJdId] = useState('');
  const [loading, setLoading] = useState(true);

  const loadAnalytics = async (jdId = '') => {
    try {
      const res = await analyticsApi.getOverview(jdId || null);
      setData(res.data);
    } catch (err) {
      console.error('Failed to load analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const init = async () => {
      try {
        const jdsRes = await jdApi.list();
        setJds(jdsRes.data);
      } catch (err) {
        console.error('Failed to load demands for analytics:', err);
      }
      loadAnalytics();
    };
    init();
  }, []);

  const handleJdFilterChange = (newJdId) => {
    setSelectedJdId(newJdId);
    loadAnalytics(newJdId);
  };

  if (loading) {
    return (
      <div className="page-body" style={{ textAlign: 'center', padding: '5rem 2rem' }}>
        <BarChart3 size={36} className="animate-spin" color="var(--primary)" style={{ margin: '0 auto 1.25rem' }} />
        <div style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-main)' }}>Aggregating Talent Pool Metrics…</div>
        <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>Computing hybrid score distributions and skill frequencies</div>
      </div>
    );
  }

  const summary = data?.summary || {};
  const statusFunnel = data?.status_funnel || {};
  const expDist = data?.experience_distribution || {};
  const scoreDist = data?.match_score_distribution || {};
  const topSkills = data?.top_skills || [];
  const timeline = data?.ingestion_timeline || [];

  const maxSkillCount = Math.max(...topSkills.map((s) => s.count), 1);
  const maxTimelineCount = Math.max(...timeline.map((t) => t.resumes_added), 1);
  const totalInFunnel = Object.values(statusFunnel).reduce((a, b) => a + b, 0) || 1;
  const totalInExp = Object.values(expDist).reduce((a, b) => a + b, 0) || 1;
  const totalInScores = Object.values(scoreDist).reduce((a, b) => a + b, 0) || 1;

  return (
    <div className="page-body page">
      {/* Header with Subtitle & Requirement Filter */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '1.25rem' }}>
        <div>
          <h1 className="page-header-title" style={{ margin: 0, fontSize: '1.875rem', letterSpacing: '-0.02em' }}>
            Talent Pool Analytics
          </h1>
          <p style={{ margin: '0.35rem 0 0', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            Real-time pipeline progression, skill distribution, and match quality across candidate records.
          </p>
        </div>

        {/* Filter by Requirement */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', background: 'var(--bg-surface)', padding: '0.35rem 0.6rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)' }}>
          <Briefcase size={15} color="var(--primary)" />
          <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-muted)' }}>
            Requirement:
          </span>
          <select
            value={selectedJdId}
            onChange={(e) => handleJdFilterChange(e.target.value)}
            className="input-field"
            style={{ width: 'auto', fontSize: '0.8125rem', padding: '0.35rem 0.6rem', border: 'none', background: 'transparent', fontWeight: 600, color: 'var(--text-main)', cursor: 'pointer' }}
          >
            <option value="">All Requirements (Aggregate)</option>
            {jds.map((jd) => (
              <option key={jd.id} value={jd.id}>
                {jd.display_id ? `${jd.display_id} · ` : ''}{jd.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Top 4 KPI Metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
        <div className="card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', background: 'var(--bg-surface)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-muted)' }}>Total Candidature</span>
            <span style={{ padding: '0.35rem', borderRadius: 'var(--radius-sm)', background: 'var(--primary-light)' }}>
              <Users size={16} color="var(--primary)" />
            </span>
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-main)', lineHeight: 1.1 }}>
            {summary.total_candidates?.toLocaleString() || 0}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-subtle)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <CheckCircle2 size={13} color="var(--success)" /> Indexed & searchable in pool
          </div>
        </div>

        <div className="card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', background: 'var(--bg-surface)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-muted)' }}>Open Requirements</span>
            <span style={{ padding: '0.35rem', borderRadius: 'var(--radius-sm)', background: 'var(--info-bg)' }}>
              <FileText size={16} color="var(--info)" />
            </span>
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-main)', lineHeight: 1.1 }}>
            {summary.total_job_descriptions || 0}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-subtle)' }}>
            Across active hiring practices
          </div>
        </div>

        <div className="card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', background: 'var(--bg-surface)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-muted)' }}>Avg. Match Score</span>
            <span style={{ padding: '0.35rem', borderRadius: 'var(--radius-sm)', background: 'var(--success-bg)' }}>
              <Award size={16} color="var(--success)" />
            </span>
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: summary.average_match_score >= 70 ? 'var(--success)' : 'var(--primary)', lineHeight: 1.1 }}>
            {summary.average_match_score ? `${summary.average_match_score}%` : 'N/A'}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-subtle)' }}>
            Across {summary.evaluated_matches_count || 0} evaluated pairings
          </div>
        </div>

        <div className="card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', background: 'var(--bg-surface)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-muted)' }}>Ingestion Batches</span>
            <span style={{ padding: '0.35rem', borderRadius: 'var(--radius-sm)', background: 'var(--bg-subtle)' }}>
              <Layers size={16} color="var(--text-muted)" />
            </span>
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-main)', lineHeight: 1.1 }}>
            {summary.total_batches || 0}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-subtle)' }}>
            {summary.total_duplicate_files || 0} duplicates screened & filtered
          </div>
        </div>
      </div>

      {/* Row 2: Top Skills + Pipeline Breakdown */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.25fr 1fr', gap: '1.75rem', marginBottom: '2rem' }}>
        {/* Top Skills Distribution */}
        <div className="card" style={{ padding: '1.5rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', background: 'var(--bg-surface)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>
              Top Skills in Talent Pool
            </h3>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>
              {topSkills.length} core proficiencies
            </span>
          </div>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: '1.5rem', marginTop: 0 }}>
            Frequency of technical competencies extracted from parsed resumes.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '380px', overflowY: 'auto', paddingRight: '0.25rem' }}>
            {topSkills.map((s, idx) => {
              const widthPct = Math.round((s.count / maxSkillCount) * 100);
              return (
                <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8125rem', fontWeight: 600 }}>
                    <span style={{ color: 'var(--text-main)' }}>{s.skill}</span>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', background: 'var(--bg-subtle)', padding: '0.15rem 0.45rem', borderRadius: 'var(--radius-sm)' }}>
                      {s.count} {s.count === 1 ? 'candidate' : 'candidates'}
                    </span>
                  </div>
                  <div style={{ width: '100%', height: '8px', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                    <div
                      style={{
                        width: `${Math.max(widthPct, 4)}%`,
                        height: '100%',
                        backgroundColor: 'var(--primary)',
                        borderRadius: 'var(--radius-full)',
                        transition: 'width 0.3s ease',
                      }}
                    />
                  </div>
                </div>
              );
            })}

            {topSkills.length === 0 && (
              <div style={{ textAlign: 'center', color: 'var(--text-subtle)', padding: '3rem 1rem' }}>
                No skill data available. Ingest resumes to populate the skill registry.
              </div>
            )}
          </div>
        </div>

        {/* Candidate Status Pipeline */}
        <div className="card" style={{ padding: '1.5rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', background: 'var(--bg-surface)' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-main)', margin: '0 0 0.35rem 0' }}>
            Candidate Status Breakdown
          </h3>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: '1.5rem', marginTop: 0 }}>
            Funnel progression and talent availability across the organization.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {[
              { label: 'New Ingests', key: 'New', color: 'var(--primary)', tag: 'Intake' },
              { label: 'Shortlisted', key: 'Shortlisted', color: 'var(--info)', tag: 'Screened' },
              { label: 'Interviewed', key: 'Interviewed', color: 'var(--warning)', tag: 'In Evaluation' },
              { label: 'Rejected', key: 'Rejected', color: 'var(--danger)', tag: 'Archived' },
              { label: 'Active Pool', key: 'Active', color: 'var(--success)', tag: 'Available' },
            ].map((stage) => {
              const count = statusFunnel[stage.key] || 0;
              const pct = totalInFunnel > 0 ? Math.round((count / totalInFunnel) * 100) : 0;
              return (
                <div key={stage.key} style={{ padding: '0.65rem 0.85rem', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-sm)', borderLeft: `3px solid ${stage.color}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ color: 'var(--text-main)' }}>{stage.label}</span>
                      <span style={{ fontSize: '0.6875rem', color: 'var(--text-subtle)', fontWeight: 500 }}>({stage.tag})</span>
                    </div>
                    <span style={{ color: 'var(--text-main)', fontWeight: 700 }}>
                      {count} <span style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--text-muted)' }}>({pct}%)</span>
                    </span>
                  </div>
                  <div style={{ width: '100%', height: '6px', background: 'var(--border-color)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                    <div
                      style={{
                        width: `${pct}%`,
                        height: '100%',
                        backgroundColor: stage.color,
                        borderRadius: 'var(--radius-full)',
                        transition: 'width 0.3s ease',
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Row 3: Match Score Tiers, Experience Distribution & Ingestion Timeline */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.75rem', marginBottom: '2rem' }}>
        {/* Match-Score Distribution */}
        <div className="card" style={{ padding: '1.5rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', background: 'var(--bg-surface)' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-main)', margin: '0 0 0.35rem 0' }}>
            Match Score Distribution
          </h3>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: '1.5rem', marginTop: 0 }}>
            Tiered breakdown of candidate suitability ratings.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {[
              { label: 'High Match (80%+)', key: '80%+', color: 'var(--success)', desc: 'Strong technical & requirement fit' },
              { label: 'Moderate Match (60–80%)', key: '60-80%', color: 'var(--warning)', desc: 'Meets core skills with minor gaps' },
              { label: 'Low Match (<60%)', key: '<60%', color: 'var(--text-subtle)', desc: 'Significant qualification mismatches' },
            ].map((tier) => {
              const count = scoreDist[tier.key] || 0;
              const pct = totalInScores > 0 ? Math.round((count / totalInScores) * 100) : 0;
              return (
                <div key={tier.key} style={{ padding: '0.85rem 1rem', backgroundColor: 'var(--bg-subtle)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                    <div>
                      <div style={{ fontSize: '0.875rem', fontWeight: 700, color: tier.color }}>{tier.label}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{tier.desc}</div>
                    </div>
                    <div style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--text-main)' }}>
                      {count} <span style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--text-muted)' }}>({pct}%)</span>
                    </div>
                  </div>
                  <div style={{ width: '100%', height: '6px', background: 'var(--border-color)', borderRadius: 'var(--radius-full)', overflow: 'hidden', marginTop: '0.5rem' }}>
                    <div
                      style={{
                        width: `${pct}%`,
                        height: '100%',
                        backgroundColor: tier.color,
                        borderRadius: 'var(--radius-full)',
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Experience Distribution */}
        <div className="card" style={{ padding: '1.5rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', background: 'var(--bg-surface)' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-main)', margin: '0 0 0.35rem 0' }}>
            Experience Distribution
          </h3>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: '1.5rem', marginTop: 0 }}>
            Seniority distribution across indexed candidate profiles.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
            {[
              { label: '0–2 Years', sub: 'Junior / Associate', key: '0-2 years', color: 'var(--info)' },
              { label: '3–5 Years', sub: 'Mid-Level Specialist', key: '3-5 years', color: 'var(--primary)' },
              { label: '5+ Years', sub: 'Senior / Lead / Architect', key: '5+ years', color: 'var(--success)' },
            ].map((tier) => {
              const count = expDist[tier.key] || 0;
              const pct = totalInExp > 0 ? Math.round((count / totalInExp) * 100) : 0;
              return (
                <div key={tier.key}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.35rem' }}>
                    <div>
                      <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-main)' }}>{tier.label}</span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-subtle)', marginLeft: '0.5rem' }}>({tier.sub})</span>
                    </div>
                    <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                      {count} ({pct}%)
                    </span>
                  </div>
                  <div style={{ width: '100%', height: '8px', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                    <div
                      style={{
                        width: `${pct}%`,
                        height: '100%',
                        backgroundColor: tier.color,
                        borderRadius: 'var(--radius-full)',
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Ingestion Activity Timeline */}
        <div className="card" style={{ padding: '1.5rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', background: 'var(--bg-surface)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>
              Ingestion Timeline
            </h3>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              <Calendar size={13} /> Last active days
            </span>
          </div>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: '1.5rem', marginTop: 0 }}>
            Daily resume volume indexed into the TruHire talent repository.
          </p>

          {timeline.length > 0 ? (
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.5rem', height: '160px', paddingTop: '1rem', borderBottom: '1px solid var(--border-color)' }}>
              {timeline.map((item, idx) => {
                const heightPct = Math.round((item.resumes_added / maxTimelineCount) * 100);
                const shortDate = item.date ? item.date.slice(5) : '';
                return (
                  <div key={idx} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end', gap: '0.35rem' }}>
                    <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)' }}>{item.resumes_added}</span>
                    <div
                      style={{
                        width: '100%',
                        maxWidth: '28px',
                        height: `${Math.max(heightPct, 8)}%`,
                        backgroundColor: 'var(--primary)',
                        borderRadius: '3px 3px 0 0',
                        transition: 'height 0.3s ease',
                      }}
                      title={`${item.date}: ${item.resumes_added} resumes`}
                    />
                    <span style={{ fontSize: '0.625rem', color: 'var(--text-subtle)', whiteSpace: 'nowrap' }}>{shortDate}</span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div style={{ textAlign: 'center', color: 'var(--text-subtle)', padding: '3rem 1rem' }}>
              No timeline data recorded yet. Uploaded resume batches will be tracked here.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
