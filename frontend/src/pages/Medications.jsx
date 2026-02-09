import { useState, useEffect } from 'react';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Plus, Trash2, Edit2, Pill } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function Medications({ token }) {
  const [medications, setMedications] = useState([]);
  const [showDialog, setShowDialog] = useState(false);
  const [editingMed, setEditingMed] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    dosage: '',
    frequency: '',
    times: '',
    instructions: '',
  });

  useEffect(() => {
    fetchMedications();
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        times: formData.times.split(',').map((t) => t.trim()),
      };

      if (editingMed) {
        await axios.put(`${API}/medications/${editingMed.id}`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success('Medication updated successfully');
      } else {
        await axios.post(`${API}/medications`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success('Medication added successfully');
      }

      setShowDialog(false);
      setEditingMed(null);
      setFormData({ name: '', dosage: '', frequency: '', times: '', instructions: '' });
      fetchMedications();
    } catch (error) {
      toast.error('Error saving medication');
    }
  };

  const handleEdit = (med) => {
    setEditingMed(med);
    setFormData({
      name: med.name,
      dosage: med.dosage,
      frequency: med.frequency,
      times: med.times.join(', '),
      instructions: med.instructions || '',
    });
    setShowDialog(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this medication?')) {
      try {
        await axios.delete(`${API}/medications/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success('Medication deleted');
        fetchMedications();
      } catch (error) {
        toast.error('Error deleting medication');
      }
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl md:text-5xl font-bold font-lexend mb-2">Medications</h1>
          <p className="text-xl text-muted">Manage your medication schedule</p>
        </div>
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogTrigger asChild>
            <Button
              data-testid="btn-add-medication"
              onClick={() => {
                setEditingMed(null);
                setFormData({ name: '', dosage: '', frequency: '', times: '', instructions: '' });
              }}
              className="rounded-full font-bold text-lg h-14 px-8"
            >
              <Plus className="w-6 h-6 mr-2" />
              Add Medication
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold font-lexend">
                {editingMed ? 'Edit Medication' : 'Add New Medication'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-6 mt-4">
              <div>
                <Label htmlFor="name" className="text-lg font-medium mb-2 block">
                  Medication Name
                </Label>
                <Input
                  id="name"
                  data-testid="input-med-name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="h-14 text-lg"
                  required
                />
              </div>

              <div>
                <Label htmlFor="dosage" className="text-lg font-medium mb-2 block">
                  Dosage
                </Label>
                <Input
                  id="dosage"
                  data-testid="input-med-dosage"
                  value={formData.dosage}
                  onChange={(e) => setFormData({ ...formData, dosage: e.target.value })}
                  placeholder="e.g., 500mg, 2 tablets"
                  className="h-14 text-lg"
                  required
                />
              </div>

              <div>
                <Label htmlFor="frequency" className="text-lg font-medium mb-2 block">
                  Frequency
                </Label>
                <Input
                  id="frequency"
                  data-testid="input-med-frequency"
                  value={formData.frequency}
                  onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
                  placeholder="e.g., Twice daily, Every 8 hours"
                  className="h-14 text-lg"
                  required
                />
              </div>

              <div>
                <Label htmlFor="times" className="text-lg font-medium mb-2 block">
                  Times (comma-separated)
                </Label>
                <Input
                  id="times"
                  data-testid="input-med-times"
                  value={formData.times}
                  onChange={(e) => setFormData({ ...formData, times: e.target.value })}
                  placeholder="e.g., 08:00, 14:00, 20:00"
                  className="h-14 text-lg"
                  required
                />
              </div>

              <div>
                <Label htmlFor="instructions" className="text-lg font-medium mb-2 block">
                  Instructions (Optional)
                </Label>
                <Textarea
                  id="instructions"
                  data-testid="input-med-instructions"
                  value={formData.instructions}
                  onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                  placeholder="e.g., Take with food"
                  className="text-lg min-h-24"
                />
              </div>

              <Button
                type="submit"
                data-testid="btn-save-medication"
                className="w-full rounded-full font-bold text-lg h-14"
              >
                {editingMed ? 'Update Medication' : 'Add Medication'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {medications.length === 0 ? (
        <div className="text-center py-16">
          <Pill className="w-20 h-20 text-muted mx-auto mb-4" />
          <p className="text-xl text-muted">No medications added yet</p>
          <p className="text-lg text-muted mt-2">Click "Add Medication" to get started</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {medications.map((med) => (
            <div
              key={med.id}
              data-testid={`med-card-${med.id}`}
              className="bg-white border-2 border-border rounded-2xl shadow-sm hover:border-primary/50 transition-colors p-6"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Pill className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold font-lexend">{med.name}</h3>
                    <p className="text-lg text-muted">{med.dosage}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    data-testid={`btn-edit-${med.id}`}
                    onClick={() => handleEdit(med)}
                    className="w-10 h-10 rounded-full hover:bg-accent/20 flex items-center justify-center transition-colors"
                  >
                    <Edit2 className="w-5 h-5 text-accent" />
                  </button>
                  <button
                    data-testid={`btn-delete-${med.id}`}
                    onClick={() => handleDelete(med.id)}
                    className="w-10 h-10 rounded-full hover:bg-destructive/20 flex items-center justify-center transition-colors"
                  >
                    <Trash2 className="w-5 h-5 text-destructive" />
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-base font-semibold">Frequency:</span>
                  <span className="text-base text-muted">{med.frequency}</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-base font-semibold">Times:</span>
                  <span className="text-base text-muted">{med.times.join(', ')}</span>
                </div>
                {med.instructions && (
                  <div className="mt-3 p-3 bg-accent/10 rounded-xl">
                    <p className="text-base">{med.instructions}</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}