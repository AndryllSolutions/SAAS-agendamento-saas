"""
Payment Gateway Integration Service
Handles real payment gateway integrations (Mercado Pago, Stripe, PayPal)
"""
from typing import Optional, Dict, Any
from datetime import datetime
import mercadopago
import stripe
import paypalrestsdk

from app.core.config import settings


class PaymentService:
    """Service for payment gateway integrations"""
    
    # ========== MERCADO PAGO ==========
    
    @staticmethod
    def create_mercadopago_payment(
        amount: float,
        description: str,
        payer_email: str,
        payer_name: str,
        payer_phone: Optional[str] = None,
        external_reference: Optional[str] = None,
        metadata: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Create Mercado Pago payment
        
        Args:
            amount: Payment amount
            description: Payment description
            payer_email: Payer email
            payer_name: Payer name
            payer_phone: Payer phone (optional)
            external_reference: External reference (e.g., order ID)
            metadata: Additional metadata
        
        Returns:
            dict with 'id', 'status', 'payment_url', 'qr_code' (for Pix)
        """
        if not settings.MERCADOPAGO_ACCESS_TOKEN:
            raise ValueError("Mercado Pago não configurado. Configure MERCADOPAGO_ACCESS_TOKEN")
        
        sdk = mercadopago.SDK(settings.MERCADOPAGO_ACCESS_TOKEN)
        
        payment_data = {
            "transaction_amount": float(amount),
            "description": description,
            "payment_method_id": "pix",  # Default to Pix, can be changed
            "payer": {
                "email": payer_email,
                "first_name": payer_name.split()[0] if payer_name else "",
                "last_name": " ".join(payer_name.split()[1:]) if len(payer_name.split()) > 1 else "",
            }
        }
        
        if payer_phone:
            payment_data["payer"]["phone"] = {
                "area_code": payer_phone[:2] if len(payer_phone) > 2 else "",
                "number": payer_phone[2:] if len(payer_phone) > 2 else payer_phone
            }
        
        if external_reference:
            payment_data["external_reference"] = external_reference
        
        if metadata:
            payment_data["metadata"] = metadata
        
        try:
            payment_response = sdk.payment().create(payment_data)
            payment = payment_response["response"]
            
            result = {
                "id": payment.get("id"),
                "status": payment.get("status"),
                "status_detail": payment.get("status_detail"),
                "transaction_id": str(payment.get("id")),
                "payment_url": None,
                "qr_code": None,
                "qr_code_base64": None
            }
            
            # Get payment URL or QR code for Pix
            if payment.get("point_of_interaction"):
                poi = payment["point_of_interaction"]
                if poi.get("transaction_data"):
                    tx_data = poi["transaction_data"]
                    result["qr_code"] = tx_data.get("qr_code")
                    result["qr_code_base64"] = tx_data.get("qr_code_base64")
            
            # Get payment URL
            if payment.get("point_of_interaction", {}).get("transaction_data", {}).get("ticket_url"):
                result["payment_url"] = payment["point_of_interaction"]["transaction_data"]["ticket_url"]
            
            return result
        except Exception as e:
            raise ValueError(f"Erro ao criar pagamento no Mercado Pago: {str(e)}")
    
    @staticmethod
    def get_mercadopago_payment(payment_id: str) -> Dict[str, Any]:
        """Get Mercado Pago payment status"""
        if not settings.MERCADOPAGO_ACCESS_TOKEN:
            raise ValueError("Mercado Pago não configurado")
        
        sdk = mercadopago.SDK(settings.MERCADOPAGO_ACCESS_TOKEN)
        
        try:
            payment_response = sdk.payment().get(int(payment_id))
            payment = payment_response["response"]
            
            return {
                "id": payment.get("id"),
                "status": payment.get("status"),
                "status_detail": payment.get("status_detail"),
                "transaction_amount": payment.get("transaction_amount"),
                "date_approved": payment.get("date_approved"),
                "date_created": payment.get("date_created")
            }
        except Exception as e:
            raise ValueError(f"Erro ao buscar pagamento no Mercado Pago: {str(e)}")
    
    @staticmethod
    def refund_mercadopago_payment(payment_id: str, amount: Optional[float] = None) -> Dict[str, Any]:
        """Refund Mercado Pago payment"""
        if not settings.MERCADOPAGO_ACCESS_TOKEN:
            raise ValueError("Mercado Pago não configurado")
        
        sdk = mercadopago.SDK(settings.MERCADOPAGO_ACCESS_TOKEN)
        
        refund_data = {}
        if amount:
            refund_data["amount"] = float(amount)
        
        try:
            refund_response = sdk.refund().create(int(payment_id), refund_data)
            refund = refund_response["response"]
            
            return {
                "id": refund.get("id"),
                "status": refund.get("status"),
                "amount": refund.get("amount"),
                "date_created": refund.get("date_created")
            }
        except Exception as e:
            raise ValueError(f"Erro ao reembolsar pagamento no Mercado Pago: {str(e)}")
    
    # ========== STRIPE ==========
    
    @staticmethod
    def create_stripe_payment(
        amount: float,
        currency: str = "brl",
        description: str = "",
        customer_email: Optional[str] = None,
        metadata: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """Create Stripe payment intent"""
        if not settings.STRIPE_SECRET_KEY:
            raise ValueError("Stripe não configurado. Configure STRIPE_SECRET_KEY")
        
        stripe.api_key = settings.STRIPE_SECRET_KEY
        
        try:
            intent_data = {
                "amount": int(amount * 100),  # Convert to cents
                "currency": currency,
                "description": description
            }
            
            if customer_email:
                intent_data["receipt_email"] = customer_email
            
            if metadata:
                intent_data["metadata"] = metadata
            
            payment_intent = stripe.PaymentIntent.create(**intent_data)
            
            return {
                "id": payment_intent.id,
                "client_secret": payment_intent.client_secret,
                "status": payment_intent.status,
                "amount": payment_intent.amount / 100,
                "currency": payment_intent.currency
            }
        except Exception as e:
            raise ValueError(f"Erro ao criar pagamento no Stripe: {str(e)}")
    
    @staticmethod
    def get_stripe_payment(payment_id: str) -> Dict[str, Any]:
        """Get Stripe payment status"""
        if not settings.STRIPE_SECRET_KEY:
            raise ValueError("Stripe não configurado")
        
        stripe.api_key = settings.STRIPE_SECRET_KEY
        
        try:
            payment_intent = stripe.PaymentIntent.retrieve(payment_id)
            
            return {
                "id": payment_intent.id,
                "status": payment_intent.status,
                "amount": payment_intent.amount / 100,
                "currency": payment_intent.currency,
                "charges": [
                    {
                        "id": charge.id,
                        "status": charge.status,
                        "paid": charge.paid
                    }
                    for charge in payment_intent.charges.data
                ] if payment_intent.charges else []
            }
        except Exception as e:
            raise ValueError(f"Erro ao buscar pagamento no Stripe: {str(e)}")
    
    @staticmethod
    def refund_stripe_payment(payment_id: str, amount: Optional[float] = None) -> Dict[str, Any]:
        """Refund Stripe payment"""
        if not settings.STRIPE_SECRET_KEY:
            raise ValueError("Stripe não configurado")
        
        stripe.api_key = settings.STRIPE_SECRET_KEY
        
        try:
            # Get payment intent to find charge
            payment_intent = stripe.PaymentIntent.retrieve(payment_id)
            
            if not payment_intent.charges.data:
                raise ValueError("Nenhuma cobrança encontrada para este pagamento")
            
            charge_id = payment_intent.charges.data[0].id
            
            refund_data = {}
            if amount:
                refund_data["amount"] = int(amount * 100)
            
            refund = stripe.Refund.create(charge=charge_id, **refund_data)
            
            return {
                "id": refund.id,
                "status": refund.status,
                "amount": refund.amount / 100,
                "currency": refund.currency
            }
        except Exception as e:
            raise ValueError(f"Erro ao reembolsar pagamento no Stripe: {str(e)}")
    
    # ========== GENERIC METHODS ==========
    
    @staticmethod
    def create_payment(
        gateway: str,
        amount: float,
        description: str,
        payer_email: str,
        payer_name: str,
        **kwargs
    ) -> Dict[str, Any]:
        """
        Create payment using specified gateway
        
        Args:
            gateway: 'mercadopago', 'stripe', or 'paypal'
            amount: Payment amount
            description: Payment description
            payer_email: Payer email
            payer_name: Payer name
            **kwargs: Additional gateway-specific parameters
        """
        if gateway.lower() == "mercadopago":
            return PaymentService.create_mercadopago_payment(
                amount=amount,
                description=description,
                payer_email=payer_email,
                payer_name=payer_name,
                payer_phone=kwargs.get("payer_phone"),
                external_reference=kwargs.get("external_reference"),
                metadata=kwargs.get("metadata")
            )
        elif gateway.lower() == "stripe":
            return PaymentService.create_stripe_payment(
                amount=amount,
                description=description,
                customer_email=payer_email,
                metadata=kwargs.get("metadata")
            )
        else:
            raise ValueError(f"Gateway não suportado: {gateway}")
    
    @staticmethod
    def get_payment_status(gateway: str, payment_id: str) -> Dict[str, Any]:
        """Get payment status from gateway"""
        if gateway.lower() == "mercadopago":
            return PaymentService.get_mercadopago_payment(payment_id)
        elif gateway.lower() == "stripe":
            return PaymentService.get_stripe_payment(payment_id)
        else:
            raise ValueError(f"Gateway não suportado: {gateway}")
    
    @staticmethod
    def refund_payment(gateway: str, payment_id: str, amount: Optional[float] = None) -> Dict[str, Any]:
        """Refund payment from gateway"""
        if gateway.lower() == "mercadopago":
            return PaymentService.refund_mercadopago_payment(payment_id, amount)
        elif gateway.lower() == "stripe":
            return PaymentService.refund_stripe_payment(payment_id, amount)
        else:
            raise ValueError(f"Gateway não suportado: {gateway}")

