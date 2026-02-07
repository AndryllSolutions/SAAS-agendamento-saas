import { useState, useMemo } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Check, Loader2 } from 'lucide-react';
import { useCurrency } from '../contexts/CurrencyContext';
import { trpc } from '../lib/trpc';

interface PaymentOption {
  id: string;
  label: string;
  description: string;
  price: number;
  stripePriceId: string;
  billingInterval: 'monthly' | 'yearly';
  installments?: number;
}

interface PaymentOptionsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  planName: string;
  planId: number;
  monthlyPrice: number;
  monthlyStripePriceId: string;
  annualPrice: number;
  annualStripePriceId: string;
  installmentPrices: Array<{
    installments: number;
    price: number;
    stripePriceId: string;
  }>;
  onSelectPayment: (option: PaymentOption) => void;
  isLoading?: boolean;
}

export function PaymentOptionsModal({
  open,
  onOpenChange,
  planName,
  planId,
  monthlyPrice,
  monthlyStripePriceId,
  annualPrice,
  annualStripePriceId,
  installmentPrices,
  onSelectPayment,
  isLoading = false,
}: PaymentOptionsModalProps) {
  const [selectedOption, setSelectedOption] = useState<string>('monthly');
  const [couponCode, setCouponCode] = useState<string>('');
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [couponError, setCouponError] = useState<string>('');
  const [isValidatingCoupon, setIsValidatingCoupon] = useState(false);
  const { convertPrice, formatPrice } = useCurrency();

  // Mostrar opções de parcelamento apenas se Anual foi selecionado ou se um parcelamento está selecionado
  const showInstallments = selectedOption === 'annual' || selectedOption.startsWith('installment_');
  
  const paymentOptions: PaymentOption[] = useMemo(() => [
    {
      id: 'monthly',
      label: 'Mensal',
      description: 'Renovação automática todo mês',
      price: monthlyPrice,
      stripePriceId: monthlyStripePriceId,
      billingInterval: 'monthly',
    },
    {
      id: 'annual',
      label: 'Anual',
      description: 'Pagamento único no ano',
      price: annualPrice,
      stripePriceId: annualStripePriceId,
      billingInterval: 'yearly',
    },
    ...(showInstallments ? installmentPrices.map((ip) => ({
      id: `installment_${ip.installments}x`,
      label: `${ip.installments}x sem juros`,
      description: `${ip.installments} parcelas de R$ ${(ip.price).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      price: ip.price,
      stripePriceId: ip.stripePriceId,
      billingInterval: 'yearly' as const,
      installments: ip.installments,
    })) : []),
  ], [showInstallments, monthlyPrice, monthlyStripePriceId, annualPrice, annualStripePriceId, installmentPrices]);

  const selectedPaymentOption = paymentOptions.find((opt) => opt.id === selectedOption);
  const totalAmount = selectedPaymentOption?.price || 0;
  const finalAmount = appliedCoupon ? appliedCoupon.finalAmount : totalAmount;

  const validateCouponMutation = trpc.coupon.validateCoupon.useQuery(
    { code: couponCode, planId, totalAmount },
    { enabled: false }
  );

  const handleValidateCoupon = async () => {
    if (!couponCode.trim()) {
      setCouponError('Digite um código de cupom');
      return;
    }

    setIsValidatingCoupon(true);
    setCouponError('');

    try {
      const result = await validateCouponMutation.refetch();
      
      if (result.data?.valid) {
        setAppliedCoupon(result.data);
        setCouponError('');
      } else {
        setCouponError(result.data?.error || 'Cupom inválido');
        setAppliedCoupon(null);
      }
    } catch (error) {
      setCouponError('Erro ao validar cupom');
      setAppliedCoupon(null);
    } finally {
      setIsValidatingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
    setCouponError('');
  };

  const handleContinue = () => {
    const selected = paymentOptions.find((opt) => opt.id === selectedOption);
    if (selected) {
      // Passar informações do cupom junto com a opção de pagamento
      const paymentData = {
        ...selected,
        couponCode: appliedCoupon ? couponCode : undefined,
        couponDiscount: appliedCoupon?.discountAmount,
        couponId: appliedCoupon?.couponId,
        finalAmount: finalAmount,
        discountType: appliedCoupon?.discountType,
        discountValue: appliedCoupon?.discountValue,
      };
      onSelectPayment(paymentData as any);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Escolha seu plano de pagamento</DialogTitle>
          <DialogDescription>
            Selecione como deseja pagar o plano {planName}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <RadioGroup value={selectedOption} onValueChange={setSelectedOption}>
            {paymentOptions.map((option) => (
              <div key={option.id} className="flex items-start space-x-3">
                <RadioGroupItem value={option.id} id={option.id} className="mt-1" />
                <Label
                  htmlFor={option.id}
                  className="flex-1 cursor-pointer rounded-lg border border-border p-4 hover:bg-accent transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-semibold text-foreground">{option.label}</p>
                      <p className="text-sm text-muted-foreground">{option.description}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-primary">
                        {formatPrice(convertPrice(option.price))}
                      </p>
                      {option.billingInterval === 'monthly' && (
                        <p className="text-xs text-muted-foreground">/mês</p>
                      )}
                      {option.billingInterval === 'yearly' && !option.installments && (
                        <p className="text-xs text-muted-foreground">/ano</p>
                      )}
                      {option.installments && (
                        <p className="text-xs text-muted-foreground">/parcela</p>
                      )}
                    </div>
                  </div>
                </Label>
              </div>
            ))}
          </RadioGroup>

          {/* Campo de Cupom de Desconto */}
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="pt-6">
              <div className="space-y-3">
                <Label className="text-sm font-semibold">Código de Cupom (Opcional)</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Digite seu código de cupom"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    disabled={isValidatingCoupon || !!appliedCoupon}
                    className="flex-1"
                  />
                  {!appliedCoupon ? (
                    <Button
                      onClick={handleValidateCoupon}
                      disabled={isValidatingCoupon || !couponCode.trim()}
                      variant="outline"
                      className="w-24"
                    >
                      {isValidatingCoupon ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        'Aplicar'
                      )}
                    </Button>
                  ) : (
                    <Button
                      onClick={handleRemoveCoupon}
                      variant="outline"
                      className="w-24"
                    >
                      Remover
                    </Button>
                  )}
                </div>
                {couponError && (
                  <p className="text-sm text-red-600">{couponError}</p>
                )}
                {appliedCoupon && (
                  <div className="flex items-center gap-2 text-green-600 text-sm">
                    <Check className="w-4 h-4" />
                    <span>Cupom aplicado! Desconto de {appliedCoupon.discountType === 'percentage' ? `${appliedCoupon.discountValue}%` : `R$ ${appliedCoupon.discountValue}`}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Resumo do total */}
          <Card className="bg-muted/50">
            <CardContent className="pt-6">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Plano</span>
                  <span className="font-medium">{planName}</span>
                </div>
                {selectedOption === 'monthly' && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Cobrança</span>
                    <span className="font-medium">Mensal (renovação automática)</span>
                  </div>
                )}
                {selectedOption === 'annual' && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Cobrança</span>
                    <span className="font-medium">Única (anual)</span>
                  </div>
                )}
                {selectedOption.startsWith('installment_') && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Cobrança</span>
                    <span className="font-medium">
                      {paymentOptions.find((opt) => opt.id === selectedOption)?.installments}x sem juros
                    </span>
                  </div>
                )}
                {appliedCoupon && (
                  <>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span className="font-medium">{formatPrice(convertPrice(totalAmount))}</span>
                    </div>
                    <div className="flex justify-between text-sm text-green-600">
                      <span>Desconto ({appliedCoupon.discountType === 'percentage' ? `${appliedCoupon.discountValue}%` : `R$ ${appliedCoupon.discountValue}`})</span>
                      <span className="font-medium">-{formatPrice(convertPrice(appliedCoupon.discountAmount))}</span>
                    </div>
                  </>
                )}
                <div className="border-t border-border pt-2 mt-2 flex justify-between">
                  <span className="font-semibold">Total</span>
                  <span className="font-bold text-lg text-primary">
                    {formatPrice(convertPrice(finalAmount))}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex gap-3 justify-end">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleContinue}
            disabled={isLoading}
            className="bg-primary hover:bg-primary/90"
          >
            {isLoading ? 'Processando...' : 'Continuar para Pagamento'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
