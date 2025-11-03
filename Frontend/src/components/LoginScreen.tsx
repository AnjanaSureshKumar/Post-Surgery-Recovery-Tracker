import React, { useState } from 'react';
import { Card, CardHeader, CardContent, CardDescription, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Switch } from './ui/switch';
import { Stethoscope, User, Mail, Lock } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { apiLogin } from '../api/client';
import Pic from "../assets/Pic.jpeg";

interface LoginScreenProps {
  onLogin: (userData: any, role: 'patient' | 'doctor') => void;
}

export function LoginScreen({ onLogin }: LoginScreenProps) {
  const [isDoctor, setIsDoctor] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setError(null);
  setLoading(true);
  try {
    const resp = await apiLogin({ email, password });
    const { token, data } = resp;
    if (token) {
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(data)); // ✅ save user
      localStorage.setItem("role", isDoctor ? "doctor" : "patient"); // ✅ save role
    }
    const role: 'patient' | 'doctor' = isDoctor ? 'doctor' : 'patient';
    onLogin({ ...data, role }, role);
  } catch (err: any) {
    setError(err?.message || 'Invalid email or password');
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-green-50 to-blue-50 p-4">
      <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-8 items-center">
        {/* Hero Section */}
        <div className="hidden lg:flex flex-col items-center justify-center space-y-6 p-8">
          <div className="w-full max-w-md">
            <ImageWithFallback
              src={Pic}
              alt="Healthcare illustration"
              className="w-full h-auto rounded-3xl shadow-lg"
            />
          </div>
          <div className="text-center space-y-4">
            <h1 className="text-4xl text-gray-800">Recovery Tracker</h1>
            <p className="text-lg text-gray-600 max-w-md">
              Your comprehensive post-surgery recovery companion. Track progress, connect with your healthcare team, and achieve better outcomes.
            </p>
          </div>
        </div>

        {/* Login Form */}
        <div className="flex flex-col items-center justify-center p-4">
          <Card className="w-full max-w-md shadow-xl border-0 rounded-3xl">
            <CardHeader className="space-y-4 pb-6">
              <div className="flex items-center justify-center w-16 h-16 bg-primary/10 rounded-2xl mx-auto">
                {isDoctor ? (
                  <Stethoscope className="w-8 h-8 text-primary" />
                ) : (
                  <User className="w-8 h-8 text-primary" />
                )}
              </div>
              <div className="text-center space-y-2">
                <CardTitle className="text-2xl">Welcome Back</CardTitle>
                <CardDescription className="text-base">
                  Sign in to your {isDoctor ? 'doctor' : 'patient'} account
                </CardDescription>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Doctor Toggle */}
              <div className="flex items-center justify-between p-4 bg-muted rounded-2xl">
                <Label htmlFor="doctor-mode" className="flex items-center space-x-2">
                  <User className="w-4 h-4" />
                  <span>Patient</span>
                </Label>
                <Switch
                  id="doctor-mode"
                  checked={isDoctor}
                  onCheckedChange={setIsDoctor}
                />
                <Label htmlFor="doctor-mode" className="flex items-center space-x-2">
                  <Stethoscope className="w-4 h-4" />
                  <span>Doctor</span>
                </Label>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                    <Input
                      id="email"
                      type="email"
                      placeholder={isDoctor ? "doctor@hospital.com" : "patient@email.com"}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10 rounded-xl border-gray-200"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10 rounded-xl border-gray-200"
                      required
                    />
                  </div>
                </div>

                {error && <p className="text-sm text-red-600">{error}</p>}

                <Button 
                  type="submit" 
                  className="w-full rounded-xl h-12 bg-gradient-to-r from-primary to-green-600 hover:from-primary/90 hover:to-green-600/90"
                  disabled={loading}
                >
                  {loading ? 'Please wait...' : 'Sign In'}
                </Button>
              </form>

              {/* Instead of Create Account link */}
              <div className="text-center mt-4">
                <p className="text-sm text-gray-500">
                  Don't have an account?{" "}
                  <span className="text-primary font-medium">
                    Please contact your hospital administration.
                  </span>
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Mobile Hero Text */}
          <div className="lg:hidden text-center space-y-4 mt-8">
            <h1 className="text-3xl text-gray-800">Recovery Tracker</h1>
            <p className="text-gray-600 max-w-md">
              Your comprehensive post-surgery recovery companion.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
