"""
Razorpay Payment Gateway Integration
"""
import os
import razorpay
from flask import Blueprint, request, jsonify
from functools import wraps
import hmac
import hashlib

payment_bp = Blueprint('payment', __name__)

# Initialize Razorpay client
razorpay_client = razorpay.Client(
    auth=(
        os.environ.get('RAZORPAY_KEY_ID', ''),
        os.environ.get('RAZORPAY_KEY_SECRET', '')
    )
)

# Pricing plans (amounts in paise - 100 paise = 1 INR)
PRICING_PLANS = {
    'basic': {
        'name': 'Basic',
        'amount': 1000 * 100,  # ₹1000 or $10 equivalent
        'currency': 'INR',
        'description': 'Basic Plan - Up to 10 employees',
        'employees': 10,
        'features': ['Core separation workflows', 'Basic checklists', 'Email support']
    },
    'pro': {
        'name': 'Pro',
        'amount': 2500 * 100,  # ₹2500 or $25 equivalent
        'currency': 'INR',
        'description': 'Pro Plan - Up to 50 employees',
        'employees': 50,
        'features': ['Advanced workflows', 'Custom checklists', 'Priority support', 'API access']
    },
    'enterprise': {
        'name': 'Enterprise',
        'amount': 5500 * 100,  # ₹5500 or $55 equivalent
        'currency': 'INR',
        'description': 'Enterprise Plan - Unlimited employees',
        'employees': -1,  # Unlimited
        'features': ['Custom workflows', 'White-label options', 'Dedicated support', 'SSO integration']
    }
}


@payment_bp.route('/plans', methods=['GET'])
def get_plans():
    """Get all available pricing plans"""
    plans = []
    for plan_id, plan in PRICING_PLANS.items():
        plans.append({
            'id': plan_id,
            'name': plan['name'],
            'amount': plan['amount'] / 100,  # Convert to rupees
            'currency': plan['currency'],
            'description': plan['description'],
            'employees': plan['employees'],
            'features': plan['features']
        })
    return jsonify({'plans': plans})


@payment_bp.route('/create-order', methods=['POST'])
def create_order():
    """Create a Razorpay order for payment"""
    try:
        data = request.get_json()
        plan_id = data.get('plan_id')
        
        if plan_id not in PRICING_PLANS:
            return jsonify({'error': 'Invalid plan selected'}), 400
        
        plan = PRICING_PLANS[plan_id]
        
        # Create Razorpay order
        order_data = {
            'amount': plan['amount'],
            'currency': plan['currency'],
            'receipt': f'order_{plan_id}_{os.urandom(4).hex()}',
            'notes': {
                'plan_id': plan_id,
                'plan_name': plan['name']
            }
        }
        
        order = razorpay_client.order.create(data=order_data)
        
        return jsonify({
            'order_id': order['id'],
            'amount': order['amount'],
            'currency': order['currency'],
            'key_id': os.environ.get('RAZORPAY_KEY_ID'),
            'plan': {
                'id': plan_id,
                'name': plan['name'],
                'description': plan['description']
            }
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@payment_bp.route('/verify', methods=['POST'])
def verify_payment():
    """Verify Razorpay payment signature"""
    try:
        data = request.get_json()
        
        razorpay_order_id = data.get('razorpay_order_id')
        razorpay_payment_id = data.get('razorpay_payment_id')
        razorpay_signature = data.get('razorpay_signature')
        plan_id = data.get('plan_id')
        
        # Verify signature
        key_secret = os.environ.get('RAZORPAY_KEY_SECRET', '')
        
        msg = f"{razorpay_order_id}|{razorpay_payment_id}"
        generated_signature = hmac.new(
            key_secret.encode(),
            msg.encode(),
            hashlib.sha256
        ).hexdigest()
        
        if generated_signature != razorpay_signature:
            return jsonify({'error': 'Invalid payment signature'}), 400
        
        # Payment verified successfully
        # TODO: Update user subscription in database
        # TODO: Send confirmation email
        
        return jsonify({
            'success': True,
            'message': 'Payment verified successfully',
            'payment_id': razorpay_payment_id,
            'plan_id': plan_id
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@payment_bp.route('/webhook', methods=['POST'])
def webhook():
    """Handle Razorpay webhooks"""
    try:
        webhook_secret = os.environ.get('RAZORPAY_WEBHOOK_SECRET', '')
        webhook_signature = request.headers.get('X-Razorpay-Signature', '')
        webhook_body = request.get_data(as_text=True)
        
        # Verify webhook signature
        if webhook_secret:
            expected_signature = hmac.new(
                webhook_secret.encode(),
                webhook_body.encode(),
                hashlib.sha256
            ).hexdigest()
            
            if expected_signature != webhook_signature:
                return jsonify({'error': 'Invalid webhook signature'}), 400
        
        event = request.get_json()
        event_type = event.get('event')
        
        if event_type == 'payment.captured':
            # Payment successful
            payment = event['payload']['payment']['entity']
            # TODO: Update subscription status
            print(f"Payment captured: {payment['id']}")
            
        elif event_type == 'payment.failed':
            # Payment failed
            payment = event['payload']['payment']['entity']
            # TODO: Handle failed payment
            print(f"Payment failed: {payment['id']}")
        
        return jsonify({'status': 'ok'})
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500
