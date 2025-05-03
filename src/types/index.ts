// src/types/payment.ts
export interface PaymentStatus {
    event_type: string;
    tx_ref: string;
    mode: string;
    type: string;
    status: string;
    number_of_attempts: number;
    reference: string;
    currency: string;
    amount: number;
    charges: number;
    customization: {
      title: string | null;
      description: string | null;
      logo: string | null;
    };
    meta: any;
    authorization: {
      channel: string;
      card_number: string | null;
      expiry: string | null;
      brand: string | null;
      provider: string | null;
      mobile_number: string | null;
      completed_at: string;
    };
    customer: {
      email: string;
      first_name: string;
      last_name: string;
    };
    logs: any[];
    created_at: string;
    updated_at: string;
  }