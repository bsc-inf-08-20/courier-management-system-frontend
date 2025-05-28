// types.ts
export interface Customer {
  user_id: number;
  name: string;
  email: string;
  phone_number: string;
  city: string;
}

export interface Packet {
  id: number;
  description: string;
  status: string;
  weight: number;
  category: string;
  delivery_type: string;
  origin_city: string;
  destination_address: string;
  collected_at?: string;
  origin_hub_confirmed_at?: string;
  dispatched_at?: string;
  destination_hub?: string;
  destination_hub_confirmed_at?: string;
  out_for_delivery_at?: string;
  delivered_at?: Date;
  received_at?: string;
  hub_confirmed_at?: string;
  confirmed_by_origin?: boolean;
  assigned_vehicle?: Vehicle | null;
  assigned_delivery_agent?: Agent | null;
  pickup?: {
    customer: Customer;
  };
  receiver: {
    name: string;
    phone_number: string;
    address: string;
    email: string;
  };
  sender: {
    name: string;
    phone_number: string;
    address: string;
    email: string;
  };
}

export interface Vehicle {
  id: number;
  make: string;
  model: string;
  year: number;
  license_plate: string;
  vehicle_type: string;
  capacity: number;
  current_load: number;
  is_active: boolean;
  is_in_maintenance: boolean;
  current_city: string;
  destination_city?: string;
  status: string;
  assigned_packets: Packet[];
}

export interface Agent {
  user_id: number;
  name: string;
  email: string;
  phone_number: string;
  city: string;
}

export enum PackageCategory {
  SMALL = "SMALL",
  MEDIUM = "MEDIUM",
  LARGE = "LARGE",
}

// export type PaymentStatus = {
//   authorization: any;
//   logs: any[];
//   updated_at: string;
//   event_type: string;
//   tx_ref: string;
//   mode: string;
//   type: string;
//   status: string;
//   amount: number;
//   currency: string;
//   number_of_attempts: number;
//   charges: {
//     [key: string]: any;
//   };
//   customization: {
//     title?: string;
//     description?: string;
//     logo?: string;
//   };
//   meta: {
//     [key: string]: any;
//   };
//   customer: {
//     name: string;
//     email: string;
//   };
//   created_at: string;
//   payment_method: string;
//   transaction_id: string;
//   reference: string;
//   metadata?: {
//     [key: string]: any;
//   };
// };
