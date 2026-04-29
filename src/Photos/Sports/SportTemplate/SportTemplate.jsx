import React, { forwardRef, useState, useRef } from 'react';
import './SportTemplate.css';
import { defaultSports, sportLibrary, useSportTemplates } from './defaultSports';

// Update defaultSports to include league property and correct team names
const updatedDefaultSports = defaultSports.map((sport, index) => ({
  ...sport,
  league: index < 20 ? 'premier-league' : index < 40 ? 'laliga' : index < 60 ? 'serie-a' : 'bundesliga',
  name: [
    // Premier League
    'Arsenal', 'Bournemouth', 'Brentford', 'Brighton', 'Burnley', 'Chelsea', 'Everton',
    'Fulham', 'Leeds', 'Liverpool', 'Man City', 'Man United', 'Newcastle', 'Nottingham Forest',
    'Crystal Palace', 'Tottenham', 'Sunderland', 'Aston Villa', 'West Ham', 'Wolves',
    // LaLiga
    'Alaves', 'Athletic Bilbao', 'Atletico Madrid', 'Barcelona', 'Celta Vigo', 'Elche', 'Espanyol',
    'Getafe', 'Girona', 'Levante', 'Osasuna', 'Rayo Vallecano', 'Real Betis', 'Real Madrid',
    'Real Mallorca', 'Real Oviedo', 'Real Sociedad', 'Sevilla', 'Valencia', 'Villarreal',
    // Serie A
    'Atalanta', 'AC Milan', 'Bologna', 'Cagliari', 'Como', 'Cremonese', 'Fiorentina', 'Genoa',
    'Inter Milan', 'Juventus', 'Lazio', 'Lecce', 'Napoli', 'Parma', 'Pisa', 'Roma',
    'Sassuolo', 'Torino', 'Udinese', 'Verona',
    // Bundesliga
    'Augsburg', 'Bayer Leverkusen', 'Bayern Munich', 'Borussia Dortmund', 'Borussia Mönchengladbach',
    'Eintracht Frankfurt', 'Köln', 'SC Freiburg', 'Hamburger SV', 'Heidenheim', 'Hoffenheim',
    'Mainz', 'RB Leipzig', 'FC St. Pauli', 'VfB Stuttgart', 'Union Berlin', 'Werder Bremen', 'Wolfsburg'
  ][index]
}));

export const SportTemplate = forwardRef(({ currentSport: initialSport, onClose, onSelect }, ref) => {
  const [showLibrary, setShowLibrary] = useState(false);
  const fileInputRef = useRef(null);
  const {
    currentSport,
    setCurrentSport,
    customSports,
    handleSportUpload,
    removeCustomSport,
    getPreviewStyle,
    allSports,
  } = useSportTemplates(initialSport);

  const selectFromLibrary = (sport) => {
    setCurrentSport(sport);
    setShowLibrary(false);
  };

  const handleApply = () => {
    if (currentSport) {
      onSelect(currentSport);
    }
    onClose();
  };

  const handleRemoveCustomSport = (id, e) => {
    e.stopPropagation();
    removeCustomSport(id);
  };

  const handleFileChange = (e) => {
    handleSportUpload(e);
    e.target.value = null;
  };

  // Group sports by league
  const groupedSports = updatedDefaultSports.reduce((acc, sport) => {
    const league = sport.league || 'Other';
    if (!acc[league]) acc[league] = [];
    acc[league].push(sport);
    return acc;
  }, {});

  if (showLibrary) {
    return (
      <div className="sport-container">
        <div className="sport-modal" ref={ref}>
          <div className="sport-modal-header">
            <button className="sport-back-button" onClick={() => setShowLibrary(false)}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>
            <div className="sport-modal-title">Teams</div>
          </div>
          <div className="sport-library-container">
            {Object.keys(groupedSports).map((league) => (
              <div key={league} className="sport-league-section">
                <h3 className="sport-league-title">
                  {league === 'premier-league' ? 'Premier League' : 
                   league === 'laliga' ? 'LaLiga' : 
                   league === 'serie-a' ? 'Serie A' : 
                   'Bundesliga'}
                </h3>
                <div className="sport-library-grid">
                  {groupedSports[league].map((sport) => (
                    <div
                      key={sport.id}
                      className={`sport-library-item ${currentSport?.id === sport.id ? 'sport-selected' : ''}`}
                      onClick={() => selectFromLibrary(sport)}
                      style={getPreviewStyle(sport)}
                    >
                      <div className="sport-library-item-name">{sport.name}</div>
                      {currentSport?.id === sport.id && (
                        <div className="sport-selection-check">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                            <path d="M20 6L9 17L4 12" stroke="white" strokeWidth="2" strokeLinecap="round" />
                          </svg>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="sport-container">
      <div className="sport-modal" ref={ref}>
        <div className="sport-modal-header">
          <button className="sport-back-button" onClick={onClose}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
          <div className="sport-modal-title">Team</div>
        </div>
        <div className="sport-preview-area">
          <div
            className="sport-preview-background"
            style={getPreviewStyle(currentSport || updatedDefaultSports[0])}
          >
            <div className="sport-text-preview"></div>
          </div>
        </div>
        <div className="sport-selection">
          <div className="sport-scroll">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              style={{ display: 'none' }}
            />
            <button className="sport-upload" onClick={() => fileInputRef.current.click()}>
              <div className="sport-upload-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M12 5V19M5 12H19" stroke="#007AFF" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </div>
              <div className="sport-upload-label">Upload</div>
            </button>
            <button className="sport-library-button" onClick={() => setShowLibrary(true)}>
              <div className="sport-library-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M4 6H20M4 10H20M4 14H20M4 18H20"
                    stroke="#007AFF"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
              <div className="sport-library-label">Teams</div>
            </button>
            {allSports.map((sport) => (
              <div
                key={sport.id}
                className={`sport-thumbnail ${currentSport?.id === sport.id ? 'sport-selected' : ''}`}
                onClick={() => setCurrentSport(sport)}
                style={getPreviewStyle(sport)}
              >
                {currentSport?.id === sport.id && (
                  <div className="sport-selection-check">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path d="M20 6L9 17L4 12" stroke="white" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                  </div>
                )}
                {sport.isCustom && (
                  <button
                    className="sport-remove-button"
                    onClick={(e) => handleRemoveCustomSport(sport.id, e)}
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                      <path d="M18 6L6 18M6 6L18 18" stroke="white" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
        <div className="sport-button-group">
          <button className="sport-apply-button" onClick={handleApply}>
            <svg width="20" height="20" viewBox="0 0 18 18" fill="none">
              <path
                d="M5 13l4 4L19 7"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Use
          </button>
        </div>
      </div>
    </div>
  );
});

SportTemplate.displayName = 'SportTemplate';