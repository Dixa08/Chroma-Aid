import { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';

export const useVoice = () => {
  const { userData } = useAppContext();
  const [voices, setVoices] = useState([]);
  
  useEffect(() => {
    const loadVoices = () => {
      setVoices(window.speechSynthesis.getVoices());
    };
    
    // Some browsers need this event to load voices
    window.speechSynthesis.onvoiceschanged = loadVoices;
    loadVoices();
    
    return () => {
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, []);

  const speak = (text) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel(); // stop previous
      const utterance = new SpeechSynthesisUtterance(text);
      
      const speed = userData?.voiceSettings?.speed || 1;
      utterance.rate = speed;
      
      if (userData?.voiceSettings?.voiceURI && voices.length > 0) {
        const selectedVoice = voices.find(v => v.voiceURI === userData.voiceSettings.voiceURI);
        if (selectedVoice) utterance.voice = selectedVoice;
      }
      
      window.speechSynthesis.speak(utterance);
    }
  };

  return { speak, voices };
};
