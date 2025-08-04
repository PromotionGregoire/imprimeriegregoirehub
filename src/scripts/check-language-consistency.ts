#!/usr/bin/env tsx

/**
 * Script de vérification de la cohérence linguistique PromoFlow
 * 
 * Usage: npx tsx src/scripts/check-language-consistency.ts
 * 
 * Ce script analyse le codebase pour détecter les incohérences linguistiques
 * entre français et anglais dans les noms de variables, fonctions, et labels.
 */

import fs from 'fs';
import path from 'path';
import { glob } from 'glob';

// Configuration
const CONFIG = {
  srcDir: 'src',
  excludePatterns: [
    '**/node_modules/**',
    '**/build/**',
    '**/dist/**',
    '**/*.d.ts',
    '**/check-language-consistency.ts' // Exclure ce script lui-même
  ],
  fileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  outputFile: 'language-consistency-check.json'
};

// Patterns de détection
const PATTERNS = {
  // Mots français couramment utilisés en code
  frenchWords: [
    'epreuve', 'épreuve', 'soumission', 'commande', 'client', 'fournisseur', 
    'produit', 'utilisateur', 'historique', 'statut', 'nombre', 'prix',
    'creer', 'créer', 'modifier', 'supprimer', 'envoyer', 'telecharger',
    'télécharger', 'approuver', 'rejeter', 'sauvegarder', 'gerer', 'gérer'
  ],
  
  // Mots anglais techniques OK
  englishTechnicalOK: [
    'id', 'url', 'api', 'http', 'json', 'uuid', 'token', 'email', 'phone',
    'created_at', 'updated_at', 'metadata', 'config', 'props', 'state',
    'error', 'success', 'loading', 'pending', 'hook', 'component', 'utils'
  ],
  
  // Mots anglais problématiques dans l'interface
  englishUIProblematic: [
    'submit', 'create', 'update', 'delete', 'edit', 'save', 'cancel',
    'send', 'upload', 'download', 'approve', 'reject', 'draft', 'pending',
    'sent', 'approved', 'rejected', 'completed'
  ],
  
  // Patterns de handlers d'événements
  eventHandlers: [
    /handle[A-Z][a-zA-Z]*/g,
    /on[A-Z][a-zA-Z]*/g,
    /set[A-Z][a-zA-Z]*/g
  ],
  
  // Patterns de statuts
  statusPatterns: [
    /status\s*[=:]\s*['"]/g,
    /Status\s*[=:]/g,
    /statut\s*[=:]/g,
    /Statut\s*[=:]/g
  ]
};

interface InconsistencyResult {
  file: string;
  line: number;
  column: number;
  type: 'handler' | 'status' | 'ui-label' | 'mixed-language' | 'database-action';
  found: string;
  suggestion?: string;
  severity: 'low' | 'medium' | 'high';
  description: string;
}

interface AnalysisReport {
  summary: {
    totalFiles: number;
    filesWithIssues: number;
    totalInconsistencies: number;
    byType: Record<string, number>;
    bySeverity: Record<string, number>;
  };
  inconsistencies: InconsistencyResult[];
  recommendations: string[];
}

class LanguageConsistencyChecker {
  private results: InconsistencyResult[] = [];
  
  async checkProject(): Promise<AnalysisReport> {
    console.log('🔍 Analyse de la cohérence linguistique en cours...\n');
    
    // Obtenir tous les fichiers à analyser
    const files = await this.getFiles();
    console.log(`📁 ${files.length} fichiers à analyser`);
    
    // Analyser chaque fichier
    for (const file of files) {
      await this.analyzeFile(file);
    }
    
    // Générer le rapport
    return this.generateReport(files.length);
  }
  
  private async getFiles(): Promise<string[]> {
    const patterns = CONFIG.fileExtensions.map(ext => 
      `${CONFIG.srcDir}/**/*.${ext}`
    );
    
    const files: string[] = [];
    
    for (const pattern of patterns) {
      const matches = await glob(pattern, {
        ignore: CONFIG.excludePatterns
      });
      files.push(...matches);
    }
    
    return [...new Set(files)].sort();
  }
  
  private async analyzeFile(filePath: string): Promise<void> {
    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      const lines = content.split('\n');
      
      lines.forEach((line, index) => {
        this.checkHandlers(filePath, line, index + 1);
        this.checkStatusUsage(filePath, line, index + 1);
        this.checkUILabels(filePath, line, index + 1);
        this.checkMixedLanguage(filePath, line, index + 1);
        this.checkDatabaseActions(filePath, line, index + 1);
      });
      
    } catch (error) {
      console.warn(`⚠️  Impossible de lire ${filePath}: ${error}`);
    }
  }
  
  private checkHandlers(file: string, line: string, lineNumber: number): void {
    PATTERNS.eventHandlers.forEach(pattern => {
      const matches = [...line.matchAll(pattern)];
      matches.forEach(match => {
        if (match[0] && match.index !== undefined) {
          this.results.push({
            file,
            line: lineNumber,
            column: match.index + 1,
            type: 'handler',
            found: match[0],
            suggestion: this.suggestFrenchHandler(match[0]),
            severity: 'medium',
            description: `Handler d'événement en anglais: ${match[0]}`
          });
        }
      });
    });
  }
  
  private checkStatusUsage(file: string, line: string, lineNumber: number): void {
    // Détecter les statuts mixtes français/anglais
    const statusRegex = /(status|statut)\s*[=:]\s*['"](.*?)['"]/gi;
    const matches = [...line.matchAll(statusRegex)];
    
    matches.forEach(match => {
      if (match[2]) {
        const statusValue = match[2];
        const isEnglish = ['draft', 'pending', 'sent', 'approved', 'rejected', 'completed'].includes(statusValue.toLowerCase());
        const isFrench = ['brouillon', 'en attente', 'envoyée', 'approuvée', 'rejetée', 'complétée'].includes(statusValue.toLowerCase());
        
        if (isEnglish || isFrench) {
          this.results.push({
            file,
            line: lineNumber,
            column: match.index || 0,
            type: 'status',
            found: statusValue,
            suggestion: isEnglish ? this.suggestFrenchStatus(statusValue) : this.suggestEnglishStatus(statusValue),
            severity: 'high',
            description: `Statut ${isEnglish ? 'anglais' : 'français'} dans le code: ${statusValue}`
          });
        }
      }
    });
  }
  
  private checkUILabels(file: string, line: string, lineNumber: number): void {
    // Détecter les labels UI en anglais dans les boutons/textes
    const buttonRegex = /['"](Create|Edit|Update|Delete|Save|Cancel|Submit|Send|Upload|Download|Approve|Reject)['"]/gi;
    const matches = [...line.matchAll(buttonRegex)];
    
    matches.forEach(match => {
      if (match[1] && match.index !== undefined) {
        this.results.push({
          file,
          line: lineNumber,
          column: match.index + 1,
          type: 'ui-label',
          found: match[1],
          suggestion: this.suggestFrenchLabel(match[1]),
          severity: 'high',
          description: `Label UI en anglais visible par l'utilisateur: ${match[1]}`
        });
      }
    });
  }
  
  private checkMixedLanguage(file: string, line: string, lineNumber: number): void {
    // Détecter les variables/fonctions avec mélange français/anglais
    const mixedRegex = /(\w*(?:epreuve|soumission|commande|client)(?:_\w*)*)/gi;
    const matches = [...line.matchAll(mixedRegex)];
    
    matches.forEach(match => {
      if (match[1] && match.index !== undefined) {
        const term = match[1];
        if (term.includes('_') && /[a-z]/.test(term)) {
          this.results.push({
            file,
            line: lineNumber,
            column: match.index + 1,
            type: 'mixed-language',
            found: term,
            suggestion: this.suggestEnglishTerm(term),
            severity: 'medium',
            description: `Terme mixte français/anglais: ${term}`
          });
        }
      }
    });
  }
  
  private checkDatabaseActions(file: string, line: string, lineNumber: number): void {
    // Détecter les action_type mixtes dans SQL/migrations
    const actionRegex = /(upload_epreuve|send_epreuve|approve_epreuve|reject_epreuve|changement_statut_epreuve)/gi;
    const matches = [...line.matchAll(actionRegex)];
    
    matches.forEach(match => {
      if (match[1] && match.index !== undefined) {
        this.results.push({
          file,
          line: lineNumber,
          column: match.index + 1,
          type: 'database-action',
          found: match[1],
          suggestion: this.suggestEnglishActionType(match[1]),
          severity: 'high',
          description: `Action type mixte dans la base de données: ${match[1]}`
        });
      }
    });
  }
  
  private suggestFrenchHandler(handler: string): string {
    const mapping: Record<string, string> = {
      'handleSubmit': 'gereSoumission',
      'handleClick': 'gereClic',
      'handleChange': 'gereChangement',
      'onClick': 'auClic',
      'onChange': 'auChangement',
      'onSubmit': 'auSoumission'
    };
    return mapping[handler] || handler.replace(/^handle/, 'gere').replace(/^on/, 'au');
  }
  
  private suggestFrenchStatus(status: string): string {
    const mapping: Record<string, string> = {
      'draft': 'brouillon',
      'pending': 'en_attente', 
      'sent': 'envoyee',
      'approved': 'approuvee',
      'rejected': 'rejetee',
      'completed': 'completee'
    };
    return mapping[status.toLowerCase()] || status;
  }
  
  private suggestEnglishStatus(status: string): string {
    const mapping: Record<string, string> = {
      'brouillon': 'draft',
      'en attente': 'pending',
      'envoyée': 'sent',
      'approuvée': 'approved', 
      'rejetée': 'rejected',
      'complétée': 'completed'
    };
    return mapping[status.toLowerCase()] || status;
  }
  
  private suggestFrenchLabel(label: string): string {
    const mapping: Record<string, string> = {
      'Create': 'Créer',
      'Edit': 'Modifier',
      'Update': 'Mettre à jour',
      'Delete': 'Supprimer',
      'Save': 'Sauvegarder',
      'Cancel': 'Annuler',
      'Submit': 'Soumettre',
      'Send': 'Envoyer',
      'Upload': 'Téléverser',
      'Download': 'Télécharger',
      'Approve': 'Approuver',
      'Reject': 'Rejeter'
    };
    return mapping[label] || label;
  }
  
  private suggestEnglishTerm(term: string): string {
    return term
      .replace(/epreuve/g, 'proof')
      .replace(/soumission/g, 'submission') 
      .replace(/commande/g, 'order')
      .replace(/client/g, 'client');
  }
  
  private suggestEnglishActionType(action: string): string {
    const mapping: Record<string, string> = {
      'upload_epreuve': 'upload_proof',
      'send_epreuve': 'send_proof',
      'approve_epreuve': 'approve_proof',
      'reject_epreuve': 'reject_proof',
      'changement_statut_epreuve': 'update_proof_status'
    };
    return mapping[action] || action;
  }
  
  private generateReport(totalFiles: number): AnalysisReport {
    const filesWithIssues = new Set(this.results.map(r => r.file)).size;
    
    const byType = this.results.reduce((acc, result) => {
      acc[result.type] = (acc[result.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const bySeverity = this.results.reduce((acc, result) => {
      acc[result.severity] = (acc[result.severity] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return {
      summary: {
        totalFiles,
        filesWithIssues,
        totalInconsistencies: this.results.length,
        byType,
        bySeverity
      },
      inconsistencies: this.results,
      recommendations: this.generateRecommendations()
    };
  }
  
  private generateRecommendations(): string[] {
    const recommendations = [];
    
    const dbActions = this.results.filter(r => r.type === 'database-action').length;
    if (dbActions > 0) {
      recommendations.push(`🔴 CRITIQUE: ${dbActions} action_type mixtes détectés - Migration base de données requise`);
    }
    
    const uiLabels = this.results.filter(r => r.type === 'ui-label').length;
    if (uiLabels > 0) {
      recommendations.push(`🟠 INTERFACE: ${uiLabels} labels anglais visibles par l'utilisateur`);
    }
    
    const handlers = this.results.filter(r => r.type === 'handler').length;
    if (handlers > 0) {
      recommendations.push(`🟡 CODE: ${handlers} handlers incohérents - Impact développeur uniquement`);
    }
    
    const statuses = this.results.filter(r => r.type === 'status').length;
    if (statuses > 0) {
      recommendations.push(`🟠 STATUTS: ${statuses} statuts incohérents - Utiliser le dictionnaire de traduction`);
    }
    
    if (this.results.length === 0) {
      recommendations.push('✅ Aucune incohérence majeure détectée');
    }
    
    return recommendations;
  }
}

// Fonction principale
async function main() {
  try {
    const checker = new LanguageConsistencyChecker();
    const report = await checker.checkProject();
    
    // Afficher le résumé dans la console
    console.log('\n📊 RÉSUMÉ DU RAPPORT\n');
    console.log(`📁 Fichiers analysés: ${report.summary.totalFiles}`);
    console.log(`❗ Fichiers avec problèmes: ${report.summary.filesWithIssues}`);
    console.log(`🔍 Total incohérences: ${report.summary.totalInconsistencies}\n`);
    
    console.log('📈 PAR TYPE:');
    Object.entries(report.summary.byType).forEach(([type, count]) => {
      console.log(`   ${type}: ${count}`);
    });
    
    console.log('\n🚨 PAR SÉVÉRITÉ:');
    Object.entries(report.summary.bySeverity).forEach(([severity, count]) => {
      const icon = severity === 'high' ? '🔴' : severity === 'medium' ? '🟠' : '🟡';
      console.log(`   ${icon} ${severity}: ${count}`);
    });
    
    console.log('\n💡 RECOMMANDATIONS:');
    report.recommendations.forEach(rec => console.log(`   ${rec}`));
    
    // Sauvegarder le rapport détaillé
    fs.writeFileSync(CONFIG.outputFile, JSON.stringify(report, null, 2));
    console.log(`\n💾 Rapport détaillé sauvegardé: ${CONFIG.outputFile}`);
    
    // Top 10 des problèmes les plus fréquents
    if (report.inconsistencies.length > 0) {
      console.log('\n🔝 TOP 10 DES INCOHÉRENCES:');
      const frequencyMap = report.inconsistencies.reduce((acc, item) => {
        acc[item.found] = (acc[item.found] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      
      Object.entries(frequencyMap)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 10)
        .forEach(([term, count], index) => {
          console.log(`   ${index + 1}. "${term}" (${count} fois)`);
        });
    }
    
    // Estimation du temps
    const criticalIssues = report.summary.bySeverity.high || 0;
    const mediumIssues = report.summary.bySeverity.medium || 0;
    const estimatedHours = Math.ceil((criticalIssues * 0.5) + (mediumIssues * 0.2));
    
    console.log(`\n⏱️  ESTIMATION: ${estimatedHours} heures pour corriger les problèmes critiques\n`);
    
    // Code de sortie basé sur la sévérité
    const exitCode = criticalIssues > 0 ? 1 : 0;
    process.exit(exitCode);
    
  } catch (error) {
    console.error('❌ Erreur lors de l\'analyse:', error);
    process.exit(1);
  }
}

// Exécuter si appelé directement
if (require.main === module) {
  main();
}

export { LanguageConsistencyChecker };