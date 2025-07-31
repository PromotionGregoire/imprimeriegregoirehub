import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/hooks/useAuth';
import { useProfiles } from '@/hooks/useProfiles';
import logoGregoire from '@/assets/logo-imprimerie-gregoire.png';

const Login = () => {
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { signIn, user } = useAuth();
  const { data: profiles, isLoading: profilesLoading, error: profilesError } = useProfiles();
  
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

  // Handle loading and error states
  if (profilesLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <div className="w-full max-w-md space-y-8 text-center">
          <h1 className="text-3xl font-bold text-foreground">
            Connexion Espace Employé
          </h1>
          <div className="space-y-4">
            <div className="text-lg text-muted-foreground">Chargement des employés...</div>
            <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full mx-auto"></div>
          </div>
        </div>
      </div>
    );
  }

  // Handle error state - profiles failed to load
  if (profilesError || !profiles || profiles.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <div className="w-full max-w-md space-y-8 text-center">
          <h1 className="text-3xl font-bold text-foreground">
            Connexion Espace Employé
          </h1>
          <div className="space-y-4">
            <div className="text-destructive text-lg">
              Erreur : Impossible de charger la liste des employés
            </div>
            <div className="text-muted-foreground">
              {profilesError?.message || "Aucun employé trouvé dans la base de données"}
            </div>
            <Button 
              onClick={() => window.location.reload()} 
              variant="outline"
              className="mx-auto"
            >
              Rafraîchir la page
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <img 
            src={logoGregoire} 
            alt="Imprimerie Grégoire" 
            className="h-20 w-auto mx-auto mb-6"
          />
          <h1 className="text-3xl font-bold text-foreground">
            Connexion Espace Employé
          </h1>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="employee">Sélectionner un employé</Label>
            <Select value={selectedEmployeeId} onValueChange={setSelectedEmployeeId}>
              <SelectTrigger className="w-full bg-background">
                <SelectValue placeholder="Choisir votre nom" />
              </SelectTrigger>
              <SelectContent className="bg-background border border-border shadow-md">
                {profiles.map((profile) => (
                  <SelectItem key={profile.id} value={profile.id}>
                    {profile.full_name}
                  </SelectItem>
                ))}
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
            <div className="text-destructive text-sm text-center py-2 bg-destructive/10 rounded-md border border-destructive/20">
              {error}
            </div>
          )}

          <Button 
            type="submit" 
            className="w-full" 
            disabled={loading || !selectedEmployeeId}
          >
            {loading ? 'Connexion...' : 'Se connecter'}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default Login;