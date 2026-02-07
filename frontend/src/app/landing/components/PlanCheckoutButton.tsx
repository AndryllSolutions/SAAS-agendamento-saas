import { Button } from "./ui/button";
import { PaymentOptionsModal } from "./PaymentOptionsModal";
import { trpc } from "../lib/trpc";
import { Loader2 } from "lucide-react";
import { useState } from "react";

interface PlanCheckoutButtonProps {
  planName: "essential" | "pro" | "premium" | "scale";
  currency?: string;
  language?: string;
  className?: string;
  children?: React.ReactNode;
}

const planNameMap: Record<string, string> = {
  essential: "Essencial",
  pro: "Profissional",
  premium: "Premium",
  scale: "Scale",
};

export default function PlanCheckoutButton({
  planName,
  currency,
  language,
  className,
  children,
}: PlanCheckoutButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showPaymentOptions, setShowPaymentOptions] = useState(false);
  const [selectedPricingId, setSelectedPricingId] = useState<string | null>(null);

  const { data: plans } = trpc.subscription.listPlans.useQuery();

  const createCheckoutMutation = trpc.subscription.createCheckoutSession.useMutation({
    onSuccess: (data) => {
      if (data.checkoutUrl) {
        window.open(data.checkoutUrl, "_blank");
        setShowEmailModal(false);
        setShowPaymentOptions(false);
        setEmail("");
      }
    },
    onError: (error) => {
      alert(`Erro ao criar sessão: ${error.message}`);
    },
  });

  const validateEmail = (emailValue: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(emailValue);
  };

  const handleCheckout = () => {
    setShowPaymentOptions(true);
  };

  const handlePaymentOptionSelected = async (option: any) => {
    setSelectedPricingId(option.stripePriceId);
    if (option.couponCode) {
      localStorage.setItem('appliedCoupon', JSON.stringify({
        code: option.couponCode,
        couponId: option.couponId,
        discountType: option.discountType,
        discountValue: option.discountValue,
        finalAmount: option.finalAmount,
      }));
    } else {
      localStorage.removeItem('appliedCoupon');
    }
    setShowPaymentOptions(false);
    setShowEmailModal(true);
  };

  const handleConfirmCheckout = async () => {
    if (!email.trim()) {
      alert("Por favor, insira seu email");
      return;
    }

    if (!validateEmail(email)) {
      alert("Por favor, insira um email válido");
      return;
    }

    if (!selectedPricingId) {
      alert("Plano não encontrado");
      return;
    }

    setIsLoading(true);
    try {
      const appliedCouponStr = localStorage.getItem('appliedCoupon');
      const appliedCoupon = appliedCouponStr ? JSON.parse(appliedCouponStr) : null;
      
      await createCheckoutMutation.mutateAsync({ 
        stripePriceId: selectedPricingId, 
        email,
        couponCode: appliedCoupon?.code,
        couponId: appliedCoupon?.couponId,
      });
      
      localStorage.removeItem('appliedCoupon');
    } finally {
      setIsLoading(false);
    }
  };

  const realPlanName = planNameMap[planName];
  const monthlyPlan = plans?.find((p) => p.name === realPlanName && p.billingInterval === "monthly");
  const annualPlan = plans?.find((p) => p.name === realPlanName && p.billingInterval === "yearly" && (!p.installments || p.installments === 1));
  const installmentPlans = plans?.filter((p) => p.name === realPlanName && p.billingInterval === "yearly" && p.installments && p.installments > 1) || [];

  const isReady = monthlyPlan && annualPlan;

  return (
    <>
      <Button
        onClick={handleCheckout}
        disabled={isLoading || createCheckoutMutation.isPending || !isReady}
        className={className || "w-full"}
      >
        {isLoading || createCheckoutMutation.isPending ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processando...
          </>
        ) : (
          children || "Começar Agora"
        )}
      </Button>

      <PaymentOptionsModal
        open={showPaymentOptions}
        onOpenChange={setShowPaymentOptions}
        planName={realPlanName}
        planId={monthlyPlan?.id || 0}
        monthlyPrice={typeof monthlyPlan?.price === 'string' ? parseFloat(monthlyPlan.price) : (monthlyPlan?.price || 0)}
        monthlyStripePriceId={monthlyPlan?.stripePriceId || ""}
        annualPrice={typeof annualPlan?.price === 'string' ? parseFloat(annualPlan.price) : (annualPlan?.price || 0)}
        annualStripePriceId={annualPlan?.stripePriceId || ""}
        installmentPrices={installmentPlans.map((p) => ({
          installments: p.installments || 1,
          price: typeof p.price === 'string' ? parseFloat(p.price) : p.price,
          stripePriceId: p.stripePriceId,
        }))}
        onSelectPayment={handlePaymentOptionSelected}
        isLoading={isLoading}
      />

      {showEmailModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">Insira seu email</h3>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  handleConfirmCheckout();
                }
              }}
              placeholder="seu@email.com"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary mb-4"
              autoFocus
            />
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setShowEmailModal(false);
                  setEmail("");
                }}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleConfirmCheckout}
                disabled={isLoading}
                className="flex-1 bg-primary hover:bg-primary/90"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processando...
                  </>
                ) : (
                  "Continuar"
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
