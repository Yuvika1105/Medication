import { useState, useEffect } from 'react';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Mic, Clock, Pill, Calendar, Droplet } from 'lucide-react';
import VoiceRecognition from '@/components/VoiceRecognition';
import { useNavigate } from 'react-router-dom';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function Dashboard({ token, user }) {
  const [medications, setMedications] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [todayTracker, setTodayTracker] = useState({ medications: [], water: 0, lunch: false });
  const [showVoice, setShowVoice] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchReminders();
    fetchTodayTracker();
  }, []);

  const fetchReminders = async () => {
    try {
      const response = await axios.get(`${API}/reminders`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMedications(response.data.medications || []);
      setAppointments(response.data.appointments || []);
    } catch (error) {
      console.error('Error fetching reminders:', error);
    }
  };

  const fetchTodayTracker = async () => {
    try {
      const response = await axios.get(`${API}/tracker/today`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTodayTracker(response.data);
    } catch (error) {
      console.error('Error fetching today tracker:', error);
    }
  };

  const getCurrentTime = () => {
    const now = new Date();
    return now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
  };

  const getUpcomingMedications = () => {
    const currentHour = new Date().getHours();
    return medications.filter((med) => {
      return med.times.some((time) => {
        const [hour] = time.split(':').map(Number);
        return hour >= currentHour;
      });
    }).slice(0, 3);
  };

  const upcomingMeds = getUpcomingMedications();

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      <div className="mb-8">
        <h1 className="text-4xl md:text-5xl font-bold font-lexend mb-2">Hello, {user?.name}!</h1>
        <p className="text-xl text-muted">Here's your health summary for today</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
        <div className="bg-white border-2 border-border rounded-2xl shadow-sm hover:border-primary/50 transition-colors p-6" data-testid="card-upcoming-meds">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Pill className="w-6 h-6 text-primary" />
            </div>
            <h2 className="text-2xl font-semibold font-lexend">Upcoming Medications</h2>
          </div>
          
          {upcomingMeds.length === 0 ? (
            <p className="text-lg text-muted">No upcoming medications for today</p>
          ) : (
            <div className="space-y-3">
              {upcomingMeds.map((med) => (
                <div key={med.id} className="flex items-start gap-3 p-3 bg-accent/10 rounded-xl" data-testid={`med-item-${med.id}`}>
                  <Clock className="w-5 h-5 text-accent mt-1" />
                  <div>
                    <p className="text-lg font-semibold">{med.name}</p>
                    <p className="text-base text-muted">{med.dosage} - {med.times.join(', ')}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          <Button
            data-testid="btn-view-all-meds"
            onClick={() => navigate('/medications')}
            className="w-full mt-4 rounded-full font-bold text-lg h-12"
            variant="outline"
          >
            View All Medications
          </Button>
        </div>

        <div className="bg-white border-2 border-border rounded-2xl shadow-sm hover:border-primary/50 transition-colors p-6" data-testid="card-appointments">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center">
              <Calendar className="w-6 h-6 text-secondary" />
            </div>
            <h2 className="text-2xl font-semibold font-lexend">Appointments</h2>
          </div>
          
          {appointments.length === 0 ? (
            <p className="text-lg text-muted">No upcoming appointments</p>
          ) : (
            <div className="space-y-3">
              {appointments.slice(0, 2).map((appt) => (
                <div key={appt.id} className="p-3 bg-secondary/10 rounded-xl" data-testid={`appt-item-${appt.id}`}>
                  <p className="text-lg font-semibold">Dr. {appt.doctor_name}</p>
                  <p className="text-base text-muted">{appt.date} at {appt.time}</p>
                  {appt.reason && <p className="text-base text-muted italic">{appt.reason}</p>}
                </div>
              ))}
            </div>
          )}
          
          <Button
            data-testid="btn-manage-appointments"
            onClick={() => navigate('/doctor')}
            className="w-full mt-4 rounded-full font-bold text-lg h-12"
            variant="outline"
          >
            Manage Appointments
          </Button>
        </div>
      </div>

      <div className="bg-white border-2 border-border rounded-2xl shadow-sm p-6 mb-8" data-testid="card-daily-progress">
        <h2 className="text-2xl font-semibold font-lexend mb-4">Today's Progress</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-4 bg-accent/10 rounded-xl">
            <Droplet className="w-10 h-10 text-accent mx-auto mb-2" />
            <p className="text-3xl font-bold font-lexend">{todayTracker.water}</p>
            <p className="text-lg text-muted">Glasses of Water</p>
          </div>
          
          <div className="text-center p-4 bg-secondary/10 rounded-xl">
            <Pill className="w-10 h-10 text-secondary mx-auto mb-2" />
            <p className="text-3xl font-bold font-lexend">{todayTracker.medications?.length || 0}</p>
            <p className="text-lg text-muted">Medications Tracked</p>
          </div>
          
          <div className="text-center p-4 bg-primary/10 rounded-xl">
            <Calendar className="w-10 h-10 text-primary mx-auto mb-2" />
            <p className="text-3xl font-bold font-lexend">{todayTracker.lunch ? 'Yes' : 'No'}</p>
            <p className="text-lg text-muted">Lunch Eaten</p>
          </div>
        </div>
        
        <Button
          data-testid="btn-update-tracker"
          onClick={() => navigate('/tracker')}
          className="w-full mt-6 rounded-full font-bold text-lg h-14"
        >
          Update Daily Tracker
        </Button>
      </div>

      <button
        data-testid="btn-voice-recognition"
        onClick={() => setShowVoice(true)}
        className="voice-button"
        aria-label="Voice Recognition"
      >
        <Mic className="w-8 h-8" />
      </button>

      {showVoice && (
        <VoiceRecognition
          token={token}
          medications={medications}
          onClose={() => {
            setShowVoice(false);
            fetchTodayTracker();
          }}
        />
      )}
    </div>
  );
}