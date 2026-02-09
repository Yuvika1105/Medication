import { useState, useEffect } from 'react';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { LogOut, User as UserIcon, Save } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function Profile({ token, onLogout }) {
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    age: '',
    phone: '',
    diseases: [],
  });
  const [diseaseInput, setDiseaseInput] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await axios.get(`${API}/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProfile({
        ...response.data,
        age: response.data.age || '',
        phone: response.data.phone || '',
        diseases: response.data.diseases || [],
      });
    } catch (error) {
      toast.error('Error loading profile');
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.put(
        `${API}/profile`,
        {
          ...profile,
          age: profile.age ? parseInt(profile.age) : null,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error('Error updating profile');
    } finally {
      setLoading(false);
    }
  };

  const addDisease = () => {
    if (diseaseInput.trim()) {
      setProfile({
        ...profile,
        diseases: [...profile.diseases, diseaseInput.trim()],
      });
      setDiseaseInput('');
    }
  };

  const removeDisease = (index) => {
    setProfile({
      ...profile,
      diseases: profile.diseases.filter((_, i) => i !== index),
    });
  };

  return (
    <div className="max-w-3xl mx-auto px-6 py-8">
      <div className="mb-8">
        <h1 className="text-4xl md:text-5xl font-bold font-lexend mb-2">Profile</h1>
        <p className="text-xl text-muted">Manage your account information</p>
      </div>

      <div className="bg-white border-2 border-border rounded-2xl shadow-sm p-8 mb-6">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
            <UserIcon className="w-10 h-10 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-bold font-lexend">{profile.name}</h2>
            <p className="text-lg text-muted">{profile.email}</p>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          <div>
            <Label htmlFor="name" className="text-lg font-medium mb-2 block">
              Full Name
            </Label>
            <Input
              id="name"
              data-testid="input-profile-name"
              value={profile.name}
              onChange={(e) => setProfile({ ...profile, name: e.target.value })}
              className="h-14 text-lg"
              required
            />
          </div>

          <div>
            <Label htmlFor="email" className="text-lg font-medium mb-2 block">
              Email
            </Label>
            <Input
              id="email"
              data-testid="input-profile-email"
              value={profile.email}
              className="h-14 text-lg bg-muted/20"
              disabled
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="age" className="text-lg font-medium mb-2 block">
                Age
              </Label>
              <Input
                id="age"
                data-testid="input-profile-age"
                type="number"
                value={profile.age}
                onChange={(e) => setProfile({ ...profile, age: e.target.value })}
                className="h-14 text-lg"
              />
            </div>

            <div>
              <Label htmlFor="phone" className="text-lg font-medium mb-2 block">
                Phone
              </Label>
              <Input
                id="phone"
                data-testid="input-profile-phone"
                type="tel"
                value={profile.phone}
                onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                className="h-14 text-lg"
              />
            </div>
          </div>

          <div>
            <Label className="text-lg font-medium mb-2 block">Diagnosed Diseases</Label>
            <div className="flex gap-3 mb-3">
              <Input
                data-testid="input-disease"
                value={diseaseInput}
                onChange={(e) => setDiseaseInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addDisease())}
                placeholder="Enter a disease"
                className="h-14 text-lg"
              />
              <Button
                type="button"
                data-testid="btn-add-disease"
                onClick={addDisease}
                className="rounded-full h-14 px-6"
              >
                Add
              </Button>
            </div>
            {profile.diseases.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {profile.diseases.map((disease, index) => (
                  <div
                    key={index}
                    data-testid={`disease-${index}`}
                    className="px-4 py-2 bg-primary/10 rounded-full flex items-center gap-2"
                  >
                    <span className="text-base">{disease}</span>
                    <button
                      type="button"
                      data-testid={`btn-remove-disease-${index}`}
                      onClick={() => removeDisease(index)}
                      className="text-primary hover:text-destructive"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <Button
            type="submit"
            data-testid="btn-save-profile"
            disabled={loading}
            className="w-full rounded-full font-bold text-lg h-14"
          >
            <Save className="w-5 h-5 mr-2" />
            {loading ? 'Saving...' : 'Save Changes'}
          </Button>
        </form>
      </div>

      <Button
        data-testid="btn-logout"
        onClick={onLogout}
        variant="outline"
        className="w-full rounded-full font-bold text-lg h-14 border-2 border-destructive text-destructive hover:bg-destructive hover:text-white"
      >
        <LogOut className="w-5 h-5 mr-2" />
        Logout
      </Button>
    </div>
  );
}