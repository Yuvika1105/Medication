import { useState } from 'react';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Pill } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function Login({ onLogin }) {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    age: '',
    phone: '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const endpoint = isLogin ? '/auth/login' : '/auth/register';
      const payload = isLogin
        ? { email: formData.email, password: formData.password }
        : {
            name: formData.name,
            email: formData.email,
            password: formData.password,
            age: formData.age ? parseInt(formData.age) : null,
            phone: formData.phone,
          };

      const response = await axios.post(`${API}${endpoint}`, payload);
      const { token, email, name } = response.data;

      onLogin(token, { email, name });
      toast.success(isLogin ? 'Welcome back!' : 'Account created successfully!');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Pill className="w-12 h-12 text-primary" />
            <h1 className="text-4xl font-bold font-lexend text-primary">MedBuddy</h1>
          </div>
          <p className="text-xl text-muted">Your medication companion</p>
        </div>

        <div className="bg-white border-2 border-border rounded-2xl shadow-lg p-8">
          <h2 className="text-2xl font-bold font-lexend mb-6">
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            {!isLogin && (
              <div>
                <Label htmlFor="name" className="text-lg font-medium mb-2 block">
                  Full Name
                </Label>
                <Input
                  id="name"
                  data-testid="input-name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="h-14 text-lg"
                  required={!isLogin}
                />
              </div>
            )}

            <div>
              <Label htmlFor="email" className="text-lg font-medium mb-2 block">
                Email
              </Label>
              <Input
                id="email"
                data-testid="input-email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="h-14 text-lg"
                required
              />
            </div>

            <div>
              <Label htmlFor="password" className="text-lg font-medium mb-2 block">
                Password
              </Label>
              <Input
                id="password"
                data-testid="input-password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="h-14 text-lg"
                required
              />
            </div>

            {!isLogin && (
              <>
                <div>
                  <Label htmlFor="age" className="text-lg font-medium mb-2 block">
                    Age (Optional)
                  </Label>
                  <Input
                    id="age"
                    data-testid="input-age"
                    type="number"
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                    className="h-14 text-lg"
                  />
                </div>

                <div>
                  <Label htmlFor="phone" className="text-lg font-medium mb-2 block">
                    Phone (Optional)
                  </Label>
                  <Input
                    id="phone"
                    data-testid="input-phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="h-14 text-lg"
                  />
                </div>
              </>
            )}

            <Button
              type="submit"
              data-testid="btn-submit"
              className="w-full rounded-full font-bold text-lg h-14 px-8 shadow-md hover:shadow-lg transition-all active:scale-95"
              disabled={loading}
            >
              {loading ? 'Please wait...' : isLogin ? 'Sign In' : 'Create Account'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <button
              data-testid="btn-toggle-mode"
              onClick={() => setIsLogin(!isLogin)}
              className="text-lg text-primary hover:underline font-medium"
            >
              {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}