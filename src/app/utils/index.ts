import { FormFields } from "@/components/orderDrawer";
import { ResponseFindAddressByCP } from "@/type/dipomex";
import type {
  Parcel,
  Quotation,
  RateSoloenvios,
  QuotationSoloenviosRequest,
} from "@/type/soloenvios-quote";
import { ShipmentSoloenviosRequest } from "@/type/soloenvios-shipment";

export const capitalizeFirstLetter = (str: string) => {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1);
};

export const buildPayloadQuoteSoloenvios = (
  address_from: ResponseFindAddressByCP,
  address_to: ResponseFindAddressByCP,
  parcels: Parcel[]
): QuotationSoloenviosRequest => {
  return {
    quotation: {
      address_from: {
        country_code: "MX",
        postal_code: address_from?.codigo_postal?.codigo_postal,
        area_level1: address_from?.codigo_postal?.estado,
        area_level2: address_from?.codigo_postal?.municipio,
        area_level3: address_from?.codigo_postal?.colonias?.[0],
      },
      address_to: {
        country_code: "MX",
        postal_code: address_to?.codigo_postal?.codigo_postal,
        area_level1: address_to?.codigo_postal?.estado,
        area_level2: address_to?.codigo_postal?.municipio,
        area_level3: address_to?.codigo_postal?.colonias?.[0],
      },
      parcels: parcels,
      requested_carriers: ["fedex", "dhl", "estafeta", "paquetexpress","ups"],
      colonies_to:address_to?.codigo_postal?.colonias ?? [],
      colonies_from:address_from?.codigo_postal?.colonias ?? []
    },
  };
};



export const CourierOptionFromQuoteSoloenvios = (
  quote: Quotation,
  source:string
): Array<{
  id: string;
  courier: string;
  logo: string;
  type: string;
  cost: number;
  time: string;
  source?:string
}> => {
  let data: any = [];

  quote?.rates?.forEach((rate: RateSoloenvios) => {
    if (rate?.success) {
      let logo = null
      if(rate?.provider_name === "dhl") logo= LogoDHL
      if(rate?.provider_name === "estafeta") logo= LogoEstafeta
      if(rate?.provider_name === "paquetexpress") logo= LogoPaqueteExpress
      if(rate?.provider_name === "fedex") logo= LogoFedex
      if(rate?.provider_name === "ups") logo= LogoUps
      data.push({
        id: rate?.id,
        courier: rate?.provider_display_name,
        logo,
        type: rate?.provider_service_name,
        cost: rate?.total,
        time: `${rate?.days} Días`,
        source,
        pickup:rate?.pickup
      });
    }
  });

  return data;
};

export const buildPayloadshipmentSoloenvios = (
  address_from: FormFields,
  address_to: FormFields,
  rate_id: string,
  consignment_note:string,
  package_type:string

): ShipmentSoloenviosRequest => {
  return {
    shipment: {
      rate_id: rate_id,
      printing_format: "standard",
      address_from: {
        street1:
          address_from?.street +
          " " +
          address_from?.extNumber +
          " " +
          (address_from?.intNumber ? address_from?.intNumber : ""),
        name: address_from?.name,
        company: address_from?.company,
        phone: address_from?.phone,
        email: process.env.NEXT_EMAIL_TIMETREK,
        reference: address_from?.references,
      },
      address_to: {
        street1:
          address_to?.street +
          " " +
          address_to?.extNumber +
          " " +
          (address_to?.intNumber ? address_to?.intNumber : ""),
        name: address_to?.name,
        company: address_to?.company,
        phone: address_to?.phone,
        email: address_to?.email,
        reference: address_to?.references,
      },
      packages: [
        {
          package_number: "1",
          package_protected: false,
          consignment_note,
          package_type,
          declared_value: 0,
        },
      ],
    },
  };
};

export const formatDate = (utcDate: string) => {
  const date = new Date(utcDate);
  return new Intl.DateTimeFormat("es-MX", {
    dateStyle: "long",
    timeStyle: "short",
  }).format(date);
};

export const STATUS_OPTIONS_SOLOENVIOS = [
  "Guía creada",
  "Excepción",
  "Recogido",
  "En tránsito",
  "Última milla",
  "Intento de entrega",
  "Entregado",
  "Entregado en sucursal",
  "En devolución",
  "Cancelado",
  "En proceso",
];

export const statusMap: Record<string, string> = {
  created: "Guía creada",
  exception: "Excepción",
  picked_up: "Recogido",
  in_transit: "En tránsito",
  last_mile: "Última milla",
  delivery_attempt: "Intento de entrega",
  delivered: "Entregado",
  delivered_to_branch: "Entregado en sucursal",
  in_return: "En devolución",
  in_progress: "En proceso",
  cancelled: "Cancelado",
};

export const LogoFedex =
  "https://i.postimg.cc/nhMzktLM/CITYPNG-COM-Fed-Ex-Delivery-Company-Logo-HD-PNG-5000x5000.png";

  export const LogoDHL =
  "https://i.postimg.cc/9XsFPv5v/Captura-de-pantalla-2025-11-09-a-la-s-7-27-42-p-m.png";

  export const LogoEstafeta =
  "https://i.postimg.cc/t4G0mrQH/Logo-Estafeta.png";

  export const LogoPaqueteExpress =
  "https://i.postimg.cc/hGG4sSdR/Paquetexpress.png";


  export const LogoUps =
  "https://i.postimg.cc/90Jqg7n0/Captura-de-pantalla-2025-11-07-a-la-s-4-34-36-p-m-removebg-preview.png";

 


  // Opcionalmente, puedes definir la interfaz para un mejor tipado en TypeScript:
  /*
  export interface ProductoCartaPorte {
    clave: string;
    descripcion: string;
  }
  */