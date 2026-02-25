import React from 'react';

function Card({ item, onVideoClick, onNavigate, sublinks = [] }) {
  const hasSublinks = sublinks && sublinks.length > 0;

  if (item.type === 'keyplayers' || item.type === 'internal') {
    return (
      <div className="card card-internal" onClick={() => onNavigate && onNavigate(item.navigateTo || 'keyplayers')}>
        <div className="card-icon">{item.icon}</div>
        <div className="card-content"><div className="card-title">{item.title}</div><div className="card-type">📂 Internal Page</div></div>
        <span className="card-arrow">→</span>
      </div>
    );
  }

  if (item.type === 'video') {
    return (
      <div className="card video-card" onClick={() => onVideoClick(item)}>
        <div className="video-thumbnail" />
        <div className="card-content"><div className="card-title">{item.title}</div><div className="card-type">🎥 Video</div></div>
      </div>
    );
  }

  if (hasSublinks) {
    return (
      <div className="card-container">
        <a href={item.link} target="_blank" rel="noopener noreferrer" className="card has-sublinks">
          <div className="card-icon">{item.icon}</div>
          <div className="card-content"><div className="card-title">{item.title}</div><div className="card-type">🔗 Link + {sublinks.length} más</div></div>
          <span className="card-arrow">→</span>
        </a>
        <div className="sublinks-dropdown">
          {sublinks.map((s, i) => <a key={i} href={s.link} target="_blank" rel="noopener noreferrer" className="sublink"><span className="sublink-icon">{s.icon}</span><span className="sublink-title">{s.title}</span></a>)}
        </div>
      </div>
    );
  }

  return (
    <a href={item.link} target="_blank" rel="noopener noreferrer" className="card">
      <div className="card-icon">{item.icon}</div>
      <div className="card-content"><div className="card-title">{item.title}</div><div className="card-type">🔗 Link</div></div>
      <span className="card-arrow">→</span>
    </a>
  );
}
export default Card;
