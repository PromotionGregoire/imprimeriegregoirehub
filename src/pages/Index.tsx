import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import logoGregoire from '@/assets/logo-imprimerie-gregoire.png';

const Index = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md mx-auto text-center">
        {/* Logo Section */}
        <div className="mb-8 lg:mb-12">
          <img 
            src={logoGregoire} 
            alt="Imprimerie Grégoire" 
            className="h-16 sm:h-20 lg:h-24 w-auto mx-auto"
          />
        </div>
        
        {/* Content Section */}
        <div className="space-y-6 lg:space-y-8">
          <div className="space-y-3 lg:space-y-4">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground leading-tight">
              Système de Gestion Imprimerie
            </h1>
            <p className="text-base sm:text-lg lg:text-xl text-muted-foreground leading-relaxed">
              Plateforme de gestion des clients, soumissions et commandes
            </p>
          </div>
          
          {/* Action Section */}
          <div className="pt-2">
            <Button asChild size="lg" className="w-full sm:w-auto min-w-[200px]">
              <Link to="/login">
                Accéder à l'espace employé
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
