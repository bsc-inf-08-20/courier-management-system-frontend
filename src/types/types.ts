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
    destination_hub_confirmed_at?: string;
    out_for_delivery_at?: string;
    delivered_at?: string;
    received_at?: string;
    hub_confirmed_at?: string;
    confirmed_by_origin?: boolean;
    assigned_vehicle?: Vehicle | null;
    assigned_delivery_agent?: Agent | null;
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