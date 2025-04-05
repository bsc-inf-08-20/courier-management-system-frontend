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
    origin_address: string;
    destination_address: string;
    collected_at?: string;
    origin_hub_confirmed_at?: string;
    dispatched_at?: string;
    destination_hub_confirmed_at?: string | null;
    out_for_delivery_at?: string | null;
    delivered_at?: string | null;
    received_at?: string | null;
    hub_confirmed_at?: string | null;
    confirmed_by_origin?: boolean;
    assigned_vehicle?: Vehicle | null;
    pickup?: {
      customer: Customer;
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
    status: string; // Add status field
    assigned_packets: Packet[];
  }