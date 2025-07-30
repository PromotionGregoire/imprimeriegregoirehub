import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const SubmissionDetails = () => {
  const { id } = useParams();

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Détails de la Soumission</h1>
      </div>

      <Card>
        <CardContent className="text-center py-12">
          <p className="text-muted-foreground">
            Détails de la soumission {id} - Page en cours de développement
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default SubmissionDetails;