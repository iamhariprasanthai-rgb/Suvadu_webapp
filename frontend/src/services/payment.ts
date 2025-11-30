import api from './api';

export interface Plan {
  id: string;
  name: string;
  amount: number;
  currency: string;
  description: string;
  employees: number;
  features: string[];
}

export interface CreateOrderResponse {
  order_id: string;
  amount: number;
  currency: string;
  key_id: string;
  plan: {
    id: string;
    name: string;
    description: string;
  };
}

export interface VerifyPaymentRequest {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
  plan_id: string;
}

export const paymentService = {
  // Get all available plans
  getPlans: async (): Promise<Plan[]> => {
    const response = await api.get('/payment/plans');
    return response.data.plans;
  },

  // Create a payment order
  createOrder: async (planId: string): Promise<CreateOrderResponse> => {
    const response = await api.post('/payment/create-order', { plan_id: planId });
    return response.data;
  },

  // Verify payment after completion
  verifyPayment: async (data: VerifyPaymentRequest): Promise<{ success: boolean; message: string }> => {
    const response = await api.post('/payment/verify', data);
    return response.data;
  },
};

// Razorpay types
declare global {
  interface Window {
    Razorpay: any;
  }
}

// Load Razorpay script dynamically
export const loadRazorpayScript = (): Promise<boolean> => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

// Initialize Razorpay payment
export const initiatePayment = async (
  planId: string,
  onSuccess: (response: any) => void,
  onError: (error: any) => void
) => {
  try {
    // Load Razorpay script
    const loaded = await loadRazorpayScript();
    if (!loaded) {
      throw new Error('Failed to load Razorpay SDK');
    }

    // Create order
    const orderData = await paymentService.createOrder(planId);

    // Configure Razorpay options
    const options = {
      key: orderData.key_id,
      amount: orderData.amount,
      currency: orderData.currency,
      name: 'Suvadu',
      description: orderData.plan.description,
      order_id: orderData.order_id,
      handler: async (response: any) => {
        try {
          // Verify payment
          const verifyData = await paymentService.verifyPayment({
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
            plan_id: planId,
          });
          
          if (verifyData.success) {
            onSuccess(verifyData);
          } else {
            onError(new Error('Payment verification failed'));
          }
        } catch (err) {
          onError(err);
        }
      },
      prefill: {
        name: '',
        email: '',
        contact: '',
      },
      theme: {
        color: '#0D9488', // Teal color to match Suvadu branding
      },
      modal: {
        ondismiss: () => {
          console.log('Payment modal closed');
        },
      },
    };

    // Open Razorpay checkout
    const razorpay = new window.Razorpay(options);
    razorpay.on('payment.failed', (response: any) => {
      onError(response.error);
    });
    razorpay.open();
    
  } catch (error) {
    onError(error);
  }
};
