import { useState, useEffect } from 'react';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Droplet, Check, X, Pill, Utensils } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function DailyTracker({ token }) {
  const [medications, setMedications] = useState([]);
  const [todayTracker, setTodayTracker] = useState({ medications: [], water: 0, lunch: false });
  const [waterGlasses, setWaterGlasses] = useState(0);

  useEffect(() => {
    fetchMedications();
    fetchTodayTracker();
  }, []);

  const fetchMedications = async () => {
    try {
      const response = await axios.get(`${API}/medications`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMedications(response.data);
    } catch (error) {
      toast.error('Error loading medications');
    }
  };

  const fetchTodayTracker = async () => {
    try {
      const response = await axios.get(`${API}/tracker/today`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTodayTracker(response.data);
      setWaterGlasses(response.data.water || 0);
    } catch (error) {
      console.error('Error fetching today tracker:', error);
    }
  };

  const trackMedication = async (medId, taken) => {
    try {
      await axios.post(
        `${API}/tracker/medication`,
        {
          medication_id: medId,
          taken: taken,
          taken_at: taken ? new Date().toISOString() : null,
          missed: !taken,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(taken ? 'Medication marked as taken' : 'Medication marked as missed');
      fetchTodayTracker();
    } catch (error) {
      toast.error('Error tracking medication');
    }
  };

  const updateWater = async () => {
    try {
      await axios.post(`${API}/tracker/water`, { glasses: waterGlasses }, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      });
      toast.success('Water intake updated');
      fetchTodayTracker();
    } catch (error) {
      toast.error('Error updating water intake');
    }
  };

  const toggleLunch = async () => {
    try {
      const newLunchStatus = !todayTracker.lunch;
      await axios.post(`${API}/tracker/lunch`, { eaten: newLunchStatus }, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      });
      toast.success(newLunchStatus ? 'Lunch marked as eaten' : 'Lunch marked as not eaten');
      fetchTodayTracker();
    } catch (error) {
      toast.error('Error updating lunch status');
    }
  };

  const isMedTracked = (medId) => {
    return todayTracker.medications?.some((t) => t.medication_id === medId);
  };

  const getMedTracking = (medId) => {
    return todayTracker.medications?.find((t) => t.medication_id === medId);
  };

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      <div className="mb-8">
        <h1 className="text-4xl md:text-5xl font-bold font-lexend mb-2">Daily Tracker</h1>
        <p className="text-xl text-muted">Track your medications, water, and meals</p>
      </div>

      <div className="bg-white border-2 border-border rounded-2xl shadow-sm p-6 mb-8" data-testid="card-medications-tracker">
        <h2 className="text-2xl font-semibold font-lexend mb-6">Today's Medications</h2>
        {medications.length === 0 ? (
          <p className="text-lg text-muted">No medications to track</p>
        ) : (
          <div className="space-y-4">
            {medications.map((med) => {
              const tracking = getMedTracking(med.id);
              const isTracked = isMedTracked(med.id);
              return (
                <div
                  key={med.id}
                  data-testid={`tracker-med-${med.id}`}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    tracking?.taken
                      ? 'bg-success/10 border-success'
                      : tracking?.missed
                      ? 'bg-destructive/10 border-destructive'
                      : 'bg-muted/5 border-border'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Pill className="w-6 h-6 text-primary" />
                      <div>
                        <p className="text-xl font-semibold">{med.name}</p>
                        <p className="text-base text-muted">{med.dosage} - {med.times.join(', ')}</p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <Button
                        data-testid={`btn-taken-${med.id}`}
                        onClick={() => trackMedication(med.id, true)}
                        disabled={tracking?.taken}
                        className="rounded-full h-12 px-6 bg-secondary hover:bg-secondary/90"
                      >
                        <Check className="w-5 h-5 mr-2" />
                        Taken
                      </Button>
                      <Button
                        data-testid={`btn-missed-${med.id}`}
                        onClick={() => trackMedication(med.id, false)}
                        disabled={tracking?.missed}
                        variant="outline"
                        className="rounded-full h-12 px-6"
                      >
                        <X className="w-5 h-5 mr-2" />
                        Missed
                      </Button>
                    </div>
                  </div>
                  {tracking && (
                    <div className="mt-2 text-base text-muted">
                      {tracking.taken ? `Taken at ${new Date(tracking.taken_at).toLocaleTimeString()}` : 'Marked as missed'}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border-2 border-border rounded-2xl shadow-sm p-6" data-testid="card-water-tracker">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center">
              <Droplet className="w-6 h-6 text-accent" />
            </div>
            <h2 className="text-2xl font-semibold font-lexend">Water Intake</h2>
          </div>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <Button
                data-testid="btn-water-decrease"
                onClick={() => setWaterGlasses(Math.max(0, waterGlasses - 1))}
                variant="outline"
                className="rounded-full h-14 w-14 text-2xl"
              >
                -
              </Button>
              <div className="flex-1 text-center">
                <p className="text-5xl font-bold font-lexend">{waterGlasses}</p>
                <p className="text-lg text-muted">Glasses</p>
              </div>
              <Button
                data-testid="btn-water-increase"
                onClick={() => setWaterGlasses(waterGlasses + 1)}
                variant="outline"
                className="rounded-full h-14 w-14 text-2xl"
              >
                +
              </Button>
            </div>
            <Button
              data-testid="btn-update-water"
              onClick={updateWater}
              className="w-full rounded-full font-bold text-lg h-14"
            >
              Update Water Intake
            </Button>
          </div>
        </div>

        <div className="bg-white border-2 border-border rounded-2xl shadow-sm p-6" data-testid="card-lunch-tracker">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Utensils className="w-6 h-6 text-primary" />
            </div>
            <h2 className="text-2xl font-semibold font-lexend">Lunch</h2>
          </div>
          <div className="text-center py-8">
            <p className="text-5xl font-bold font-lexend mb-2">
              {todayTracker.lunch ? 'Yes' : 'No'}
            </p>
            <p className="text-lg text-muted mb-6">Have you eaten lunch today?</p>
            <Button
              data-testid="btn-toggle-lunch"
              onClick={toggleLunch}
              className={`rounded-full font-bold text-lg h-14 px-8 ${
                todayTracker.lunch ? 'bg-secondary hover:bg-secondary/90' : ''
              }`}
            >
              {todayTracker.lunch ? 'Mark as Not Eaten' : 'Mark as Eaten'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}