export interface CollectionCollectionInterface {
  _id?: string; 
  userid: string;
  status: string;
  shipping_id: {
    _id: string,
    carrier_name: string
  };
  reference_soloenvios_shipment_id: string;
  soloenvios_pickup_id:string,
  packages: number;
  carrier_name:string;
  total_weight: string;
  scheduled_from: Date; 
  scheduled_to: Date;  
  name_address: string;
  company?: string;
  country: string;
  postal_code: string;
  state: string;
  municipality: string;
  neighborhood: string;
  street: string;
  number_int?: string;
  references?: string;
  created_at?: Date;
  updated_at?: Date;
}


interface PickupDates {
  date: string;       
  startHour: string; 
  endHour: string;  
}



export interface CollectionDatesInterface {
    success: boolean;
    carrier: string;          
    service: string;        
    version: string;         
    pickupDates: PickupDates[];
}



export interface IDataCollection {
  reference_shipment_id: string;
  packages: number;
  total_weight: string;
  scheduled_from: string;
  scheduled_to: string;
}

export interface CollectionCreateRequest {
  pickup: IDataCollection;
}