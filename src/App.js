import React, { useState } from 'react';
import Header from './components/Header';
import Section from './components/Section';
import VideoModal from './components/VideoModal';
import KeyPlayersPage from './components/KeyPlayersPage';
import ErrorBoundary from './components/ErrorBoundary';
import useGoogleSheets from './hooks/useGoogleSheets';
import useKeyPlayers from './hooks/useKeyPlayers';
import config from './config.json';

function App() {
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [currentView, setCurrentView] = useState('hub'); // 'hub' or 'keyplayers'

  // Load hub data from Google Sheets
  const { data: sheetsData, loading, error } = useGoogleSheets(
    config.googleSheetId,
    config.googleSheetTab
  );

  // Load Key Players from Google Form responses
  const {
    keyPlayers,
    loading: keyPlayersLoading,
    error: keyPlayersError,
    refreshData,
    exportToCSV
  } = useKeyPlayers(config.googleSheetId, 'Form Responses 1');

  // Use Google Sheets data if available, otherwise use config.json
  const sections = sheetsData || config.sections;
  const useLocalConfig = !sheetsData && config.googleSheetId === 'TU_GOOGLE_SHEET_ID_AQUI';

  const handleVideoClick = (video) => {
    setSelectedVideo(video);
  };

  const handleCloseModal = () => {
    setSelectedVideo(null);
  };

  // Internal navigation
  const handleNavigate = (page) => {
    setCurrentView(page);
    window.scrollTo(0, 0);
  };

  const handleBackToHub = () => {
    setCurrentView('hub');
    window.scrollTo(0, 0);
  };

  if (loading && config.googleSheetId !== 'TU_GOOGLE_SHEET_ID_AQUI') {
    return (
      <div className="loading">
        <div className="spinner"></div>
        <p>Loading resources...</p>
      </div>
    );
  }

  // Render Key Players Page
  if (currentView === 'keyplayers') {
    return (
      <div className="app">
        <ErrorBoundary>
          <KeyPlayersPage
            onBack={handleBackToHub}
            keyPlayers={keyPlayers}
            loading={keyPlayersLoading}
            error={keyPlayersError}
            onRefresh={refreshData}
            onExport={exportToCSV}
          />
        </ErrorBoundary>
      </div>
    );
  }

  // Render Main Hub
  return (
    <div className="app">
      <Header
        title={config.siteTitle}
        subtitle={config.siteSubtitle}
        sections={sections}
      />

      <main className="main-container">
        {useLocalConfig && (
          <div className="config-info">
            <span className="config-info-icon">ℹ️</span>
            <p>
              Using local configuration (<code>config.json</code>).
              To use Google Sheets, update the <code>googleSheetId</code> in config.json
            </p>
          </div>
        )}

        {error && (
          <div className="config-info" style={{ background: '#fed7d7', borderColor: '#fc8181' }}>
            <span className="config-info-icon">⚠️</span>
            <p style={{ color: '#c53030' }}>
              Error loading Google Sheets: {error}. Using local configuration.
            </p>
          </div>
        )}

        {sections.map((section) => (
          <ErrorBoundary key={section.id}>
            <Section
              section={section}
              onVideoClick={handleVideoClick}
              onNavigate={handleNavigate}
            />
          </ErrorBoundary>
        ))}
      </main>

      <footer className="footer">
        <p>DM Hub v2.0 • Update links in <code>config.json</code> or Google Sheets</p>
      </footer>

      <VideoModal
        video={selectedVideo}
        onClose={handleCloseModal}
      />
    </div>
  );
}

export default App;