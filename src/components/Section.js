import React from 'react';
import Card from './Card';

function Section({ section, onVideoClick, onNavigate }) {
  const mainItems = section.items.filter(item => !item.parent);

  const sublinksByParent = section.items
    .filter(item => item.parent)
    .reduce((acc, item) => {
      if (!acc[item.parent]) acc[item.parent] = [];
      acc[item.parent].push(item);
      return acc;
    }, {});

  return (
    <div className="section" id={section.id}>
      <div className="section-header">
        <span className="section-icon">{section.icon}</span>
        <h2 className="section-title">{section.title}</h2>
      </div>
      <div className="cards-grid">
        {mainItems.map((item, index) => (
          <Card
            key={index}
            item={item}
            onVideoClick={onVideoClick}
            onNavigate={onNavigate}
            sublinks={sublinksByParent[item.title] || []}
          />
        ))}
      </div>
    </div>
  );
}

export default Section;
