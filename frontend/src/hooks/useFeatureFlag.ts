/**
 * Hook to check feature access based on company plan
 */
import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import api from '@/services/api';

interface PlanFeatures {
  [key: string]: string[];
}

const PLAN_FEATURES: PlanFeatures = {
  ESSENCIAL: [
    'clients',
    'services',
    'products',
    'appointments',
    'commands',
    'financial_basic',
    'reports_basic',
  ],
  PRO: [
    'clients',
    'services',
    'products',
    'appointments',
    'commands',
    'financial_complete',
    'reports_complete',
    'packages',
    'commissions',
    'goals',
    'anamneses',
    'purchases',
    'evaluations',
    'whatsapp_marketing',
  ],
  PREMIUM: [
    'clients',
    'services',
    'products',
    'appointments',
    'commands',
    'financial_complete',
    'reports_complete',
    'packages',
    'commissions',
    'goals',
    'anamneses',
    'purchases',
    'evaluations',
    'whatsapp_marketing',
    'cashback',
    'promotions',
    'subscription_sales',
    'document_generator',
    'invoices',
    'online_booking',
    'pricing_intelligence',
    'advanced_reports',
    'professional_ranking',
    'client_funnel',
  ],
  SCALE: [
    'clients',
    'services',
    'products',
    'appointments',
    'commands',
    'financial_complete',
    'reports_complete',
    'packages',
    'commissions',
    'goals',
    'anamneses',
    'purchases',
    'evaluations',
    'whatsapp_marketing',
    'cashback',
    'promotions',
    'subscription_sales',
    'document_generator',
    'invoices',
    'online_booking',
    'pricing_intelligence',
    'advanced_reports',
    'professional_ranking',
    'client_funnel',
    'crm_advanced',
    'automatic_campaigns',
    'multi_unit_reports',
    'priority_support',
    'programa_crescer',
  ],
};

const FEATURE_PLANS: { [key: string]: string } = {
  // PRO features
  financial_complete: 'PRO',
  reports_complete: 'PRO',
  packages: 'PRO',
  commissions: 'PRO',
  goals: 'PRO',
  anamneses: 'PRO',
  whatsapp_marketing: 'PRO',
  
  // PREMIUM features
  cashback: 'PREMIUM',
  promotions: 'PREMIUM',
  subscription_sales: 'PREMIUM',
  document_generator: 'PREMIUM',
  invoices: 'PREMIUM',
  online_booking: 'PREMIUM',
  pricing_intelligence: 'PREMIUM',
  advanced_reports: 'PREMIUM',
  professional_ranking: 'PREMIUM',
  client_funnel: 'PREMIUM',
  
  // SCALE features
  crm_advanced: 'SCALE',
  automatic_campaigns: 'SCALE',
  multi_unit_reports: 'SCALE',
  priority_support: 'SCALE',
  programa_crescer: 'SCALE',
};

export function useFeatureFlag(feature: string) {
  const { user } = useAuthStore();
  const [hasAccess, setHasAccess] = useState(false);
  const [plan, setPlan] = useState<string>('BASIC');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAccess = async () => {
      // Super Admin (SAAS_ADMIN) tem acesso total a todas as features
      if (user?.role === 'SAAS_ADMIN' || user?.role === 'ADMIN') {
        setHasAccess(true);
        setPlan('ENTERPRISE');
        setLoading(false);
        return;
      }

      if (!user?.company_id) {
        setHasAccess(false);
        setLoading(false);
        return;
      }

      try {
        // Get company info to check plan
        const response = await api.get(`/companies/${user.company_id}`);
        const companyPlan = response.data.subscription_plan || 'BASIC';
        setPlan(companyPlan);

        const features = PLAN_FEATURES[companyPlan] || PLAN_FEATURES.BASIC;
        setHasAccess(features.includes(feature));
      } catch (error) {
        console.error('Error checking feature access:', error);
        setHasAccess(false);
      } finally {
        setLoading(false);
      }
    };

    checkAccess();
  }, [feature, user?.company_id, user?.role]);

  const requiredPlan = FEATURE_PLANS[feature] || 'BASIC';

  return {
    hasAccess,
    plan,
    requiredPlan,
    loading,
    needsUpgrade: !hasAccess && requiredPlan !== 'BASIC',
  };
}

