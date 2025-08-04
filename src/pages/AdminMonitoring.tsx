import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { 
  AlertCircle, 
  CheckCircle, 
  AlertTriangle, 
  Activity,
  RefreshCw,
  Settings,
  Clock,
  Filter,
  Play
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

interface SystemLog {
  id: string;
  type: string;
  level: string;
  message: string;
  metadata: any;
  created_at: string;
}

interface MonitoringConfig {
  id: string;
  key: string;
  value: string;
  description: string;
}

export default function AdminMonitoring() {
  const [logs, setLogs] = useState<SystemLog[]>([]);
  const [config, setConfig] = useState<MonitoringConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [filter, setFilter] = useState<string>('all');
  const [editingConfig, setEditingConfig] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    fetchData();
    
    // Auto-refresh toutes les 30 secondes si activé
    const interval = autoRefresh ? setInterval(fetchLogs, 30000) : null;
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [filter, autoRefresh]);

  const fetchData = async () => {
    await Promise.all([fetchLogs(), fetchConfig()]);
    setLoading(false);
  };

  const fetchLogs = async () => {
    let query = supabase
      .from('system_logs')
      .select('*')
      .eq('type', 'monitoring_check')
      .order('created_at', { ascending: false })
      .limit(50);

    if (filter !== 'all') {
      query = query.eq('level', filter);
    }

    const { data, error } = await query;
    if (!error && data) {
      setLogs(data);
    }
  };

  const fetchConfig = async () => {
    const { data, error } = await supabase
      .from('monitoring_config')
      .select('*')
      .order('key');

    if (!error && data) {
      setConfig(data);
    }
  };

  const runManualCheck = async () => {
    setRunning(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const response = await supabase.functions.invoke('scheduled-monitor', {
        headers: {
          Authorization: `Bearer ${session?.access_token}`
        }
      });

      if (response.error) throw response.error;

      // Rafraîchir les logs après 2 secondes
      setTimeout(fetchLogs, 2000);
      alert('Vérification terminée. ' + (response.data?.issuesFound || 0) + ' problème(s) détecté(s).');
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de la vérification');
    } finally {
      setRunning(false);
    }
  };

  const updateConfig = async (key: string, value: string) => {
    const { error } = await supabase
      .from('monitoring_config')
      .update({ value })
      .eq('key', key);

    if (!error) {
      setEditingConfig(null);
      fetchConfig();
    }
  };

  const getIcon = (level: string) => {
    switch (level) {
      case 'error':
      case 'critical':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'info':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      default:
        return <Activity className="h-5 w-5 text-gray-500" />;
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'error':
      case 'critical':
        return 'bg-red-50 border-red-200';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200';
      case 'info':
        return 'bg-green-50 border-green-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Monitoring Système</h1>
          <p className="text-gray-600 mt-1">
            Surveillez l'état de l'application et recevez des alertes
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            variant={autoRefresh ? "secondary" : "outline"}
            size="sm"
            onClick={() => setAutoRefresh(!autoRefresh)}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${autoRefresh ? 'animate-spin' : ''}`} />
            Auto-refresh {autoRefresh ? 'ON' : 'OFF'}
          </Button>
          <Button
            onClick={runManualCheck}
            disabled={running}
          >
            {running ? (
              <>
                <Activity className="h-4 w-4 mr-2 animate-pulse" />
                Vérification...
              </>
            ) : (
              <>
                <Play className="h-4 w-4 mr-2" />
                Lancer vérification
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Configuration */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Settings className="h-5 w-5 text-gray-600" />
          <h2 className="text-lg font-semibold">Configuration des Seuils</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {config.map((item) => (
            <div key={item.id} className="space-y-1">
              <label className="text-sm font-medium text-gray-700">
                {item.description}
              </label>
              {editingConfig === item.key ? (
                <div className="flex gap-2">
                  <Input
                    type={item.key.includes('email') ? 'email' : 'number'}
                    defaultValue={item.value}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        updateConfig(item.key, (e.target as HTMLInputElement).value);
                      }
                    }}
                    autoFocus
                  />
                  <Button
                    size="sm"
                    onClick={(e) => {
                      const input = e.currentTarget.previousSibling as HTMLInputElement;
                      updateConfig(item.key, input.value);
                    }}
                  >
                    OK
                  </Button>
                </div>
              ) : (
                <div
                  className="flex items-center justify-between p-2 bg-gray-50 rounded cursor-pointer hover:bg-gray-100"
                  onClick={() => setEditingConfig(item.key)}
                >
                  <span className="font-mono text-sm">{item.value}</span>
                  <span className="text-xs text-gray-500">Cliquer pour modifier</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </Card>

      {/* Filtres */}
      <div className="flex gap-2">
        <Button
          variant={filter === 'all' ? 'secondary' : 'outline'}
          size="sm"
          onClick={() => setFilter('all')}
        >
          <Filter className="h-4 w-4 mr-2" />
          Tous
        </Button>
        {['error', 'warning', 'info'].map(level => (
          <Button
            key={level}
            variant={filter === level ? 'secondary' : 'outline'}
            size="sm"
            onClick={() => setFilter(level)}
          >
            {getIcon(level)}
            <span className="ml-2 capitalize">{level}</span>
          </Button>
        ))}
      </div>

      {/* Logs */}
      <div className="space-y-4">
        {logs.map(log => (
          <Card
            key={log.id}
            className={`p-4 border ${getLevelColor(log.level)}`}
          >
            <div className="flex items-start gap-3">
              {getIcon(log.level)}
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium">{log.message}</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      <Clock className="inline h-3 w-3 mr-1" />
                      {formatDistanceToNow(new Date(log.created_at), { 
                        addSuffix: true,
                        locale: fr 
                      })}
                    </p>
                  </div>
                </div>
                
                {log.metadata?.results && (
                  <details className="mt-3">
                    <summary className="cursor-pointer text-sm text-blue-600 hover:text-blue-800">
                      Voir les détails de la vérification
                    </summary>
                    <div className="mt-2 space-y-2">
                      {log.metadata.results.map((result: any, idx: number) => (
                        <div
                          key={idx}
                          className="p-3 bg-white rounded border border-gray-200"
                        >
                          <div className="flex items-center gap-2">
                            {getIcon(result.status === 'success' ? 'info' : result.status)}
                            <span className="font-medium">{result.check}</span>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">{result.message}</p>
                          {result.details && (
                            <pre className="mt-2 text-xs bg-gray-50 p-2 rounded overflow-auto">
                              {JSON.stringify(result.details, null, 2)}
                            </pre>
                          )}
                        </div>
                      ))}
                    </div>
                  </details>
                )}
              </div>
            </div>
          </Card>
        ))}
        
        {logs.length === 0 && (
          <Card className="p-12 text-center">
            <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Aucun log de monitoring trouvé</p>
          </Card>
        )}
      </div>
    </div>
  );
}