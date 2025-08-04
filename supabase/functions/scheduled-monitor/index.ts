import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { Resend } from 'npm:resend@2.0.0';

interface MonitorResult {
  check: string;
  status: 'success' | 'warning' | 'error';
  message: string;
  requiresAction: boolean;
  details?: any;
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const results: MonitorResult[] = [];
  
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );

  const resend = new Resend(Deno.env.get('RESEND_API_KEY'));

  try {
    // Récupérer la configuration du monitoring
    const { data: config } = await supabase
      .from('monitoring_config')
      .select('key, value');

    const configMap = config?.reduce((acc, item) => {
      acc[item.key] = item.value;
      return acc;
    }, {} as Record<string, string>) || {};

    const ADMIN_EMAIL = configMap.admin_email || 'info@promotiongregoire.ca';
    const DEVELOPER_EMAIL = configMap.developer_email || 'Frank@laboite.agency';
    const PROOF_PENDING_HOURS = parseInt(configMap.proof_pending_hours || '48');
    const SUBMISSION_DRAFT_DAYS = parseInt(configMap.submission_draft_days || '7');
    const STORAGE_WARNING_PERCENT = parseInt(configMap.storage_warning_percent || '80');
    const STORAGE_CRITICAL_PERCENT = parseInt(configMap.storage_critical_percent || '90');
    const ORDER_STUCK_DAYS = parseInt(configMap.order_stuck_days || '30');

    // 1. Vérifier les épreuves en attente depuis plus de X heures
    const proofCheck = await checkPendingProofs(supabase, PROOF_PENDING_HOURS);
    results.push(proofCheck);

    // 2. Vérifier les soumissions non traitées
    const submissionCheck = await checkPendingSubmissions(supabase, SUBMISSION_DRAFT_DAYS);
    results.push(submissionCheck);

    // 3. Vérifier l'espace de stockage
    const storageCheck = await checkStorageUsage(supabase, STORAGE_WARNING_PERCENT, STORAGE_CRITICAL_PERCENT);
    results.push(storageCheck);

    // 4. Vérifier les erreurs d'emails
    const emailCheck = await checkEmailErrors(supabase, EMAIL_ERROR_THRESHOLD);
    results.push(emailCheck);

    // 5. Vérifier la cohérence des données
    const dataCheck = await checkDataIntegrity(supabase);
    results.push(dataCheck);

    // 6. Vérifier les commandes bloquées
    const orderCheck = await checkStuckOrders(supabase, ORDER_STUCK_DAYS);
    results.push(orderCheck);

    // Envoyer un email si des actions sont requises
    const criticalIssues = results.filter(r => r.requiresAction);
    if (criticalIssues.length > 0) {
      await sendAlertEmail(resend, criticalIssues, ADMIN_EMAIL, DEVELOPER_EMAIL);
    }

    // Logger les résultats
    await logMonitoringResults(supabase, results);

    return new Response(JSON.stringify({ 
      success: true, 
      checksRun: results.length,
      issuesFound: criticalIssues.length,
      results: results
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });

  } catch (error: any) {
    console.error('Error in scheduled-monitor:', error);
    
    // Logger l'erreur
    await supabase.from('system_logs').insert({
      type: 'monitoring_error',
      level: 'error',
      message: `Erreur du monitoring: ${error.message}`,
      metadata: { error: error.stack }
    });

    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }
};

// Fonction 1: Vérifier les épreuves en attente
async function checkPendingProofs(supabase: any, hours: number): Promise<MonitorResult> {
  const cutoffDate = new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();
  
  const { data, error } = await supabase
    .from('proofs')
    .select(`
      id,
      created_at,
      status,
      order_id,
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
    .in('status', ['A preparer', 'En attente'])
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
    message: 'Toutes les épreuves sont traitées en temps et heure',
    requiresAction: false
  };
}

// Fonction 2: Vérifier les soumissions non traitées
async function checkPendingSubmissions(supabase: any, days: number): Promise<MonitorResult> {
  const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
  
  const { data, error } = await supabase
    .from('submissions')
    .select(`
      id, 
      submission_number, 
      created_at,
      clients!inner(
        business_name,
        contact_name
      )
    `)
    .eq('status', 'Brouillon')
    .lt('created_at', cutoffDate);

  if (error) {
    return {
      check: 'Soumissions en attente',
      status: 'error',
      message: `Erreur: ${error.message}`,
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
        client: s.clients.business_name,
        draftSince: s.created_at
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
async function checkStorageUsage(supabase: any, warningPercent: number, criticalPercent: number): Promise<MonitorResult> {
  try {
    // Estimer l'utilisation en comptant les fichiers
    const { data: proofFiles } = await supabase.storage
      .from('proofs')
      .list();
    
    const { data: productImages } = await supabase.storage
      .from('product-images')
      .list();

    const totalFiles = (proofFiles?.length || 0) + (productImages?.length || 0);
    
    // Simulation basique - en production, utiliser l'API Supabase pour l'usage réel
    const estimatedUsagePercent = Math.min(Math.floor(totalFiles / 10), 95); // Simulation

    if (estimatedUsagePercent > criticalPercent) {
      return {
        check: 'Espace de stockage',
        status: 'error',
        message: `Espace de stockage critique: ${estimatedUsagePercent}% utilisé`,
        requiresAction: true,
        details: { usagePercent: estimatedUsagePercent, totalFiles }
      };
    } else if (estimatedUsagePercent > warningPercent) {
      return {
        check: 'Espace de stockage',
        status: 'warning',
        message: `Espace de stockage élevé: ${estimatedUsagePercent}% utilisé`,
        requiresAction: true,
        details: { usagePercent: estimatedUsagePercent, totalFiles }
      };
    }

    return {
      check: 'Espace de stockage',
      status: 'success',
      message: `Espace suffisant: ${estimatedUsagePercent}% utilisé`,
      requiresAction: false,
      details: { usagePercent: estimatedUsagePercent, totalFiles }
    };
  } catch (error) {
    return {
      check: 'Espace de stockage',
      status: 'error',
      message: `Impossible de vérifier l'espace: ${error.message}`,
      requiresAction: true
    };
  }
}

// Fonction 4: Vérifier les erreurs d'emails
async function checkEmailErrors(supabase: any, threshold: number): Promise<MonitorResult> {
  const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  
  const { data, error, count } = await supabase
    .from('email_notifications')
    .select('*', { count: 'exact' })
    .eq('success', false)
    .gte('created_at', last24Hours);

  if (error) {
    return {
      check: 'Erreurs d\'emails',
      status: 'error',
      message: `Erreur lors de la vérification: ${error.message}`,
      requiresAction: true
    };
  }

  const errorCount = count || 0;

  if (errorCount > threshold) {
    return {
      check: 'Erreurs d\'emails',
      status: 'error',
      message: `${errorCount} échecs d'envoi d'emails dans les dernières 24h`,
      requiresAction: true,
      details: { errorCount, recentErrors: data?.slice(0, 5) }
    };
  }

  return {
    check: 'Erreurs d\'emails',
    status: 'success',
    message: `Système d'emails fonctionnel (${errorCount} erreurs)`,
    requiresAction: false
  };
}

// Fonction 5: Vérifier l'intégrité des données
async function checkDataIntegrity(supabase: any): Promise<MonitorResult> {
  const issues = [];

  // Vérifier les commandes sans soumission
  const { data: orphanOrders } = await supabase
    .from('orders')
    .select('id, order_number')
    .is('submission_id', null);

  // Vérifier les épreuves sans commande
  const { data: orphanProofs } = await supabase
    .from('proofs')
    .select('id, version')
    .is('order_id', null);

  // Vérifier les soumissions sans client
  const { data: orphanSubmissions } = await supabase
    .from('submissions')
    .select('id, submission_number')
    .is('client_id', null);

  if (orphanOrders?.length > 0) {
    issues.push(`${orphanOrders.length} commandes sans soumission`);
  }
  if (orphanProofs?.length > 0) {
    issues.push(`${orphanProofs.length} épreuves sans commande`);
  }
  if (orphanSubmissions?.length > 0) {
    issues.push(`${orphanSubmissions.length} soumissions sans client`);
  }

  if (issues.length > 0) {
    return {
      check: 'Intégrité des données',
      status: 'error',
      message: `Problèmes d'intégrité détectés: ${issues.join(', ')}`,
      requiresAction: true,
      details: { orphanOrders, orphanProofs, orphanSubmissions }
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
async function checkStuckOrders(supabase: any, days: number): Promise<MonitorResult> {
  const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
  
  const { data } = await supabase
    .from('orders')
    .select(`
      id, 
      order_number, 
      updated_at, 
      status,
      submissions!inner(
        clients!inner(
          business_name
        )
      )
    `)
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
        client: o.submissions.clients.business_name,
        stuckSince: o.updated_at,
        status: o.status
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
async function sendAlertEmail(resend: any, issues: MonitorResult[], adminEmail: string, developerEmail: string) {
  // Séparer les problèmes critiques et les avertissements
  const criticalIssues = issues.filter(i => i.status === 'error');
  const warningIssues = issues.filter(i => i.status === 'warning');
  const hasCritical = criticalIssues.length > 0;
  
  // Déterminer les destinataires selon le niveau
  let recipients: string[] = [];
  
  if (hasCritical) {
    // Alertes critiques : envoyer à l'admin ET au développeur
    recipients = [adminEmail, developerEmail];
    console.log('Alerte CRITIQUE - Envoi à admin + dev');
  } else {
    // Avertissements seulement : envoyer uniquement à l'admin
    recipients = [adminEmail];
    console.log('Avertissement - Envoi à admin seulement');
  }

  const subjectPrefix = hasCritical ? '🚨 URGENT' : '⚠️ Attention';
  const headerColor = hasCritical ? '#dc2626' : '#f59e0b';
  
  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { 
            background: ${headerColor}; 
            color: white; 
            padding: 20px; 
            border-radius: 8px 8px 0 0; 
        }
        .content { background: #f3f4f6; padding: 20px; border-radius: 0 0 8px 8px; }
        .issue { 
            background: white; 
            padding: 15px; 
            margin: 10px 0; 
            border-radius: 8px; 
            border-left: 4px solid ${headerColor}; 
        }
        .issue h3 { margin: 0 0 10px 0; color: ${headerColor}; }
        .status-error { color: #dc2626; font-weight: bold; }
        .status-warning { color: #f59e0b; font-weight: bold; }
        .button { 
            display: inline-block; 
            padding: 12px 24px; 
            background: #3b82f6; 
            color: white; 
            text-decoration: none; 
            border-radius: 6px; 
            margin-top: 20px;
            font-weight: bold;
        }
        .footer { 
            margin-top: 20px; 
            padding-top: 20px; 
            border-top: 1px solid #e5e7eb; 
            font-size: 12px; 
            color: #6b7280; 
        }
        .urgent-notice {
            background: #fee2e2;
            border: 1px solid #fecaca;
            color: #991b1b;
            padding: 10px;
            border-radius: 6px;
            margin: 10px 0;
            font-weight: bold;
        }
        .section-title {
            color: ${headerColor};
            border-bottom: 2px solid ${headerColor};
            padding-bottom: 5px;
            margin: 20px 0 10px 0;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1 style="margin: 0;">${subjectPrefix} - PromoFlow</h1>
            <p style="margin: 10px 0 0 0;">${new Date().toLocaleString('fr-CA')}</p>
        </div>
        <div class="content">
            ${hasCritical ? '<div class="urgent-notice">⚠️ Des problèmes critiques nécessitent une action immédiate</div>' : ''}
            
            <p style="font-size: 16px;">
                Le système de monitoring a détecté <strong>${issues.length} problème(s)</strong> :
            </p>
            
            ${criticalIssues.length > 0 ? '<h2 class="section-title">🚨 Problèmes Critiques</h2>' : ''}
            ${criticalIssues.map(issue => `
                <div class="issue">
                    <h3>${issue.check}</h3>
                    <p><strong>Statut:</strong> <span class="status-error">ERREUR</span></p>
                    <p><strong>Message:</strong> ${issue.message}</p>
                    ${issue.details ? `
                        <details style="margin-top: 10px;">
                            <summary style="cursor: pointer; color: #3b82f6;">Voir les détails</summary>
                            <pre style="background: #f3f4f6; padding: 10px; border-radius: 4px; overflow-x: auto; font-size: 12px;">${JSON.stringify(issue.details, null, 2)}</pre>
                        </details>
                    ` : ''}
                </div>
            `).join('')}
            
            ${warningIssues.length > 0 ? '<h2 class="section-title">⚠️ Avertissements</h2>' : ''}
            ${warningIssues.map(issue => `
                <div class="issue">
                    <h3>${issue.check}</h3>
                    <p><strong>Statut:</strong> <span class="status-warning">AVERTISSEMENT</span></p>
                    <p><strong>Message:</strong> ${issue.message}</p>
                    ${issue.details ? `
                        <details style="margin-top: 10px;">
                            <summary style="cursor: pointer; color: #3b82f6;">Voir les détails</summary>
                            <pre style="background: #f3f4f6; padding: 10px; border-radius: 4px; overflow-x: auto; font-size: 12px;">${JSON.stringify(issue.details, null, 2)}</pre>
                        </details>
                    ` : ''}
                </div>
            `).join('')}
            
            <div style="text-align: center;">
                <a href="https://hub.promotiongregoire.com/dashboard/admin/monitoring" class="button">
                    Accéder au Dashboard de Monitoring
                </a>
            </div>
            
            <div class="footer">
                <p><strong>Destinataires de cet email :</strong></p>
                <ul style="margin: 5px 0;">
                    ${recipients.map(email => `<li>${email}</li>`).join('')}
                </ul>
                <p style="margin-top: 10px;">
                    ${hasCritical 
                      ? '🚨 Le développeur a été inclus car des erreurs critiques ont été détectées.'
                      : '⚠️ Avertissements seulement - Email envoyé uniquement à l\'administrateur.'
                    }
                </p>
                <p>Pour modifier les paramètres, accédez à la configuration dans l'interface d'administration.</p>
            </div>
        </div>
    </div>
</body>
</html>
  `;

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('RESEND_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'PromoFlow Monitor <noreply@promotiongregoire.com>',
        to: recipients,
        subject: `${subjectPrefix} PromoFlow - ${criticalIssues.length} critique(s), ${warningIssues.length} avertissement(s)`,
        html: htmlContent,
      }),
    });

    if (!response.ok) {
      console.error('Failed to send alert email:', await response.text());
    } else {
      console.log(`Email envoyé avec succès à : ${recipients.join(', ')}`);
    }
  } catch (error) {
    console.error('Error sending alert email:', error);
  }
}

// Logger les résultats dans la base
async function logMonitoringResults(supabase: any, results: MonitorResult[]) {
  const criticalCount = results.filter(r => r.status === 'error').length;
  const warningCount = results.filter(r => r.status === 'warning').length;
  const issueCount = results.filter(r => r.requiresAction).length;

  const logLevel = criticalCount > 0 ? 'error' : 
                   warningCount > 0 ? 'warning' : 'info';

  await supabase.from('system_logs').insert({
    type: 'monitoring_check',
    level: logLevel,
    message: `Monitoring exécuté: ${issueCount} problèmes détectés sur ${results.length} vérifications`,
    metadata: { 
      results,
      summary: {
        total: results.length,
        issues: issueCount,
        critical: criticalCount,
        warnings: warningCount,
        success: results.filter(r => r.status === 'success').length
      }
    }
  });
}

serve(handler);