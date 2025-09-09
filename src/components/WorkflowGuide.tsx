import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ArrowRight, 
  FileText, 
  Send, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Hourglass, 
  AlertTriangle,
  Info,
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import { SUBMISSION_WORKFLOW, ORDER_WORKFLOW, PROOF_WORKFLOW, AUTO_TRANSITIONS } from '@/constants/workflow-constants';

const WorkflowGuide: React.FC = () => {
  const [expandedSections, setExpandedSections] = useState<string[]>([]);

  const toggleSection = (section: string) => {
    setExpandedSections(prev => 
      prev.includes(section) 
        ? prev.filter(s => s !== section)
        : [...prev, section]
    );
  };

  const getIconByName = (iconName: string) => {
    const icons: { [key: string]: React.ReactNode } = {
      'FileText': <FileText size={16} />,
      'Send': <Send size={16} />,
      'Clock': <Clock size={16} />,
      'CheckCircle': <CheckCircle size={16} />,
      'AlertCircle': <AlertCircle size={16} />,
      'Hourglass': <Hourglass size={16} />,
      'AlertTriangle': <AlertTriangle size={16} />
    };
    return icons[iconName] || <Clock size={16} />;
  };

  const getThemeColor = (color: string) => {
    const colors = {
      'success': 'bg-green-500/10 text-green-600 border-green-200',
      'info': 'bg-blue-500/10 text-blue-600 border-blue-200',
      'warning': 'bg-orange-500/10 text-orange-600 border-orange-200',
      'danger': 'bg-red-500/10 text-red-600 border-red-200',
      'normal': 'bg-gray-500/10 text-gray-600 border-gray-200'
    };
    return colors[color as keyof typeof colors] || colors.normal;
  };

  const WorkflowSection = ({ 
    title, 
    workflow, 
    sectionKey 
  }: { 
    title: string; 
    workflow: typeof SUBMISSION_WORKFLOW; 
    sectionKey: string;
  }) => {
    const isExpanded = expandedSections.includes(sectionKey);

    return (
      <Card className="mb-6">
        <CardHeader 
          className="cursor-pointer hover:bg-muted/50 transition-colors"
          onClick={() => toggleSection(sectionKey)}
        >
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              {isExpanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
              {title}
            </CardTitle>
            <Badge variant="outline">{workflow.length} statuts</Badge>
          </div>
        </CardHeader>
        
        {isExpanded && (
          <CardContent>
            <div className="space-y-4">
              {workflow.map((step, index) => (
                <div key={step.status} className="relative">
                  {/* Step Card */}
                  <div className={`p-4 rounded-lg border-2 ${getThemeColor(step.color)}`}>
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-0.5">
                        {getIconByName(step.status.includes('Envoyée') ? 'Send' : 
                                     step.status.includes('attente') ? 'Clock' :
                                     step.status.includes('Acceptée') || step.status.includes('Approuvée') || step.status.includes('Complétée') ? 'CheckCircle' :
                                     step.status.includes('Refusée') || step.status.includes('Modification') ? 'AlertCircle' :
                                     step.status.includes('préparation') ? 'Clock' :
                                     step.status.includes('preparer') ? 'Hourglass' : 'FileText')}
                      </div>
                      
                      <div className="flex-grow">
                        <h4 className="font-semibold mb-1">{step.status}</h4>
                        <p className="text-sm mb-3 opacity-90">{step.description}</p>
                        
                        {/* Actions disponibles */}
                        {step.actions && step.actions.length > 0 && (
                          <div className="mb-3">
                            <p className="text-xs font-medium mb-2">Actions disponibles:</p>
                            <div className="flex flex-wrap gap-1">
                              {step.actions.map((action) => (
                                <Badge key={action} variant="secondary" className="text-xs">
                                  {action}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {/* Transitions possibles */}
                        {step.nextSteps.length > 0 && (
                          <div>
                            <p className="text-xs font-medium mb-2">Prochaines étapes possibles:</p>
                            <div className="flex flex-wrap gap-2">
                              {step.nextSteps.map((nextStep) => (
                                <div key={nextStep} className="flex items-center gap-1">
                                  <ArrowRight size={12} />
                                  <span className="text-xs font-medium">{nextStep}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {step.nextSteps.length === 0 && (
                          <div className="flex items-center gap-2">
                            <CheckCircle size={12} />
                            <span className="text-xs font-medium">Étape finale</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* Arrow to next step */}
                  {index < workflow.length - 1 && (
                    <div className="flex justify-center my-2">
                      <ArrowRight size={20} className="text-muted-foreground" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        )}
      </Card>
    );
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Guide des Workflows</h1>
        <p className="text-muted-foreground">
          Comprendre les statuts et transitions pour les soumissions, commandes et épreuves
        </p>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
          <TabsTrigger value="submissions">Soumissions</TabsTrigger>
          <TabsTrigger value="orders">Commandes</TabsTrigger>
          <TabsTrigger value="proofs">Épreuves</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info size={24} />
                Transitions Automatiques
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-green-500/10 border border-green-200 rounded-lg">
                  <h4 className="font-semibold text-green-700 mb-2">
                    Soumission Acceptée → Commande Créée
                  </h4>
                  <p className="text-sm text-green-600">
                    Quand un client accepte une soumission, une commande est automatiquement créée 
                    avec le statut "En attente de l'épreuve"
                  </p>
                </div>
                
                <div className="p-4 bg-blue-500/10 border border-blue-200 rounded-lg">
                  <h4 className="font-semibold text-blue-700 mb-2">
                    Épreuve Approuvée → Production Démarrée
                  </h4>
                  <p className="text-sm text-blue-600">
                    Quand un client approuve une épreuve, la commande associée passe automatiquement 
                    en statut "En production"
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Soumissions</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  5 statuts possibles
                </p>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setExpandedSections(['submissions'])}
                >
                  Voir le détail
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Commandes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  3 statuts possibles
                </p>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setExpandedSections(['orders'])}
                >
                  Voir le détail
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Épreuves</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  6 statuts possibles
                </p>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setExpandedSections(['proofs'])}
                >
                  Voir le détail
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="submissions">
          <WorkflowSection 
            title="Workflow des Soumissions" 
            workflow={SUBMISSION_WORKFLOW}
            sectionKey="submissions"
          />
        </TabsContent>

        <TabsContent value="orders">
          <WorkflowSection 
            title="Workflow des Commandes" 
            workflow={ORDER_WORKFLOW}
            sectionKey="orders"
          />
        </TabsContent>

        <TabsContent value="proofs">
          <WorkflowSection 
            title="Workflow des Épreuves" 
            workflow={PROOF_WORKFLOW}
            sectionKey="proofs"
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default WorkflowGuide;