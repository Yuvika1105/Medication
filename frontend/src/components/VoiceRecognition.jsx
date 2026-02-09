import { useState, useEffect } from 'react';
import { X, Mic } from 'lucide-react';
import { Button } from '@/components/ui/button';
import axios from 'axios';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function VoiceRecognition({ token, medications, onClose }) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [recognition, setRecognition] = useState(null);

  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognitionInstance = new SpeechRecognition();
      recognitionInstance.continuous = false;
      recognitionInstance.interimResults = false;
      recognitionInstance.lang = 'en-US';

      recognitionInstance.onresult = (event) => {
        const text = event.results[0][0].transcript.toLowerCase();
        setTranscript(text);
        processVoiceCommand(text);
      };

      recognitionInstance.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        toast.error('Error recognizing speech. Please try again.');
        setIsListening(false);
      };

      recognitionInstance.onend = () => {
        setIsListening(false);
      };

      setRecognition(recognitionInstance);
    } else {
      toast.error('Speech recognition is not supported in your browser.');
    }
  }, []);

  const startListening = () => {
    if (recognition) {
      setTranscript('');
      setIsListening(true);
      recognition.start();
    }
  };

  const stopListening = () => {
    if (recognition) {
      recognition.stop();
      setIsListening(false);
    }
  };

  const processVoiceCommand = async (text) => {
    try {
      if (text.includes('taken') || text.includes('take')) {
        const medName = text.replace(/taken|take|i|have|the|medicine|medication/gi, '').trim();
        const med = medications.find(m => m.name.toLowerCase().includes(medName));
        
        if (med) {
          await axios.post(
            `${API}/tracker/medication`,
            {
              medication_id: med.id,
              taken: true,
              taken_at: new Date().toISOString(),
              missed: false,
            },
            { headers: { Authorization: `Bearer ${token}` } }
          );
          toast.success(`${med.name} marked as taken!`);
        } else if (medName) {
          toast.error(`Medication "${medName}" not found in your list`);
        } else {
          toast.info('Please specify which medication you took');
        }
      } else if (text.includes('missed') || text.includes('skip')) {
        const medName = text.replace(/missed|skip|i|have|the|medicine|medication/gi, '').trim();
        const med = medications.find(m => m.name.toLowerCase().includes(medName));
        
        if (med) {
          await axios.post(
            `${API}/tracker/medication`,
            {
              medication_id: med.id,
              taken: false,
              missed: true,
            },
            { headers: { Authorization: `Bearer ${token}` } }
          );
          toast.warning(`${med.name} marked as missed`);
        } else {
          toast.info('Please specify which medication you missed');
        }
      } else if (text.includes('water')) {
        const glassMatch = text.match(/(\d+)/);
        const glasses = glassMatch ? parseInt(glassMatch[1]) : 1;
        await axios.post(
          `${API}/tracker/water`,
          glasses,
          { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }
        );
        toast.success(`${glasses} glass(es) of water recorded!`);
      } else if (text.includes('lunch') || text.includes('eat')) {
        await axios.post(
          `${API}/tracker/lunch`,
          true,
          { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }
        );
        toast.success('Lunch marked as eaten!');
      } else {
        toast.info('Command not recognized. Try saying: "taken [medicine name]", "water", or "lunch"');
      }
    } catch (error) {
      toast.error('Error processing command');
      console.error(error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-6 z-50" data-testid="voice-recognition-modal">
      <div className="bg-white rounded-2xl border-2 border-border shadow-2xl max-w-md w-full p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold font-lexend">Voice Command</h2>
          <button
            data-testid="btn-close-voice"
            onClick={onClose}
            className="w-10 h-10 rounded-full hover:bg-muted/20 flex items-center justify-center transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="text-center mb-6">
          <button
            data-testid="btn-toggle-listening"
            onClick={isListening ? stopListening : startListening}
            className={`w-32 h-32 rounded-full mx-auto flex items-center justify-center transition-all ${
              isListening
                ? 'bg-destructive animate-pulse'
                : 'bg-primary hover:bg-primary-hover'
            }`}
          >
            <Mic className="w-16 h-16 text-white" />
          </button>
          <p className="text-xl font-medium mt-4">
            {isListening ? 'Listening...' : 'Tap to speak'}
          </p>
        </div>

        {transcript && (
          <div className="bg-accent/10 rounded-xl p-4 mb-4">
            <p className="text-lg"><span className="font-semibold">You said:</span> "{transcript}"</p>
          </div>
        )}

        <div className="bg-muted/10 rounded-xl p-4">
          <p className="text-base font-semibold mb-2">Try saying:</p>
          <ul className="text-base space-y-1 text-muted">
            <li>• "Taken [medicine name]"</li>
            <li>• "Missed [medicine name]"</li>
            <li>• "Water" or "2 glasses of water"</li>
            <li>• "Lunch eaten"</li>
          </ul>
        </div>
      </div>
    </div>
  );
}