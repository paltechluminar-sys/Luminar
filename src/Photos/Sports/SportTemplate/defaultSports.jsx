import { useState, useEffect } from 'react';
// Premier League
import Arsenal from "../../../Assets/Sport/Arsenal.png";
// Updated imports with normalized paths like:
// import Arsenal from "../../../Assets/Sport/Arsenal.png";

// Premier League
import Bournemouth from "../../../Assets/Sport/Bournemouth.png";
import Brentford from "../../../Assets/Sport/Brentford.png";
import Brighton from "../../../Assets/Sport/Brighton.png";
import Burnley from "../../../Assets/Sport/Burnley.png";
import Chelsea from "../../../Assets/Sport/Chelsea.png";
import Everton from "../../../Assets/Sport/Everton.png";
import Fulham from "../../../Assets/Sport/Fulham.png";
import Leeds from "../../../Assets/Sport/Leeds.png";
import Liverpool from "../../../Assets/Sport/Liverpool.png";
import ManCity from "../../../Assets/Sport/ManCity.png";
import ManUtd from "../../../Assets/Sport/ManUtd.png";
import Newcastle from "../../../Assets/Sport/Newcastle.png";
import Forest from "../../../Assets/Sport/Forest.png";
import Palace from "../../../Assets/Sport/Palace.png";
import Spurs from "../../../Assets/Sport/Spurs.png";
import Sunderland from "../../../Assets/Sport/Sunderland.png";
import Villa from "../../../Assets/Sport/Villa.png";
import Westham from "../../../Assets/Sport/Westham.png";
import Wolves from "../../../Assets/Sport/Wolves.png";

// LaLiga
import Alaves from "../../../Assets/Laliga/Alaves.png";
import Athletic from "../../../Assets/Laliga/Athletic.png";
import AtleticoMadrid from "../../../Assets/Laliga/A.Madrid.png";
import Barcelona from "../../../Assets/Laliga/Barcelona.png";
import CeltaVigo from "../../../Assets/Laliga/Celta.png";
import Elche from "../../../Assets/Laliga/Elche.png";
import Espanyol from "../../../Assets/Laliga/Espanyol.png";
import Getafe from "../../../Assets/Laliga/Getafe.png";
import Girona from "../../../Assets/Laliga/Girona.png";
import Levante from "../../../Assets/Laliga/Levante.png";
import Osasuna from "../../../Assets/Laliga/Osasuna.png";
import RayoVallecano from "../../../Assets/Laliga/Rayo.png";
import RealBetis from "../../../Assets/Laliga/Betis.png";
import RealMadrid from "../../../Assets/Laliga/R.Madrid.png";
import RealMallorca from "../../../Assets/Laliga/Mallorca.png";
import RealOviedo from "../../../Assets/Laliga/Oviedo.png";
import RealSociedad from "../../../Assets/Laliga/Sociedad.png";
import Sevilla from "../../../Assets/Laliga/Sevilla.png";
import Valencia from "../../../Assets/Laliga/Valencia.png";
import Villarreal from "../../../Assets/Laliga/Villarreal.png";

// Serie A
import Atalanta from "../../../Assets/Serie A/Atalanta.png";
import Milan from "../../../Assets/Serie A/Milan.png";
import Bologna from "../../../Assets/Serie A/Bologna.png";
import Cagliari from "../../../Assets/Serie A/Cagliari.png";
import Como from "../../../Assets/Serie A/Como.png";
import Cremonese from "../../../Assets/Serie A/Cremonese.png";
import Fiorentina from "../../../Assets/Serie A/Fiorentina.png";
import Genoa from "../../../Assets/Serie A/Genoa.png";
import Inter from "../../../Assets/Serie A/Inter.png";
import Juventus from "../../../Assets/Serie A/Juventus.png";
import Lazio from "../../../Assets/Serie A/Lazio.png";
import Lecce from "../../../Assets/Serie A/Lecce.png";
import Napoli from "../../../Assets/Serie A/Napoli.png";
import Parma from "../../../Assets/Serie A/Parma.png";
import Pisa from "../../../Assets/Serie A/Pisa.png";
import Roma from "../../../Assets/Serie A/Roma.png";
import Sassuolo from "../../../Assets/Serie A/Sassuolo.png";
import Torino from "../../../Assets/Serie A/Torino.png";
import Udinese from "../../../Assets/Serie A/Udinese.png";
import Verona from "../../../Assets/Serie A/Verona.png";

// Bundesliga
import Augsburg from "../../../Assets/Bundesliga/Augsburg.png";
import Leverkusen from "../../../Assets/Bundesliga/Leverkusen.png";
import Bayern from "../../../Assets/Bundesliga/Bayern.png";
import Dortmund from "../../../Assets/Bundesliga/Dortmund.png";
import BorussiaM from "../../../Assets/Bundesliga/BorussiaM.png";
import Eintracht from "../../../Assets/Bundesliga/Eintracht.png";
import Koln from "../../../Assets/Bundesliga/Koln.png";
import Freiburg from "../../../Assets/Bundesliga/Freiburg.png";
import Hamburger from "../../../Assets/Bundesliga/Hamburger.png";
import Heidenheim from "../../../Assets/Bundesliga/Heidenheim.png";
import Hoffenheim from "../../../Assets/Bundesliga/Hoffenheim.png";
import Mainz from "../../../Assets/Bundesliga/Mainz.png";
import Leipzig from "../../../Assets/Bundesliga/Leipzig.png";
import Pauli from "../../../Assets/Bundesliga/Pauli.png";
import Stuttgart from "../../../Assets/Bundesliga/Stuttgart.png";
import Berlin from "../../../Assets/Bundesliga/Berlin.png";
import Werder from "../../../Assets/Bundesliga/Werder.png";
import Wolfsburg from "../../../Assets/Bundesliga/Wolfsburg.png";

// Create arrays of sport templates
const sports = [
  // Premier League
  Arsenal, Bournemouth, Brentford, Brighton, Burnley, Chelsea, Everton, 
  Fulham, Leeds, Liverpool, ManCity, ManUtd, Newcastle, Forest,
  Palace, Spurs, Sunderland, Villa, Westham, Wolves,
  // LaLiga
  Alaves, Athletic, AtleticoMadrid, Barcelona, CeltaVigo,
  Elche, Espanyol, Getafe, Girona, Levante, Osasuna, RayoVallecano, 
  RealBetis, RealMadrid, RealMallorca, RealOviedo, RealSociedad, Sevilla, Valencia, Villarreal,
  // Serie A
  Atalanta, Milan, Bologna, Cagliari, Como, Cremonese, Fiorentina, Genoa, Inter,
  Juventus, Lazio, Lecce, Napoli, Parma, Pisa, Roma, Sassuolo, Torino, Udinese, Verona,
  // Bundesliga
  Augsburg, Leverkusen, Bayern, Dortmund,BorussiaM, Eintracht, Koln, Freiburg,
  Hamburger, Heidenheim, Hoffenheim, Mainz, Leipzig, Pauli, Stuttgart, Berlin,
  Werder, Wolfsburg
];

export const defaultSports = sports.map((sport, index) => ({
  id: `local_sport${index + 1}`,
  value: `url(${sport})`,
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
  ][index],
  isDefault: true,
  league: index < 20 ? 'premier-league' : index < 40 ? 'laliga' : index < 60 ? 'serie-a' : 'bundesliga'
}));

export const sportLibrary = [...defaultSports];

export const useSportTemplates = (initialSport) => {
  const [customSports, setCustomSports] = useState([]);
  const [currentSport, setCurrentSport] = useState(() => {
    const savedSport = localStorage.getItem('chat_sport_template');
    if (savedSport) {
      try {
        const parsed = JSON.parse(savedSport);
        if (parsed?.id && parsed?.value) {
          return parsed;
        }
      } catch (e) {
        console.error('Failed to parse saved sport template', e);
      }
    }

    if (initialSport) {
      if (typeof initialSport === 'object') {
        return initialSport;
      } else {
        const found = [...defaultSports, ...JSON.parse(localStorage.getItem('custom_sports') || '[]')]
          .find(s => s.id === initialSport);
        if (found) return found;
      }
    }

    return defaultSports[0];
  });

  useEffect(() => {
    if (currentSport) {
      localStorage.setItem('chat_sport_template', JSON.stringify(currentSport));
    }
  }, [currentSport]);

  useEffect(() => {
    const savedSports = localStorage.getItem('custom_sports');
    if (savedSports) {
      try {
        setCustomSports(JSON.parse(savedSports));
      } catch (e) {
        console.error('Failed to parse saved sport templates', e);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('custom_sports', JSON.stringify(customSports));
  }, [customSports]);

  const handleSportUpload = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const newSport = {
          id: `custom_${Date.now()}`,
          value: event.target.result,
          name: file.name.replace(/\.[^/.]+$/, ""),
          isCustom: true,
          lastModified: Date.now(),
          league: 'custom'
        };

        setCustomSports(prev => [...prev, newSport]);
        setCurrentSport(newSport);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeCustomSport = (id) => {
    setCustomSports(prev => prev.filter(sport => sport.id !== id));
    if (currentSport?.id === id) {
      setCurrentSport(defaultSports[0]);
    }
  };

  const getPreviewStyle = (sport) => {
    if (!sport?.value) return { backgroundColor: '#ffffff' };

    if (typeof sport.value === 'string') {
      if (sport.value.startsWith('url(') || sport.value.startsWith('data:image')) {
        return {
          backgroundImage: sport.value.startsWith('url(') ?
            sport.value :
            `url(${sport.value})`,
          backgroundSize: 'contain',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        };
      } else if (sport.value.startsWith('#')) {
        return { backgroundColor: sport.value };
      }
    }
    return { backgroundColor: '#ffffff' };
  };

  const resetToDefault = () => {
    setCurrentSport(defaultSports[0]);
  };

  const allSports = [
    ...defaultSports,
    ...customSports.sort((a, b) => b.lastModified - a.lastModified)
  ];

  return {
    currentSport,
    setCurrentSport,
    customSports,
    defaultSports,
    handleSportUpload,
    removeCustomSport,
    getPreviewStyle,
    resetToDefault,
    allSports
  };
};