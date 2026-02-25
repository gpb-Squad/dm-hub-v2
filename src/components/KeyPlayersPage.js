import React, { useState } from 'react';

const GOOGLE_FORM_URL = 'https://docs.google.com/forms/d/16n7xuu9CXXp465wKwg1UQMysSSwlMcCM3IrG1vUQWVk/viewform';

/**
 * Parses an AI-generated summary into a narrative description and a list of skills.
 *
 * Expected formats:
 *   - "Narrative description\nSkill1, Skill2, Skill3"
 *   - "Skill1, Skill2, Skill3" (skills only)
 *   - "Narrative description only"
 *
 * A line is considered a "skills line" when it contains 2+ comma-separated
 * phrases, each with at most 4 words and no sentence-ending punctuation.
 */
function parseAISummary(raw) {
  if (!raw) return { narrative: '', skills: [] };

  const lines = raw.toString().split('\n').map(l => l.trim()).filter(Boolean);
  if (lines.length === 0) return { narrative: '', skills: [] };

  const isSkillsLine = (line) => {
    const parts = line.split(',').map(p => p.trim()).filter(Boolean);
    if (parts.length < 2) return false;
    // Skills are short phrases without sentence-ending punctuation
    return parts.every(p => p.split(/\s+/).length <= 4 && !/[.!?]$/.test(p));
  };

  let narrative = '';
  let skills = [];

  for (const line of lines) {
    if (isSkillsLine(line)) {
      skills = line.split(',').map(s => s.trim()).filter(Boolean);
    } else if (!narrative) {
      narrative = line;
    }
  }

  // Fallback: if no skills found and there are multiple lines, treat the last line as skills
  if (skills.length === 0 && lines.length > 1) {
    const lastLine = lines[lines.length - 1];
    skills = lastLine.split(',').map(s => s.trim()).filter(Boolean);
    if (!narrative) narrative = lines[0];
  }

  return { narrative, skills };
}

function CVCell({ cvLink }) {
  if (!cvLink) return <span className="no-cv">—</span>;
  return <a href={cvLink} target="_blank" rel="noopener noreferrer" className="btn-cv-link">📄 View CV</a>;
}

function SkillsCell({ player }) {
  if (!player.skillsSummary) {
    if (player.cvLink) return <span className="skills-pending">⏳ Processing...</span>;
    return <span className="no-cv">—</span>;
  }
  const { narrative, skills } = parseAISummary(player.skillsSummary);
  return (
    <div className="ai-summary-container">
      {narrative && <p className="ai-narrative" title={narrative}>{narrative}</p>}
      {skills.length > 0 && (
        <div className="skills-tags">
          {skills.slice(0, 6).map((s, i) => <span key={i} className="skill-tag">{s}</span>)}
          {skills.length > 6 && <span className="skill-tag skill-tag-more" title={skills.slice(6).join(', ')}>+{skills.length - 6} more</span>}
        </div>
      )}
    </div>
  );
}

function PlayerRow({ player }) {
  return (
    <tr>
      <td className="player-name">{player.name}</td>
      <td>{player.role || '-'}</td>
      <td><span className="stack-badge">{player.stack}</span></td>
      <td className="notes-cell" title={player.notes}>{player.notes || '-'}</td>
      <td className="cv-cell"><CVCell cvLink={player.cvLink} /></td>
      <td className="skills-cell"><SkillsCell player={player} /></td>
    </tr>
  );
}

function KeyPlayersPage({ onBack, keyPlayers, onRefresh, loading, error }) {
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleOpenForm = () => {
    window.open(GOOGLE_FORM_URL, '_blank');
    setMessage({ type: 'info', text: 'Form opened in a new tab. Click Refresh List after submitting to see your new entry.' });
  };

  const handleRefresh = () => {
    if (onRefresh) {
      onRefresh();
      setMessage({ type: 'success', text: 'Data refreshed!' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    }
  };

  return (
    <div className="keyplayers-page">
      <nav className="navbar">
        <div className="navbar-container">
          <div className="navbar-logo">
            <img src={process.env.PUBLIC_URL + '/logo.png'} alt="AgileEngine" className="logo-img" />
            <span className="navbar-divider"></span>
            <span className="navbar-title">Key Players Recommendations</span>
          </div>
          <div className="navbar-links">
            <button className="navbar-link" onClick={onBack}>Back to Hub</button>
          </div>
        </div>
      </nav>

      {message.text && (
        <div className={`message message-${message.type}`}>
          {message.type === 'success' ? '✓' : 'ℹ'} {message.text}
        </div>
      )}

      {error && <div className="message message-error">⚠ {error}</div>}

      <div className="keyplayers-content">
        <div className="keyplayers-list-section">
          <div className="list-header">
            <h2>Key Players List ({keyPlayers.length})</h2>
            <button className="btn-refresh" onClick={handleRefresh} disabled={loading}>
              {loading ? 'Loading...' : 'Refresh List'}
            </button>
          </div>

          {loading ? (
            <div className="empty-state"><p>Loading key players...</p></div>
          ) : keyPlayers.length === 0 ? (
            <div className="empty-state"><p>No key players found. Add your first recommendation using the Google Form.</p></div>
          ) : (
            <div className="keyplayers-table-container">
              <table className="keyplayers-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Role</th>
                    <th>Stack</th>
                    <th>Notes</th>
                    <th>CV</th>
                    <th>AI Skills Summary</th>
                  </tr>
                </thead>
                <tbody>
                  {keyPlayers.map((player) => <PlayerRow key={player.id} player={player} />)}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="keyplayers-form-section">
          <h2>Add New Key Player</h2>
          <div className="form-info">
            <p>Key Players are managed via Google Forms for easy collaboration and data persistence.</p>
            <p>Click the button below to open the form in a new tab. After submitting, click Refresh List to see your new entry.</p>
          </div>
          <button className="btn-open-form" onClick={handleOpenForm}>Open Google Form</button>
          <div className="form-tips">
            <h3>Quick Tips:</h3>
            <ul>
              <li><strong>Name:</strong> Full name of the candidate (required)</li>
              <li><strong>Role:</strong> Their current or target role</li>
              <li><strong>Stack:</strong> Primary technology expertise</li>
              <li><strong>Notes:</strong> Why you are recommending them</li>
              <li><strong>CV Link:</strong> Google Doc URL - AI will auto-extract skills</li>
            </ul>
          </div>
          <div className="form-actions">
            <button className="btn-refresh-secondary" onClick={handleRefresh} disabled={loading}>Refresh List</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default KeyPlayersPage;
