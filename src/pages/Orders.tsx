import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const Orders = () => {
  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Commandes</h1>
      </div>

      <Card>
        <CardContent className="text-center py-12">
          <p className="text-muted-foreground">
            Module des commandes en cours de développement
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Orders;