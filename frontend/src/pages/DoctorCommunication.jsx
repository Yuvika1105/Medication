import { useState, useEffect } from 'react';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { MessageSquare, Video, Calendar, Send } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function DoctorCommunication({ token }) {
  const [messages, setMessages] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [showDialog, setShowDialog] = useState(false);
  const [dialogType, setDialogType] = useState('');
  const [messageForm, setMessageForm] = useState({ doctor_name: '', message: '' });
  const [appointmentForm, setAppointmentForm] = useState({
    doctor_name: '',
    date: '',
    time: '',
    reason: '',
    type: 'consultation',
  });

  useEffect(() => {
    fetchMessages();
    fetchAppointments();
  }, []);

  const fetchMessages = async () => {
    try {
      const response = await axios.get(`${API}/messages`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessages(response.data);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const fetchAppointments = async () => {
    try {
      const response = await axios.get(`${API}/appointments`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAppointments(response.data);
    } catch (error) {
      console.error('Error fetching appointments:', error);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API}/messages`, messageForm, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success('Message sent to doctor');
      setMessageForm({ doctor_name: '', message: '' });
      setShowDialog(false);
      fetchMessages();
    } catch (error) {
      toast.error('Error sending message');
    }
  };

  const handleBookAppointment = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API}/appointments`, appointmentForm, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success('Appointment request sent');
      setAppointmentForm({
        doctor_name: '',
        date: '',
        time: '',
        reason: '',
        type: 'consultation',
      });
      setShowDialog(false);
      fetchAppointments();
    } catch (error) {
      toast.error('Error booking appointment');
    }
  };

  const openDialog = (type) => {
    setDialogType(type);
    setShowDialog(true);
  };

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      <div className="mb-8">
        <h1 className="text-4xl md:text-5xl font-bold font-lexend mb-2">Doctor Communication</h1>
        <p className="text-xl text-muted">Connect with your healthcare providers</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <button
          data-testid="btn-send-message"
          onClick={() => openDialog('message')}
          className="bg-white border-2 border-border rounded-2xl shadow-sm hover:border-primary/50 transition-all p-8 text-center group"
        >
          <div className="w-16 h-16 rounded-full bg-primary/10 group-hover:bg-primary/20 flex items-center justify-center mx-auto mb-4 transition-colors">
            <MessageSquare className="w-8 h-8 text-primary" />
          </div>
          <h3 className="text-2xl font-bold font-lexend mb-2">Send Message</h3>
          <p className="text-lg text-muted">Chat with your doctor</p>
        </button>

        <button
          data-testid="btn-video-call"
          onClick={() => openDialog('video')}
          className="bg-white border-2 border-border rounded-2xl shadow-sm hover:border-primary/50 transition-all p-8 text-center group"
        >
          <div className="w-16 h-16 rounded-full bg-secondary/10 group-hover:bg-secondary/20 flex items-center justify-center mx-auto mb-4 transition-colors">
            <Video className="w-8 h-8 text-secondary" />
          </div>
          <h3 className="text-2xl font-bold font-lexend mb-2">Video Call</h3>
          <p className="text-lg text-muted">Request consultation</p>
        </button>

        <button
          data-testid="btn-book-appointment"
          onClick={() => openDialog('appointment')}
          className="bg-white border-2 border-border rounded-2xl shadow-sm hover:border-primary/50 transition-all p-8 text-center group"
        >
          <div className="w-16 h-16 rounded-full bg-accent/10 group-hover:bg-accent/20 flex items-center justify-center mx-auto mb-4 transition-colors">
            <Calendar className="w-8 h-8 text-accent" />
          </div>
          <h3 className="text-2xl font-bold font-lexend mb-2">Book Appointment</h3>
          <p className="text-lg text-muted">Schedule a visit</p>
        </button>
      </div>

      <Tabs defaultValue="messages" className="w-full">
        <TabsList className="grid w-full grid-cols-2 h-14 mb-6">
          <TabsTrigger value="messages" data-testid="tab-messages" className="text-lg">
            Messages
          </TabsTrigger>
          <TabsTrigger value="appointments" data-testid="tab-appointments" className="text-lg">
            Appointments
          </TabsTrigger>
        </TabsList>

        <TabsContent value="messages" data-testid="messages-content">
          <div className="space-y-4">
            {messages.length === 0 ? (
              <div className="text-center py-12 bg-white border-2 border-border rounded-2xl">
                <MessageSquare className="w-16 h-16 text-muted mx-auto mb-4" />
                <p className="text-xl text-muted">No messages yet</p>
              </div>
            ) : (
              messages.map((msg) => (
                <div
                  key={msg.id}
                  data-testid={`message-${msg.id}`}
                  className="bg-white border-2 border-border rounded-2xl shadow-sm p-6"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <MessageSquare className="w-6 h-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xl font-semibold mb-1">Dr. {msg.doctor_name}</p>
                      <p className="text-lg mb-2">{msg.message}</p>
                      {msg.reply && (
                        <div className="mt-3 p-4 bg-secondary/10 rounded-xl">
                          <p className="text-base font-semibold mb-1">Reply:</p>
                          <p className="text-base">{msg.reply}</p>
                        </div>
                      )}
                      <p className="text-sm text-muted mt-2">
                        {new Date(msg.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="appointments" data-testid="appointments-content">
          <div className="space-y-4">
            {appointments.length === 0 ? (
              <div className="text-center py-12 bg-white border-2 border-border rounded-2xl">
                <Calendar className="w-16 h-16 text-muted mx-auto mb-4" />
                <p className="text-xl text-muted">No appointments scheduled</p>
              </div>
            ) : (
              appointments.map((appt) => (
                <div
                  key={appt.id}
                  data-testid={`appointment-${appt.id}`}
                  className="bg-white border-2 border-border rounded-2xl shadow-sm p-6"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0">
                      <Calendar className="w-6 h-6 text-accent" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xl font-semibold mb-1">Dr. {appt.doctor_name}</p>
                      <p className="text-lg text-muted mb-1">
                        {appt.date} at {appt.time}
                      </p>
                      <p className="text-lg mb-2">
                        <span className="font-semibold">Type:</span> {appt.type}
                      </p>
                      {appt.reason && (
                        <p className="text-base text-muted italic">{appt.reason}</p>
                      )}
                      <div className="mt-3">
                        <span
                          className={`inline-block px-4 py-2 rounded-full text-base font-semibold ${
                            appt.status === 'pending'
                              ? 'bg-accent/20 text-accent'
                              : appt.status === 'confirmed'
                              ? 'bg-secondary/20 text-secondary'
                              : 'bg-muted/20 text-muted'
                          }`}
                        >
                          {appt.status.toUpperCase()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold font-lexend">
              {dialogType === 'message'
                ? 'Send Message to Doctor'
                : dialogType === 'video'
                ? 'Request Video Consultation'
                : 'Book Appointment'}
            </DialogTitle>
          </DialogHeader>

          {dialogType === 'message' && (
            <form onSubmit={handleSendMessage} className="space-y-6 mt-4">
              <div>
                <Label htmlFor="doctor-name" className="text-lg font-medium mb-2 block">
                  Doctor's Name
                </Label>
                <Input
                  id="doctor-name"
                  data-testid="input-doctor-name"
                  value={messageForm.doctor_name}
                  onChange={(e) => setMessageForm({ ...messageForm, doctor_name: e.target.value })}
                  className="h-14 text-lg"
                  required
                />
              </div>
              <div>
                <Label htmlFor="message" className="text-lg font-medium mb-2 block">
                  Your Message
                </Label>
                <Textarea
                  id="message"
                  data-testid="input-message"
                  value={messageForm.message}
                  onChange={(e) => setMessageForm({ ...messageForm, message: e.target.value })}
                  className="text-lg min-h-32"
                  required
                />
              </div>
              <Button
                type="submit"
                data-testid="btn-submit-message"
                className="w-full rounded-full font-bold text-lg h-14"
              >
                <Send className="w-5 h-5 mr-2" />
                Send Message
              </Button>
            </form>
          )}

          {(dialogType === 'video' || dialogType === 'appointment') && (
            <form onSubmit={handleBookAppointment} className="space-y-6 mt-4">
              <div>
                <Label htmlFor="appt-doctor" className="text-lg font-medium mb-2 block">
                  Doctor's Name
                </Label>
                <Input
                  id="appt-doctor"
                  data-testid="input-appt-doctor"
                  value={appointmentForm.doctor_name}
                  onChange={(e) => setAppointmentForm({ ...appointmentForm, doctor_name: e.target.value })}
                  className="h-14 text-lg"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="appt-date" className="text-lg font-medium mb-2 block">
                    Date
                  </Label>
                  <Input
                    id="appt-date"
                    data-testid="input-appt-date"
                    type="date"
                    value={appointmentForm.date}
                    onChange={(e) => setAppointmentForm({ ...appointmentForm, date: e.target.value })}
                    className="h-14 text-lg"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="appt-time" className="text-lg font-medium mb-2 block">
                    Time
                  </Label>
                  <Input
                    id="appt-time"
                    data-testid="input-appt-time"
                    type="time"
                    value={appointmentForm.time}
                    onChange={(e) => setAppointmentForm({ ...appointmentForm, time: e.target.value })}
                    className="h-14 text-lg"
                    required
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="appt-type" className="text-lg font-medium mb-2 block">
                  Appointment Type
                </Label>
                <select
                  id="appt-type"
                  data-testid="select-appt-type"
                  value={appointmentForm.type}
                  onChange={(e) => setAppointmentForm({ ...appointmentForm, type: e.target.value })}
                  className="w-full h-14 text-lg px-4 rounded-xl border-2 border-input bg-white"
                  required
                >
                  <option value="consultation">Consultation</option>
                  <option value="video">Video Call</option>
                  <option value="emergency">Emergency</option>
                  <option value="follow-up">Follow-up</option>
                </select>
              </div>
              <div>
                <Label htmlFor="appt-reason" className="text-lg font-medium mb-2 block">
                  Reason (Optional)
                </Label>
                <Textarea
                  id="appt-reason"
                  data-testid="input-appt-reason"
                  value={appointmentForm.reason}
                  onChange={(e) => setAppointmentForm({ ...appointmentForm, reason: e.target.value })}
                  className="text-lg min-h-24"
                />
              </div>
              <Button
                type="submit"
                data-testid="btn-submit-appointment"
                className="w-full rounded-full font-bold text-lg h-14"
              >
                <Calendar className="w-5 h-5 mr-2" />
                Request Appointment
              </Button>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}