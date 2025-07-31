import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import logoGregoire from '@/assets/logo-imprimerie-gregoire.png';

const Index = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-6">
        <img 
          src={logoGregoire} 
          alt="Imprimerie Grégoire" 
          className="h-24 w-auto mx-auto mb-6"
        />
        <h1 className="text-4xl font-bold mb-4">Système de Gestion Imprimerie</h1>
        <p className="text-xl text-muted-foreground mb-8">
          Plateforme de gestion des clients, soumissions et commandes
        </p>
        <div>
          <Button asChild>
            <Link to="/login">
              Accéder à l'espace employé
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Index;
