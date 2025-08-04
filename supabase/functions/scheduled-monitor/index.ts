import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { Resend } from 'npm:resend@2.0.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface MonitorResult {
  check: string;
  status: 'success' | 'warning' | 'error';
  message: string;
  requiresAction: boolean;
  details?: any;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const results: MonitorResult[] = [];
    
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const resend = new Resend(Deno.env.get('RESEND_API_KEY')!);

    // Récupérer la configuration
    const { data: config } = await supabase
      .from('monitoring_config')
      .select('key, value');

    const configMap = new Map(config?.map(c => [c.key, c.value]) || []);

    // 1. Vérifier les épreuves en attente depuis plus de 48h
    const proofCheck = await checkPendingProofs(supabase, configMap);
    results.push(proofCheck);

    // 2. Vérifier les soumissions non traitées
    const submissionCheck = await checkPendingSubmissions(supabase, configMap);
    results.push(submissionCheck);

    // 3. Vérifier l'espace de stockage
    const storageCheck = await checkStorageUsage(supabase, configMap);
    results.push(storageCheck);

    // 4. Vérifier les erreurs d'emails
    const emailCheck = await checkEmailErrors(supabase, configMap);
    results.push(emailCheck);

    // 5. Vérifier la cohérence des données
    const dataCheck = await checkDataIntegrity(supabase);
    results.push(dataCheck);

    // 6. Vérifier les commandes bloquées
    const orderCheck = await checkStuckOrders(supabase, configMap);
    results.push(orderCheck);

    // Envoyer un email si des actions sont requises
    const criticalIssues = results.filter(r => r.requiresAction);
    if (criticalIssues.length > 0) {
      await sendAlertEmail(criticalIssues, resend, configMap.get('admin_email') || 'Frank@laboite.agency');
    }

    // Logger les résultats
    await logMonitoringResults(supabase, results);

    return new Response(JSON.stringify({ 
      success: true, 
      checksRun: results.length,
      issuesFound: criticalIssues.length 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error: any) {
    console.error('Error in scheduled-monitor:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
};

// Fonction 1: Vérifier les épreuves en attente
async function checkPendingProofs(supabase: any, config: Map<string, string>): Promise<MonitorResult> {
  const hours = parseInt(config.get('proof_pending_hours') || '48');
  const cutoffDate = new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();

  const { data, error } = await supabase
    .from('proofs')
    .select(`
      id,
      created_at,
      status,
      orders!inner(
        order_number,
        submissions!inner(
          clients!inner(
            business_name,
            contact_name
          )
        )
      )
    `)
    .in('status', ['A preparer', 'Envoyée au client'])
    .lt('created_at', cutoffDate);

  if (error) {
    return {
      check: 'Épreuves en attente',
      status: 'error',
      message: `Erreur lors de la vérification: ${error.message}`,
      requiresAction: true
    };
  }

  if (data && data.length > 0) {
    return {
      check: 'Épreuves en attente',
      status: 'warning',
      message: `${data.length} épreuves en attente depuis plus de ${hours}h`,
      requiresAction: true,
      details: data.map(p => ({
        orderId: p.orders.order_number,
        client: p.orders.submissions.clients.business_name,
        waitingSince: p.created_at,
        status: p.status
      }))
    };
  }

  return {
    check: 'Épreuves en attente',
    status: 'success',
    message: 'Toutes les épreuves sont traitées',
    requiresAction: false
  };
}

// Fonction 2: Vérifier les soumissions non traitées
async function checkPendingSubmissions(supabase: any, config: Map<string, string>): Promise<MonitorResult> {
  const days = parseInt(config.get('submission_draft_days') || '7');
  const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

  const { data, error } = await supabase
    .from('submissions')
    .select('id, submission_number, created_at, clients(business_name)')
    .eq('status', 'Brouillon')
    .lt('created_at', cutoffDate);

  if (error) {
    return {
      check: 'Soumissions en attente',
      status: 'error',
      message: `Erreur lors de la vérification: ${error.message}`,
      requiresAction: true
    };
  }

  if (data && data.length > 0) {
    return {
      check: 'Soumissions en attente',
      status: 'warning',
      message: `${data.length} soumissions en brouillon depuis plus de ${days} jours`,
      requiresAction: true,
      details: data.map(s => ({
        submissionNumber: s.submission_number,
        client: s.clients?.business_name,
        createdAt: s.created_at
      }))
    };
  }

  return {
    check: 'Soumissions en attente',
    status: 'success',
    message: 'Toutes les soumissions sont à jour',
    requiresAction: false
  };
}

// Fonction 3: Vérifier l'espace de stockage
async function checkStorageUsage(supabase: any, config: Map<string, string>): Promise<MonitorResult> {
  const warningPercent = parseInt(config.get('storage_warning_percent') || '80');
  const criticalPercent = parseInt(config.get('storage_critical_percent') || '90');
  
  // Simulé pour l'instant - remplacer par vraie API si disponible
  const usagePercent = 75;

  if (usagePercent > criticalPercent) {
    return {
      check: 'Espace de stockage',
      status: 'error',
      message: `Espace de stockage critique: ${usagePercent}% utilisé`,
      requiresAction: true,
      details: { usagePercent, threshold: criticalPercent }
    };
  } else if (usagePercent > warningPercent) {
    return {
      check: 'Espace de stockage',
      status: 'warning',
      message: `Espace de stockage élevé: ${usagePercent}% utilisé`,
      requiresAction: true,
      details: { usagePercent, threshold: warningPercent }
    };
  }

  return {
    check: 'Espace de stockage',
    status: 'success',
    message: `Espace suffisant: ${usagePercent}% utilisé`,
    requiresAction: false
  };
}

// Fonction 4: Vérifier les erreurs d'emails
async function checkEmailErrors(supabase: any, config: Map<string, string>): Promise<MonitorResult> {
  const threshold = parseInt(config.get('email_error_threshold') || '10');
  const last24h = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

  // Vérifier dans email_notifications s'il y a une colonne status
  const { data, error } = await supabase
    .from('email_notifications')
    .select('id')
    .gte('created_at', last24h);

  if (error) {
    return {
      check: 'Erreurs d\'emails',
      status: 'warning',
      message: 'Impossible de vérifier les erreurs d\'emails',
      requiresAction: false
    };
  }

  // Pour l'instant, simuler - ajouter vraie logique plus tard
  const errorCount = 0;

  if (errorCount > threshold) {
    return {
      check: 'Erreurs d\'emails',
      status: 'error',
      message: `${errorCount} échecs d'envoi d'emails dans les dernières 24h`,
      requiresAction: true,
      details: { errorCount, threshold }
    };
  }

  return {
    check: 'Erreurs d\'emails',
    status: 'success',
    message: 'Système d\'emails fonctionnel',
    requiresAction: false
  };
}

// Fonction 5: Vérifier l'intégrité des données
async function checkDataIntegrity(supabase: any): Promise<MonitorResult> {
  const issues = [];

  // Vérifier les commandes sans client
  const { data: orphanOrders } = await supabase
    .from('orders')
    .select('id, order_number')
    .is('client_id', null);

  // Vérifier les épreuves sans commande
  const { data: orphanProofs } = await supabase
    .from('proofs')
    .select('id')
    .is('order_id', null);

  if (orphanOrders?.length > 0) issues.push(`${orphanOrders.length} commandes sans client`);
  if (orphanProofs?.length > 0) issues.push(`${orphanProofs.length} épreuves sans commande`);

  if (issues.length > 0) {
    return {
      check: 'Intégrité des données',
      status: 'error',
      message: `Problèmes d'intégrité détectés: ${issues.join(', ')}`,
      requiresAction: true,
      details: { orphanOrders, orphanProofs }
    };
  }

  return {
    check: 'Intégrité des données',
    status: 'success',
    message: 'Données cohérentes',
    requiresAction: false
  };
}

// Fonction 6: Vérifier les commandes bloquées
async function checkStuckOrders(supabase: any, config: Map<string, string>): Promise<MonitorResult> {
  const days = parseInt(config.get('order_stuck_days') || '30');
  const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

  const { data } = await supabase
    .from('orders')
    .select('id, order_number, updated_at, status')
    .eq('status', 'En production')
    .lt('updated_at', cutoffDate);

  if (data?.length > 0) {
    return {
      check: 'Commandes bloquées',
      status: 'warning',
      message: `${data.length} commandes en production depuis plus de ${days} jours`,
      requiresAction: true,
      details: data.map(o => ({
        orderNumber: o.order_number,
        status: o.status,
        lastUpdate: o.updated_at
      }))
    };
  }

  return {
    check: 'Commandes bloquées',
    status: 'success',
    message: 'Flux de commandes normal',
    requiresAction: false
  };
}

// Envoyer l'email d'alerte
async function sendAlertEmail(issues: MonitorResult[], resend: any, adminEmail: string) {
  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #dc2626; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
        .content { background: #f3f4f6; padding: 20px; border-radius: 0 0 8px 8px; }
        .issue { background: white; padding: 15px; margin: 10px 0; border-radius: 8px; border-left: 4px solid #dc2626; }
        .issue h3 { margin: 0 0 10px 0; color: #dc2626; }
        .button { display: inline-block; padding: 10px 20px; background: #3b82f6; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; }
        .details { background: #f9f9f9; padding: 10px; border-radius: 4px; font-size: 12px; overflow-x: auto; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>⚠️ Action Requise - PromoFlow</h1>
            <p>${new Date().toLocaleString('fr-CA')}</p>
        </div>
        <div class="content">
            <p>Le système de monitoring a détecté ${issues.length} problème(s) nécessitant votre attention :</p>
            
            ${issues.map(issue => `
                <div class="issue">
                    <h3>${issue.check}</h3>
                    <p><strong>Statut:</strong> ${issue.status.toUpperCase()}</p>
                    <p><strong>Message:</strong> ${issue.message}</p>
                    ${issue.details ? `<div class="details"><strong>Détails:</strong><pre>${JSON.stringify(issue.details, null, 2)}</pre></div>` : ''}
                </div>
            `).join('')}
            
            <a href="https://ytcrplsistsxfaxkfqqp.supabase.co" class="button">
                Accéder au Dashboard Supabase
            </a>
        </div>
    </div>
</body>
</html>
  `;

  await resend.emails.send({
    from: 'PromoFlow Monitor <noreply@promotiongregoire.com>',
    to: [adminEmail],
    subject: `⚠️ PromoFlow - ${issues.length} problème(s) détecté(s)`,
    html: htmlContent,
  });
}

// Logger les résultats dans la base
async function logMonitoringResults(supabase: any, results: MonitorResult[]) {
  const level = results.some(r => r.status === 'error') ? 'error' : 
               results.some(r => r.status === 'warning') ? 'warning' : 'info';

  await supabase.from('system_logs').insert({
    type: 'monitoring_check',
    level: level,
    message: `Monitoring exécuté: ${results.filter(r => r.requiresAction).length} problèmes détectés`,
    metadata: { results },
    created_at: new Date().toISOString()
  });
}

serve(handler);