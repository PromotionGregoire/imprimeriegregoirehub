import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/hooks/useAuth';
import { useProfiles } from '@/hooks/useProfiles';

const Login = () => {
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { signIn, user } = useAuth();
  const { data: profiles, isLoading: profilesLoading, error: profilesError } = useProfiles();
  
  // Debug logging
  console.log('Login page rendered');
  console.log('User:', user);
  console.log('Profiles loading:', profilesLoading);
  console.log('Profiles data:', profiles);
  console.log('Profiles error:', profilesError);
  const navigate = useNavigate();

  // Redirect if already authenticated
  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!selectedEmployeeId) {
      setError('Veuillez sélectionner un employé.');
      setLoading(false);
      return;
    }

    // Find the selected employee's email to use for authentication
    const selectedProfile = profiles?.find(p => p.id === selectedEmployeeId);
    if (!selectedProfile) {
      setError('Employé introuvable.');
      setLoading(false);
      return;
    }

    // Use the email from the profile
    const email = selectedProfile.email;
    if (!email) {
      setError('Email non trouvé pour cet employé.');
      setLoading(false);
      return;
    }

    const { error: signInError } = await signIn(email, password);

    if (signInError) {
      setError('Le mot de passe est incorrect.');
      setLoading(false);
    } else {
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-foreground">
            Connexion Espace Employé
          </h1>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="employee">Sélectionner un employé</Label>
            <Select value={selectedEmployeeId} onValueChange={setSelectedEmployeeId}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Choisir votre nom" />
              </SelectTrigger>
              <SelectContent>
                {profilesLoading ? (
                  <SelectItem value="" disabled>Chargement...</SelectItem>
                ) : (
                  profiles?.map((profile) => (
                    <SelectItem key={profile.id} value={profile.id}>
                      {profile.full_name}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          {selectedEmployeeId && (
            <div className="space-y-2">
              <Label htmlFor="password">Mot de passe</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full"
                placeholder="••••••••"
              />
            </div>
          )}

          {error && (
            <div className="text-destructive text-sm text-center py-2">
              {error}
            </div>
          )}

          <Button 
            type="submit" 
            className="w-full" 
            disabled={loading}
          >
            {loading ? 'Connexion...' : 'Se connecter'}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default Login;