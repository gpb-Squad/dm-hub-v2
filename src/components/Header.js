import React from 'react';

function Header({ title, sections = [] }) {
  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-logo">
          <img
            src={process.env.PUBLIC_URL + '/logo.png'}
            alt="AgileEngine"
            className="logo-img"
          />
          <span className="navbar-divider"></span>
          <span className="navbar-title">{title}</span>
        </div>
        <div className="navbar-links">
          {sections.map((section) => (
            <button
              key={section.id}
              className="navbar-link"
              onClick={() => scrollToSection(section.id)}
            >
              <span className="navbar-link-icon">{section.icon}</span>
              {section.title}
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
}

export default Header;
