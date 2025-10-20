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
      requested_carriers: ["fedex", "dhl"],
    },
  };
};

export const logosCourier = [
  {
    courier: "DHL",
    logo: "https://assets.envia.com/uploads/logos/carriers/dhl.svg",
  },
];

export const CourierOptionFromQuoteSoloenvios = (
  quote: Quotation
): Array<{
  id: string;
  courier: string;
  logo: string;
  type: string;
  cost: number;
  time: string;
}> => {
  let data: any = [];

  quote?.rates?.forEach((rate: RateSoloenvios) => {
    if (rate?.success) {
      data.push({
        id: rate?.id,
        courier: rate?.provider_display_name,
        logo:
          rate?.provider_display_name === "DHL"
            ? LogoDHL
            : LogoFedex,
        type: rate?.provider_service_name,
        cost: rate?.total,
        time: `${rate?.days} Días`,
      });
    }
  });

  return data;
};

export const buildPayloadshipmentSoloenvios = (
  address_from: FormFields,
  address_to: FormFields,
  rate_id: string,
  consignment_note:string
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
          package_type: "4G",
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
  "https://assets.envia.com/uploads/logos/carriers/dhl.svg";



  export const CartaPorteData = [

    {
      "clave": "10111300",
      "descripcion": "Accesorios, equipo y tratamientos para los animales domésticos"
    },
    {
      "clave": "10111301",
      "descripcion": "Juguetes para mascotas"
    },
    {
      "clave": "10111302",
      "descripcion": "Productos para el aseo y cuidado de mascotas"
    },
    {
      "clave": "10111303",
      "descripcion": "Equipo para el manejo de desperdicios de las mascotas"
    },
    {
      "clave": "10111304",
      "descripcion": "Tazones o equipo para alimentación de mascotas"
    },
    {
      "clave": "10111305",
      "descripcion": "Tratamientos medicados para mascotas"
    },
    {
      "clave": "10111306",
      "descripcion": "Kits para el entrenamiento de mascotas domésticas"
    },
    {
      "clave": "10111307",
      "descripcion": "Cobijas para mascotas"
    },
    {
      "clave": "10121500",
      "descripcion": "Pienso para ganado"
    },
    {
      "clave": "10121501",
      "descripcion": "Salvado de trigo puro"
    },
    {
      "clave": "10121502",
      "descripcion": "Avena para forraje"
    },
    {
      "clave": "10121503",
      "descripcion": "Maíz para forraje"
    },
    {
      "clave": "10121504",
      "descripcion": "Sorgo para forraje"
    },
    {
      "clave": "10121505",
      "descripcion": "Heno"
    },
    {
      "clave": "10121506",
      "descripcion": "Tortas oleaginosas"
    },
    {
      "clave": "10121507",
      "descripcion": "Forraje compuesto"
    },
    {
      "clave": "10121600",
      "descripcion": "Alimento para pájaros y aves de corral"
    },
    {
      "clave": "10121601",
      "descripcion": "Alimento vivo para aves"
    },
    {
      "clave": "10121602",
      "descripcion": "Alpiste"
    },
    {
      "clave": "10121603",
      "descripcion": "Botanas o comida recreacional para aves"
    },
    {
      "clave": "10121604",
      "descripcion": "Alimento avícola"
    },
    {
      "clave": "10121700",
      "descripcion": "Alimento para peces"
    },
    {
      "clave": "10121701",
      "descripcion": "Salmuera fresca o congelada"
    },
    {
      "clave": "10121702",
      "descripcion": "Alimento granulado para peces"
    },
    {
      "clave": "10121703",
      "descripcion": "Alimento en hojuelas para peces"
    },
    {
      "clave": "10121800",
      "descripcion": "Alimento para perros y gatos"
    },
    {
      "clave": "10121801",
      "descripcion": "Comida seca para perros"
    },
    {
      "clave": "10121802",
      "descripcion": "Comida húmeda para perros"
    },
    {
      "clave": "10121803",
      "descripcion": "Leche para perros o gatos"
    },
    {
      "clave": "10121804",
      "descripcion": "Comida seca para gatos"
    },
    {
      "clave": "10121805",
      "descripcion": "Comida húmeda para gatos"
    },
    {
      "clave": "10121806",
      "descripcion": "Botanas o comida recreacional para gatos o perros"
    },
    {
      "clave": "10121900",
      "descripcion": "Alimento para roedores"
    },
    {
      "clave": "10121901",
      "descripcion": "Comida granulada para roedores"
    },
    {
      "clave": "10122100",
      "descripcion": "Comida para animales variados"
    },
    {
      "clave": "10122101",
      "descripcion": "Comida para cerdos"
    },
    {
      "clave": "10122102",
      "descripcion": "Comida para visones"
    },
    {
      "clave": "10122103",
      "descripcion": "Comida para monos"
    },
    {
      "clave": "10122104",
      "descripcion": "Comida para conejos"
    },
    {
      "clave": "10131500",
      "descripcion": "Cobertizos para animales"
    },
    {
      "clave": "10131506",
      "descripcion": "Establos para ganado"
    },
    {
      "clave": "10131507",
      "descripcion": "Casas para mascotas domesticadas"
    },
    {
      "clave": "10131508",
      "descripcion": "Camas para mascotas"
    },
    {
      "clave": "10131600",
      "descripcion": "Recipientes para animales"
    },
    {
      "clave": "10131601",
      "descripcion": "Jaulas o sus accesorios"
    },
    {
      "clave": "10131602",
      "descripcion": "Perreras"
    },
    {
      "clave": "10131603",
      "descripcion": "Equipaje para el transporte de animales"
    },
    {
      "clave": "10131604",
      "descripcion": "Correas para perros"
    },
    {
      "clave": "10141500",
      "descripcion": "Talabartería"
    },
    {
      "clave": "10141501",
      "descripcion": "Sillas de montar"
    },
    {
      "clave": "10141502",
      "descripcion": "Fustas y látigos"
    },
    {
      "clave": "10141503",
      "descripcion": "Herraduras para caballo"
    },
    {
      "clave": "10141504",
      "descripcion": "Herraduras para mula"
    },
    {
      "clave": "10141505",
      "descripcion": "Sillín o pelero"
    },
    {
      "clave": "10141600",
      "descripcion": "Arneses"
    },
    {
      "clave": "10141601",
      "descripcion": "Bridas"
    },
    {
      "clave": "10141602",
      "descripcion": "Yugos"
    },
    {
      "clave": "10141603",
      "descripcion": "Bocados para caballos"
    },
    {
      "clave": "10141604",
      "descripcion": "Riendas"
    },
    {
      "clave": "10141605",
      "descripcion": "Estribos"
    },
    {
      "clave": "10141606",
      "descripcion": "Correas o traíllas"
    },
    {
      "clave": "10141607",
      "descripcion": "Arneses de cuello para animales"
    },
    {
      "clave": "10141608",
      "descripcion": "Arneses o sus accesorios"
    },
    {
      "clave": "10141609",
      "descripcion": "Sujetadores"
    },
    {
      "clave": "10141610",
      "descripcion": "Bozales"
    },
    {
      "clave": "10141611",
      "descripcion": "Soportes para correas"
    },
    {
      "clave": "10151500",
      "descripcion": "Semillas y plántulas vegetales"
    },
    {
      "clave": "10151501",
      "descripcion": "Semillas o plántulas de fríjol"
    },
    {
      "clave": "10151502",
      "descripcion": "Semillas o plántulas de zanahoria"
    },
    {
      "clave": "10151503",
      "descripcion": "Semillas o plántulas de apio"
    },
    {
      "clave": "10151504",
      "descripcion": "Semillas o plántulas de chiles"
    },
    {
      "clave": "10151505",
      "descripcion": "Semillas o plántulas de calabacín"
    },
    {
      "clave": "10151506",
      "descripcion": "Semillas o plántulas de alverja"
    },
    {
      "clave": "10151507",
      "descripcion": "Semillas o plántulas de pepino cohombro"
    },
    {
      "clave": "10151508",
      "descripcion": "Semillas o plántulas de berenjena"
    },
    {
      "clave": "10151509",
      "descripcion": "Semillas o plántulas de endivias"
    },
    {
      "clave": "10151510",
      "descripcion": "Semillas o plántulas de ajo"
    },
    {
      "clave": "10151511",
      "descripcion": "Semillas o plántulas de puerro"
    },
    {
      "clave": "10151512",
      "descripcion": "Semillas o plántulas de lechuga"
    },
    {
      "clave": "10151513",
      "descripcion": "Semillas o plántulas de maíz"
    },
    {
      "clave": "10151514",
      "descripcion": "Semillas o plántulas de melón"
    },
    {
      "clave": "10151515",
      "descripcion": "Semillas o plántulas cebolla"
    },
    {
      "clave": "10151516",
      "descripcion": "Semillas o plántulas de soya"
    },
    {
      "clave": "10151517",
      "descripcion": "Semillas o plántulas de espinaca"
    },
    {
      "clave": "10151518",
      "descripcion": "Semillas o plántulas de tomate"
    },
    {
      "clave": "10151519",
      "descripcion": "Semillas o plántulas de nabo"
    },
    {
      "clave": "10151520",
      "descripcion": "Semillas o plántulas de acelga"
    },
    {
      "clave": "10151521",
      "descripcion": "Semillas o plántulas de pimiento morrón"
    },
    {
      "clave": "10151522",
      "descripcion": "Semillas o plántulas de remolacha"
    },
    {
      "clave": "10151523",
      "descripcion": "Semillas o plántulas de coliflor"
    },
    {
      "clave": "10151524",
      "descripcion": "Semillas o plántulas de perejil"
    },
    {
      "clave": "10151525",
      "descripcion": "Semillas o plántulas de brócoli"
    },
    {
      "clave": "10151526",
      "descripcion": "Semillas o plántulas de repollo"
    },
    {
      "clave": "10151527",
      "descripcion": "Semillas o plántulas de papa"
    },
    {
      "clave": "10151528",
      "descripcion": "Semillas o plántulas de batata"
    },
    {
      "clave": "10151529",
      "descripcion": "Semillas o plántulas de calabaza"
    },
    {
      "clave": "10151530",
      "descripcion": "Semillas o plántulas de rábano"
    },
    {
      "clave": "10151531",
      "descripcion": "Semillas o plántulas de repollitos de bruselas"
    },
    {
      "clave": "10151532",
      "descripcion": "Semillas o plántulas de ahuyama"
    },
    {
      "clave": "10151533",
      "descripcion": "Semillas o plántulas de okra"
    },
    {
      "clave": "10151534",
      "descripcion": "Semillas o plántulas de melón cantalupo"
    },
    {
      "clave": "10151535",
      "descripcion": "Semillas o plántulas de maní"
    },
    {
      "clave": "10151536",
      "descripcion": "Semillas o plántulas de caigua"
    },
    {
      "clave": "10151537",
      "descripcion": "Semillas o plántulas de espárrago"
    },
    {
      "clave": "10151538",
      "descripcion": "Semillas o plántulas de garbanzo"
    },
    {
      "clave": "10151539",
      "descripcion": "Semillas o plántulas de haba"
    },
    {
      "clave": "10151600",
      "descripcion": "Semillas de cereales"
    },
    {
      "clave": "10151601",
      "descripcion": "Semillas de trigo"
    },
    {
      "clave": "10151602",
      "descripcion": "Semillas de canola"
    },
    {
      "clave": "10151603",
      "descripcion": "Semillas de cebada"
    },
    {
      "clave": "10151604",
      "descripcion": "Semillas de mijo"
    },
    {
      "clave": "10151605",
      "descripcion": "Semillas de avena"
    },
    {
      "clave": "10151606",
      "descripcion": "Semillas de ajonjolí"
    },
    {
      "clave": "10151607",
      "descripcion": "Semillas de linaza"
    },
    {
      "clave": "10151608",
      "descripcion": "Semillas de aceite de ricino"
    },
    {
      "clave": "10151609",
      "descripcion": "Semillas de maíz"
    },
    {
      "clave": "10151610",
      "descripcion": "Semillas de centeno"
    },
    {
      "clave": "10151611",
      "descripcion": "Semillas de sorgo"
    },
    {
      "clave": "10151612",
      "descripcion": "Semillas o plántulas de kiwicha"
    },
    {
      "clave": "10151613",
      "descripcion": "Semillas o plántulas de quínoa"
    },
    {
      "clave": "10151700",
      "descripcion": "Semillas y plántulas de hierba y forraje"
    },
    {
      "clave": "10151701",
      "descripcion": "Semillas o plántulas de arroz"
    },
    {
      "clave": "10151702",
      "descripcion": "Semillas o plántulas de trébol"
    },
    {
      "clave": "10151703",
      "descripcion": "Semillas o plántulas de alfalfa"
    },
    {
      "clave": "10151704",
      "descripcion": "Semillas o plántulas de pasto"
    },
    {
      "clave": "10151705",
      "descripcion": "Semillas o plántulas de veza (gachas / guija)"
    },
    {
      "clave": "10151706",
      "descripcion": "Semillas o plántulas de guar"
    },
    {
      "clave": "10151800",
      "descripcion": "Semillas y plántulas de especias"
    },
    {
      "clave": "10151801",
      "descripcion": "Semillas o plántulas de pimienta"
    },
    {
      "clave": "10151802",
      "descripcion": "Semillas o plántulas de vainilla"
    },
    {
      "clave": "10151803",
      "descripcion": "Semillas o plántulas de canela"
    },
    {
      "clave": "10151804",
      "descripcion": "Semillas o plántulas de clavo de olor"
    },
    {
      "clave": "10151805",
      "descripcion": "Semillas o plántulas de cilantro"
    },
    {
      "clave": "10151806",
      "descripcion": "Semillas o plántulas de jengibre"
    },
    {
      "clave": "10151807",
      "descripcion": "Semillas o plántulas de azafrán"
    },
    {
      "clave": "10151808",
      "descripcion": "Semillas o plántulas de tomillo"
    },
    {
      "clave": "10151809",
      "descripcion": "Semillas o plántulas de curry"
    },
    {
      "clave": "10151810",
      "descripcion": "Semillas o plántulas de mostaza"
    },
    {
      "clave": "10151811",
      "descripcion": "Semillas o plántulas de ginseng"
    },
    {
      "clave": "10151812",
      "descripcion": "Semillas o plántulas de champiñones"
    },
    {
      "clave": "10151813",
      "descripcion": "Semillas o plántulas de sacha inchi"
    },
    {
      "clave": "10151814",
      "descripcion": "Semillas o plántulas de achiote"
    },
    {
      "clave": "10151815",
      "descripcion": "Semillas o plántulas de kudzu"
    },
    {
      "clave": "10151816",
      "descripcion": "Semillas o plántulas de albahaca"
    },
    {
      "clave": "10151817",
      "descripcion": "Semillas o plántulas de anís"
    },
    {
      "clave": "10151900",
      "descripcion": "Semillas, bulbos, plántulas y esquejes de flores"
    },
    {
      "clave": "10151901",
      "descripcion": "Semillas, bulbos, plántulas o esquejes de tulipán"
    },
    {
      "clave": "10151902",
      "descripcion": "Semillas, plántulas o esquejes de rosa"
    },
    {
      "clave": "10151903",
      "descripcion": "Semillas, bulbos, plántulas o esquejes de narciso"
    },
    {
      "clave": "10151904",
      "descripcion": "Semillas de girasol"
    },
    {
      "clave": "10151906",
      "descripcion": "Bulbos de lirio"
    },
    {
      "clave": "10151907",
      "descripcion": "Semillas o plántulas de veza"
    },
    {
      "clave": "10152000",
      "descripcion": "Semillas y esquejes de árboles y arbustos"
    },
    {
      "clave": "10152001",
      "descripcion": "Semillas o esquejes de árboles frutales"
    },
    {
      "clave": "10152002",
      "descripcion": "Semillas o esquejes de coníferas"
    },
    {
      "clave": "10152003",
      "descripcion": "Semillas o esquejes de árboles de frutos secos"
    },
    {
      "clave": "10152004",
      "descripcion": "Plántulas de latifoliados"
    },
    {
      "clave": "10152005",
      "descripcion": "Plántulas de coníferas"
    },
    {
      "clave": "10152006",
      "descripcion": "Semillas o yemas de pino"
    },
    {
      "clave": "10152007",
      "descripcion": "Semillas o yemas de algarrobo"
    },
    {
      "clave": "10152100",
      "descripcion": "Residuos que no sean de piensos"
    },
    {
      "clave": "10152101",
      "descripcion": "Extracción de los residuos de semilla de babool"
    },
    {
      "clave": "10152102",
      "descripcion": "Residuos de semilla de colza"
    },
    {
      "clave": "10152103",
      "descripcion": "Residuo de semillas de linaza"
    },
    {
      "clave": "10152104",
      "descripcion": "Torta de neem"
    },
    {
      "clave": "10152200",
      "descripcion": "Semillas de cultivos fibrosos y semilleros"
    },
    {
      "clave": "10152201",
      "descripcion": "Semillas o plántulas de algodón"
    },
    {
      "clave": "10152202",
      "descripcion": "Semillas o plántulas de lino"
    },
    {
      "clave": "10152300",
      "descripcion": "Plántulas y semillas de leguminosas"
    },
    {
      "clave": "10161500",
      "descripcion": "Árboles y arbustos"
    },
    {
      "clave": "10161501",
      "descripcion": "Aceitunos"
    },
    {
      "clave": "10161502",
      "descripcion": "Cafetos"
    },
    {
      "clave": "10161503",
      "descripcion": "Cacaoteros"
    },
    {
      "clave": "10161504",
      "descripcion": "Manzanos"
    },
    {
      "clave": "10161505",
      "descripcion": "Peros"
    },
    {
      "clave": "10161506",
      "descripcion": "Naranjos"
    },
    {
      "clave": "10161507",
      "descripcion": "Rododendros"
    },
    {
      "clave": "10161508",
      "descripcion": "Plantas de te"
    },
    {
      "clave": "10161509",
      "descripcion": "Coníferas"
    },
    {
      "clave": "10161510",
      "descripcion": "Abetos rojos (píceas)"
    },
    {
      "clave": "10161511",
      "descripcion": "Pinos"
    },
    {
      "clave": "10161512",
      "descripcion": "Abetos"
    },
    {
      "clave": "10161513",
      "descripcion": "Palmeras"
    },
    {
      "clave": "10161514",
      "descripcion": "Casuarina"
    },
    {
      "clave": "10161515",
      "descripcion": "Ciprés"
    },
    {
      "clave": "10161516",
      "descripcion": "Eucalipto"
    },
    {
      "clave": "10161517",
      "descripcion": "Árbol de quinua"
    },
    {
      "clave": "10161518",
      "descripcion": "Magnolio"
    },
    {
      "clave": "10161519",
      "descripcion": "Mioporo"
    },
    {
      "clave": "10161520",
      "descripcion": "Acalifa"
    },
    {
      "clave": "10161521",
      "descripcion": "Tecomaria capensis o madreselva del cabo"
    },
    {
      "clave": "10161522",
      "descripcion": "Arbusto croton bolaina"
    },
    {
      "clave": "10161523",
      "descripcion": "Abutillón"
    },
    {
      "clave": "10161524",
      "descripcion": "Ficus"
    },
    {
      "clave": "10161525",
      "descripcion": "Lúcumo"
    },
    {
      "clave": "10161526",
      "descripcion": "Aguacatal"
    },
    {
      "clave": "10161527",
      "descripcion": "Guanábano"
    },
    {
      "clave": "10161528",
      "descripcion": "Carambolo"
    },
    {
      "clave": "10161529",
      "descripcion": "Ciruelo"
    },
    {
      "clave": "10161530",
      "descripcion": "Árbol de quince"
    },
    {
      "clave": "10161600",
      "descripcion": "Plantas florales"
    },
    {
      "clave": "10161602",
      "descripcion": "Poinsettias"
    },
    {
      "clave": "10161604",
      "descripcion": "Azaleas"
    },
    {
      "clave": "10161605",
      "descripcion": "Cactos"
    },
    {
      "clave": "10161606",
      "descripcion": "Ageratum púrpura"
    },
    {
      "clave": "10161800",
      "descripcion": "Plantas sin flor"
    },
    {
      "clave": "10161801",
      "descripcion": "Helechos"
    },
    {
      "clave": "10161802",
      "descripcion": "Hiedras"
    },
    {
      "clave": "10161803",
      "descripcion": "Filodendros"
    },
    {
      "clave": "10161804",
      "descripcion": "Líquenes"
    },
    {
      "clave": "10161805",
      "descripcion": "Vides"
    },
    {
      "clave": "10161900",
      "descripcion": "Productos florales secos"
    },
    {
      "clave": "10161901",
      "descripcion": "Vainas secas"
    },
    {
      "clave": "10161902",
      "descripcion": "Follaje seco"
    },
    {
      "clave": "10161903",
      "descripcion": "Helechos secos"
    },
    {
      "clave": "10161905",
      "descripcion": "Ramas y tallos secos"
    },
    {
      "clave": "10161906",
      "descripcion": "Penachos de gramíneas secos"
    },
    {
      "clave": "10161907",
      "descripcion": "Flores secas prensadas"
    },
    {
      "clave": "10161908",
      "descripcion": "Pétalos secos"
    },
    {
      "clave": "10171500",
      "descripcion": "Abonos orgánicos y nutrientes para plantas"
    },
    {
      "clave": "10171501",
      "descripcion": "Estiércol o guano"
    },
    {
      "clave": "10171502",
      "descripcion": "Hormonas para plantas"
    },
    {
      "clave": "10171503",
      "descripcion": "Harina de pescado"
    },
    {
      "clave": "10171504",
      "descripcion": "Abono"
    },
    {
      "clave": "10171505",
      "descripcion": "Nutriente foliar"
    },
    {
      "clave": "10171506",
      "descripcion": "Humus"
    },
    {
      "clave": "10171600",
      "descripcion": "Abonos químicos y nutrientes para plantas"
    },
    {
      "clave": "10171601",
      "descripcion": "Fertilizante nitrogenado"
    },
    {
      "clave": "10171602",
      "descripcion": "Fertilizante de potasio"
    },
    {
      "clave": "10171603",
      "descripcion": "Fertilizante de fósforo"
    },
    {
      "clave": "10171604",
      "descripcion": "Fertilizante de sulfuro"
    },
    {
      "clave": "10171605",
      "descripcion": "Mezclas de nitrógeno - fósforo - potasio- npk"
    },
    {
      "clave": "10171606",
      "descripcion": "Fertilizarte de sílice puro"
    },
    {
      "clave": "10171607",
      "descripcion": "Fertilizante con magnesio"
    },
    {
      "clave": "10171608",
      "descripcion": "Fertilizante micro elemento"
    },
    {
      "clave": "10171609",
      "descripcion": "Fertilizante fosfato de sílice"
    },
    {
      "clave": "10171610",
      "descripcion": "Fertilizante potasio de sílice"
    },
    {
      "clave": "10171611",
      "descripcion": "Fertilizante de calcio"
    },
    {
      "clave": "10171700",
      "descripcion": "Herbicidas"
    },
    {
      "clave": "10171701",
      "descripcion": "Matamalezas"
    },
    {
      "clave": "10171702",
      "descripcion": "Fungicidas"
    },
    {
      "clave": "10171800",
      "descripcion": "Acondicionadores de suelos"
    },
    {
      "clave": "10171801",
      "descripcion": "Acondicionador orgánico de suelos"
    },
    {
      "clave": "10171802",
      "descripcion": "Acondicionador inorgánico de suelos"
    },
    {
      "clave": "10191500",
      "descripcion": "Pesticidas o repelentes de plagas"
    },
    {
      "clave": "10191506",
      "descripcion": "Mata roedores"
    },
    {
      "clave": "10191507",
      "descripcion": "Repelentes de aves"
    },
    {
      "clave": "10191508",
      "descripcion": "Protectores contra termitas"
    },
    {
      "clave": "10191509",
      "descripcion": "Insecticidas"
    },
    {
      "clave": "10191510",
      "descripcion": "Abamectina"
    },
    {
      "clave": "10191511",
      "descripcion": "Fipronil"
    },
    {
      "clave": "10191700",
      "descripcion": "Dispositivos para control de plagas"
    },
    {
      "clave": "10191701",
      "descripcion": "Trampas para control animal"
    },
    {
      "clave": "10191703",
      "descripcion": "Trampas para el control de insectos voladores"
    },
    {
      "clave": "10191704",
      "descripcion": "Matamoscas"
    },
    {
      "clave": "10191705",
      "descripcion": "Lazos"
    },
    {
      "clave": "10191706",
      "descripcion": "Cepos"
    },
    {
      "clave": "10191707",
      "descripcion": "Repelente ultrasónico de pestes"
    },
    {
      "clave": "10211700",
      "descripcion": "Astromelia viva"
    },
    {
      "clave": "10211701",
      "descripcion": "Astromelia viva agropoli"
    },
    {
      "clave": "10211702",
      "descripcion": "Astromelia viva bourgogne"
    },
    {
      "clave": "10211703",
      "descripcion": "Astromelia viva cairo"
    },
    {
      "clave": "10211704",
      "descripcion": "Astromelia viva charmes"
    },
    {
      "clave": "10211705",
      "descripcion": "Astromelia viva cherry bay"
    },
    {
      "clave": "10211706",
      "descripcion": "Astromelia viva cherry white"
    },
    {
      "clave": "10211707",
      "descripcion": "Astromelia viva dame blanche"
    },
    {
      "clave": "10211708",
      "descripcion": "Astromelia viva diamond"
    },
    {
      "clave": "10211709",
      "descripcion": "Astromelia viva gran canaria"
    },
    {
      "clave": "10211710",
      "descripcion": "Astromelia viva harlekijn"
    },
    {
      "clave": "10211711",
      "descripcion": "Astromelia viva indian"
    },
    {
      "clave": "10426078",
      "descripcion": "Flor de tillasandia cortada seca"
    },
    {
      "clave": "10426079",
      "descripcion": "Triteleia cortada seca"
    },
    {
      "clave": "10426080",
      "descripcion": "Tritoma naranja o chuzo caliente cortada seca roja"
    },
    {
      "clave": "10426081",
      "descripcion": "Veronicastrum virginiana cortada seca"
    },
    {
      "clave": "10426082",
      "descripcion": "Bromelia vriesea splendens cortada seca"
    },
    {
      "clave": "10426084",
      "descripcion": "Hipericim o hierba de san juan cortada seca"
    },
    {
      "clave": "10426085",
      "descripcion": "Spirea cortada seca"
    },
    {
      "clave": "10426086",
      "descripcion": "Yerba de san bonifacio cortada seca"
    },
    {
      "clave": "10426100",
      "descripcion": "Sello de salomón (polygonato) cortada seca"
    },
    {
      "clave": "10426101",
      "descripcion": "Sello de salomón (polygonato) falso cortada seca"
    },
    {
      "clave": "10426102",
      "descripcion": "Sello de salomón (polygonato) variegado cortada seca"
    },
    {
      "clave": "10501600",
      "descripcion": "Chili verde cortado fresco"
    },
    {
      "clave": "10501601",
      "descripcion": "Chili verde cortado fresco avellana"
    },
    {
      "clave": "10501602",
      "descripcion": "Chili verde cortado fresco romerillo"
    },
    {
      "clave": "10501603",
      "descripcion": "Chili verde cortado fresco pacarilla"
    },
    {
      "clave": "10501604",
      "descripcion": "Chili verde cortado fresco musgo"
    },
    {
      "clave": "10501800",
      "descripcion": "Hojas de eucalipto cortadas prescas"
    },
    {
      "clave": "10501801",
      "descripcion": "Eucalipto cortado fresco bebé azul"
    },
    {
      "clave": "10501802",
      "descripcion": "Eucalipto cortado fresco alto bonsai"
    },
    {
      "clave": "10501803",
      "descripcion": "Eucalipto cortado fresco pluma"
    },
    {
      "clave": "10501804",
      "descripcion": "Eucalipto cortado fresco gunnii"
    },
    {
      "clave": "10501805",
      "descripcion": "Eucalipto cortado fresco parvifolia"
    },
    {
      "clave": "10501806",
      "descripcion": "Eucalipto cortado fresco preservado"
    },
    {
      "clave": "10501807",
      "descripcion": "Eucalipto cortado fresco sin semilla"
    },
    {
      "clave": "10501808",
      "descripcion": "Eucalipto cortado fresco sin semilla y sin hojas"
    },
    {
      "clave": "10501809",
      "descripcion": "Eucalipto cortado fresco sin semillas llorón"
    },
    {
      "clave": "10501810",
      "descripcion": "Eucalipto cortado fresco dólar de plata"
    },
    {
      "clave": "10501811",
      "descripcion": "Eucalipto cortado fresco alto espiral"
    },
    {
      "clave": "10501812",
      "descripcion": "Eucalipto cortado fresco azul verdadero"
    },
    {
      "clave": "10501813",
      "descripcion": "Eucalipto cortado fresco sauce sin semillas"
    },
    {
      "clave": "10502000",
      "descripcion": "Hojas o follajes cortados frescos"
    },
    {
      "clave": "10502001",
      "descripcion": "Follaje fresco cortado de melaluca australiana"
    },
    {
      "clave": "10502002",
      "descripcion": "Follaje fresco cortado de lepto azul"
    },
    {
      "clave": "20122102",
      "descripcion": "Pistolas de revestimiento"
    },
    {
      "clave": "20122103",
      "descripcion": "Cabezas de despliegue"
    },
    {
      "clave": "20122104",
      "descripcion": "Explosivos de perforación"
    },
    {
      "clave": "20122105",
      "descripcion": "Cabezas de disparo"
    },
    {
      "clave": "20122106",
      "descripcion": "Adaptadores de pistola"
    },
    {
      "clave": "20122107",
      "descripcion": "Pistola de disparo de alta densidad"
    },
    {
      "clave": "20122108",
      "descripcion": "Tapones bull de perforación"
    },
    {
      "clave": "20122109",
      "descripcion": "Herramientas de poner tapones"
    },
    {
      "clave": "20122110",
      "descripcion": "Equipo de posicionamiento de perforación"
    },
    {
      "clave": "20122111",
      "descripcion": "Pistolas festoneadas"
    },
    {
      "clave": "20122112",
      "descripcion": "Subs en tándem"
    },
    {
      "clave": "20122114",
      "descripcion": "Pistola de perforación de tubos completa"
    },
    {
      "clave": "20122115",
      "descripcion": "Subs ventilación bajo balance"
    },
    {
      "clave": "20122213",
      "descripcion": "Separadores de pruebas de pozo"
    },
    {
      "clave": "20122300",
      "descripcion": "Equipo de Slickline - Cable de Recuperación"
    },
    {
      "clave": "20122301",
      "descripcion": "Cabezas de adaptador de cable de recuperación"
    },
    {
      "clave": "20122302",
      "descripcion": "Retardo de envío del cable de recuperación"
    },
    {
      "clave": "20122303",
      "descripcion": "Guías de campana de cable de recuperación"
    },
    {
      "clave": "20122304",
      "descripcion": "Cajas ciegas de cable de recuperación"
    },
    {
      "clave": "20122305",
      "descripcion": "Equipo de presión de fondo de hoyo de cable de recuperación"
    },
    {
      "clave": "20122306",
      "descripcion": "Herramientas de calibración de cable de recuperación"
    },
    {
      "clave": "20122307",
      "descripcion": "Volcado de cemento de rescate de equipos cable de recuperación"
    },
    {
      "clave": "20122308",
      "descripcion": "Cortadores químicos de cable de recuperación"
    },
    {
      "clave": "20122309",
      "descripcion": "Centralizadores de cadena de herramientas de almeja de cable de recuperación"
    },
    {
      "clave": "20122310",
      "descripcion": "Centralizadores de cable de acero de almeja de cable de recuperación"
    },
    {
      "clave": "20122311",
      "descripcion": "Localizadores de collar de cable de recuperación"
    },
    {
      "clave": "20122312",
      "descripcion": "Colectores de cable de recuperación"
    },
    {
      "clave": "20122313",
      "descripcion": "Herramientas de colisión de cable de recuperación"
    },
    {
      "clave": "20122314",
      "descripcion": "Cruces de cable de recuperación"
    },
    {
      "clave": "20122315",
      "descripcion": "Equipo de medición de profundidad de cable de recuperación"
    },
    {
      "clave": "20122316",
      "descripcion": "Frasco dewar de cable de recuperación"
    },
    {
      "clave": "20122317",
      "descripcion": "Herramientas del dipmeter de cable de recuperación"
    },
    {
      "clave": "20122318",
      "descripcion": "Herramientas direccionales de cable de recuperación"
    },
    {
      "clave": "20122319",
      "descripcion": "Herramientas de vaya con el diablo de cable de recuperación"
    },
    {
      "clave": "20122320",
      "descripcion": "Abridores de hoyos de cable de recuperación"
    },
    {
      "clave": "20122321",
      "descripcion": "Cortadores jet de cable de recuperación"
    },
    {
      "clave": "20122322",
      "descripcion": "Disparos de desperdicios de cable de recuperación"
    },
    {
      "clave": "20122323",
      "descripcion": "Herramientas de kickover de cable de recuperación"
    },
    {
      "clave": "20122324",
      "descripcion": "Uniones de nudillos de cable de recuperación"
    },
    {
      "clave": "20122325",
      "descripcion": "Bloques de impresión de cable de recuperación"
    },
    {
      "clave": "20122326",
      "descripcion": "Mandriles de ubicación de cable de recuperación"
    },
    {
      "clave": "20122327",
      "descripcion": "Mandriles de bloqueo de cable de recuperación"
    },
    {
      "clave": "20122328",
      "descripcion": "Lubricadores de cable de recuperación"
    },
    {
      "clave": "20122329",
      "descripcion": "Achicadores mecánicos de cable de recuperación"
    },
    {
      "clave": "20122330",
      "descripcion": "Plugback mecánico de cable de recuperación"
    },
    {
      "clave": "20122331",
      "descripcion": "Otras herramientas de cable de recuperación"
    },
    {
      "clave": "20122332",
      "descripcion": "Raspadores de parafina de cable de recuperación"
    },
    {
      "clave": "20122333",
      "descripcion": "Enchufe de línea de cable de recuperación"
    },
    {
      "clave": "20122334",
      "descripcion": "Tenazas para halar"
    },
    {
      "clave": "23251600",
      "descripcion": "Máquinas para enrollado de metales"
    },
    {
      "clave": "23251601",
      "descripcion": "Máquina enrolladora de hebras"
    },
    {
      "clave": "23251602",
      "descripcion": "Máquina para el formado de láminas metálicas"
    },
    {
      "clave": "23251603",
      "descripcion": "Prensa de rodillos"
    },
    {
      "clave": "23251700",
      "descripcion": "Máquinas de forjado"
    },
    {
      "clave": "23251701",
      "descripcion": "Prensa de forja de cizalla"
    },
    {
      "clave": "23251702",
      "descripcion": "Prensa de forja de impresión y troquel cerrado"
    },
    {
      "clave": "23251703",
      "descripcion": "Prensa de forja de troquel abierto"
    },
    {
      "clave": "23251704",
      "descripcion": "Máquinas de forjado radial"
    },
    {
      "clave": "23251705",
      "descripcion": "Máquina de forjado rollo"
    },
    {
      "clave": "23251706",
      "descripcion": "Rebabas giratorias"
    },
    {
      "clave": "23251707",
      "descripcion": "Prensa de recortado"
    },
    {
      "clave": "23251708",
      "descripcion": "Máquina de forjado de alta velocidad"
    },
    {
      "clave": "23251709",
      "descripcion": "Máquina de forjado de martillo de aire"
    },
    {
      "clave": "23251710",
      "descripcion": "Máquina de forjado de martillo de resorte"
    },
    {
      "clave": "23251711",
      "descripcion": "Máquina de forjado de martillo a vapor"
    },
    {
      "clave": "23251712",
      "descripcion": "Máquina de forjado de martillo de caída"
    },
    {
      "clave": "23251713",
      "descripcion": "Máquina de forjado de terminaciones prensadas"
    },
    {
      "clave": "23251714",
      "descripcion": "Forja de compresión o prensa de manivela"
    },
    {
      "clave": "23251800",
      "descripcion": "Troqueles y herramientas para el formado de metales"
    },
    {
      "clave": "23251801",
      "descripcion": "Troquel de doblado"
    },
    {
      "clave": "23251802",
      "descripcion": "Troquel de corte"
    },
    {
      "clave": "23251803",
      "descripcion": "Troquel de fundición a presión"
    },
    {
      "clave": "23251804",
      "descripcion": "Troquel de terminado de bordes"
    },
    {
      "clave": "23251805",
      "descripcion": "Troquel de forja"
    },
    {
      "clave": "23251806",
      "descripcion": "Troquel de extrusión de metal"
    },
    {
      "clave": "23251807",
      "descripcion": "Sello de metal"
    },
    {
      "clave": "23251808",
      "descripcion": "Mandril para el doblado de tubos"
    },
    {
      "clave": "23251809",
      "descripcion": "Troquel giratorio"
    },
    {
      "clave": "23251810",
      "descripcion": "Troquel de estampado"
    },
    {
      "clave": "23251811",
      "descripcion": "Troquel de regla de acero"
    },
    {
      "clave": "23251812",
      "descripcion": "Troquel de roscado"
    },
    {
      "clave": "23251813",
      "descripcion": "Troquel de cableado"
    },
    {
      "clave": "23251814",
      "descripcion": "Troquel de dibujo"
    },
    {
      "clave": "23261500",
      "descripcion": "Máquinas para prototipos rápidos"
    },
    {
      "clave": "23261501",
      "descripcion": "Máquina de modelado por deposición con fusible fdm"
    },
    {
      "clave": "23261502",
      "descripcion": "Máquina de método de chorro de tinta"
    },
    {
      "clave": "23261503",
      "descripcion": "Máquina para la manufactura de objeto laminado"
    },
    {
      "clave": "23261504",
      "descripcion": "Máquina láser para la formación de polvo"
    },
    {
      "clave": "23261505",
      "descripcion": "Máquina láser selectiva de sinterización"
    },
    {
      "clave": "23261506",
      "descripcion": "Máquina de estero – litografía"
    },
    {
      "clave": "23261507",
      "descripcion": "Máquina impresora tridimensional"
    },
    {
      "clave": "23271400",
      "descripcion": "Máquinas soldadoras"
    },
    {
      "clave": "23271401",
      "descripcion": "Máquina para soldadura arco sumergida"
    },
    {
      "clave": "23271402",
      "descripcion": "Máquina de soldadura ultrasónica"
    },
    {
      "clave": "23271403",
      "descripcion": "Máquina de soldadura de proyección"
    },
    {
      "clave": "23271404",
      "descripcion": "Máquina de soldadura arco plasma"
    },
    {
      "clave": "23271405",
      "descripcion": "Máquina de soldadura láser"
    },
    {
      "clave": "23271406",
      "descripcion": "Máquina de soldadura aislada"
    },
    {
      "clave": "23271407",
      "descripcion": "Máquina de soldadura de gas inerte de tungsteno"
    },
    {
      "clave": "23271408",
      "descripcion": "Máquina de soldadura de gas inerte de metal"
    },
    {
      "clave": "23271409",
      "descripcion": "Máquina de soldadura de barra o soldadura arco metálico protegida"
    },
    {
      "clave": "23271410",
      "descripcion": "Rectificador de soldadura"
    },
    {
      "clave": "26121703",
      "descripcion": "Cableado preformado de comunicación"
    },
    {
      "clave": "26121704",
      "descripcion": "Arnés de alambrado especial"
    },
    {
      "clave": "26121706",
      "descripcion": "Conjunto coaxial"
    },
    {
      "clave": "26121707",
      "descripcion": "Conjunto de cable plano flexible"
    },
    {
      "clave": "26121708",
      "descripcion": "Conjunto de cable de batería"
    },
    {
      "clave": "26121709",
      "descripcion": "Conjunto de cordón embobinado"
    },
    {
      "clave": "26121710",
      "descripcion": "Arnés de cableado sensor oxígeno"
    },
    {
      "clave": "26121711",
      "descripcion": "Varilla de pistón"
    },
    {
      "clave": "26121800",
      "descripcion": "Cable automotriz"
    },
    {
      "clave": "26121802",
      "descripcion": "Cable automotriz de núcleo sencillo de 60 voltios clase a"
    },
    {
      "clave": "26121803",
      "descripcion": "Cable automotriz de núcleo sencillo de 60 voltios clase b"
    },
    {
      "clave": "26121804",
      "descripcion": "Cable automotriz de núcleo sencillo de 60 voltios clase c"
    },
    {
      "clave": "26121805",
      "descripcion": "Cable automotriz de núcleo sencillo de 60 voltios clase d"
    },
    {
      "clave": "26121806",
      "descripcion": "Cable automotriz de núcleo sencillo de 60 voltios"
    },
    {
      "clave": "27112807",
      "descripcion": "Cuñas"
    },
    {
      "clave": "27112808",
      "descripcion": "Anillos metálicos"
    },
    {
      "clave": "27112809",
      "descripcion": "Portaherramientas"
    },
    {
      "clave": "27112810",
      "descripcion": "Equipos para reparar roscas"
    },
    {
      "clave": "27112811",
      "descripcion": "Árboles"
    },
    {
      "clave": "27112812",
      "descripcion": "Avellanadores"
    },
    {
      "clave": "27112813",
      "descripcion": "Vara de extensión"
    },
    {
      "clave": "27112814",
      "descripcion": "Brocas de destornillador"
    },
    {
      "clave": "27112815",
      "descripcion": "Brocas para poner tuercas"
    },
    {
      "clave": "27112818",
      "descripcion": "Sombreretes o revestimientos de prensas de tornillo"
    },
    {
      "clave": "27112819",
      "descripcion": "Cuchillas de corte para encuadernación"
    },
    {
      "clave": "27112820",
      "descripcion": "Troqueles de herramienta engarzadora de lengüetas"
    },
    {
      "clave": "27112821",
      "descripcion": "Brocas de buriladora"
    },
    {
      "clave": "27112822",
      "descripcion": "Adaptadores de cubo"
    },
    {
      "clave": "27112823",
      "descripcion": "Cadenas de corte"
    },
    {
      "clave": "27112824",
      "descripcion": "Portabrocas"
    },
    {
      "clave": "27112825",
      "descripcion": "Juegos de plantillas de herramienta"
    },
    {
      "clave": "27112826",
      "descripcion": "Caladora"
    },
    {
      "clave": "27112827",
      "descripcion": "Dispositivos para imantar y viceversa"
    },
    {
      "clave": "27112828",
      "descripcion": "Enchufes de impacto"
    },
    {
      "clave": "27112829",
      "descripcion": "Anexos de llave de impacto y sus accesorios"
    },
    {
      "clave": "27112830",
      "descripcion": "Accesorios y suministros de destornillador"
    },
    {
      "clave": "27112831",
      "descripcion": "Accesorios y suministros de llave"
    },
    {
      "clave": "27112832",
      "descripcion": "Anexos t accesorios de enchufe"
    },
    {
      "clave": "27112833",
      "descripcion": "Estuche de brocas"
    },
    {
      "clave": "27112834",
      "descripcion": "Estuche de roscador manual de tubos"
    },
    {
      "clave": "27112835",
      "descripcion": "Escariador de máquina"
    },
    {
      "clave": "27112836",
      "descripcion": "Juego de brocas de destornillador"
    },
    {
      "clave": "27112837",
      "descripcion": "Escariador manual"
    },
    {
      "clave": "27112838",
      "descripcion": "Disco de corte"
    },
    {
      "clave": "27112839",
      "descripcion": "Broca de cincel"
    },
    {
      "clave": "27112840",
      "descripcion": "Broca guía"
    },
    {
      "clave": "27112841",
      "descripcion": "Broca manual para metal"
    },
    {
      "clave": "27112842",
      "descripcion": "Broca manual para madera"
    },
    {
      "clave": "27112843",
      "descripcion": "Broca manual para piedra"
    },
    {
      "clave": "27112844",
      "descripcion": "Placa de lapeado"
    },
    {
      "clave": "27112845",
      "descripcion": "Juego de brocas"
    },
    {
      "clave": "27112846",
      "descripcion": "Adaptador de pistola de calor"
    },
    {
      "clave": "27112847",
      "descripcion": "Estuche de troqueles"
    },
    {
      "clave": "27112900",
      "descripcion": "Herramientas dispensadoras"
    },
    {
      "clave": "27112901",
      "descripcion": "Pistolas de grasa"
    },
    {
      "clave": "27112902",
      "descripcion": "Chimeneas industriales"
    },
    {
      "clave": "27112903",
      "descripcion": "Rociador manual"
    },
    {
      "clave": "27112904",
      "descripcion": "Pistola de resina"
    },
    {
      "clave": "27112905",
      "descripcion": "Lata de aceite"
    },
    {
      "clave": "27112906",
      "descripcion": "Pistolas de calafateado"
    },
    {
      "clave": "27112907",
      "descripcion": "Separadores de difusión"
    },
    {
      "clave": "27112908",
      "descripcion": "Pistola de aceite"
    },
    {
      "clave": "27112909",
      "descripcion": "Trapero para techos"
    },
    {
      "clave": "27112910",
      "descripcion": "Almacenamiento portátil para desperdicio de aceite"
    },
    {
      "clave": "27112911",
      "descripcion": "Copa de aceite"
    },
    {
      "clave": "27112912",
      "descripcion": "Cambiador de aceite"
    },
    {
      "clave": "27112913",
      "descripcion": "Lubricador de aceite"
    },
    {
      "clave": "27112914",
      "descripcion": "Lubricador de grasa"
    },
    {
      "clave": "27112915",
      "descripcion": "Dispensador de gas natural"
    },
    {
      "clave": "27112916",
      "descripcion": "Dispensador de combustible líquido o bomba de gasolina"
    },
    {
      "clave": "27113000",
      "descripcion": "Cepillos"
    },
    {
      "clave": "27113001",
      "descripcion": "Cepillos de aruñar"
    },
    {
      "clave": "27113002",
      "descripcion": "Cepillos de tubo"
    },
    {
      "clave": "27113003",
      "descripcion": "Cepillos de aplicar"
    },
    {
      "clave": "27113004",
      "descripcion": "Cepillos de extensor"
    },
    {
      "clave": "27113005",
      "descripcion": "Cepillo de techado"
    },
    {
      "clave": "27113100",
      "descripcion": "Herramientas de arrastre"
    },
    {
      "clave": "27113101",
      "descripcion": "Cinta guía"
    },
    {
      "clave": "27113102",
      "descripcion": "Tirador de fusible"
    },
    {
      "clave": "27113103",
      "descripcion": "Buril"
    },
    {
      "clave": "27113104",
      "descripcion": "Extractores de estacas"
    },
    {
      "clave": "27113105",
      "descripcion": "Extensor de resortes"
    },
    {
      "clave": "27113200",
      "descripcion": "Juegos de herramientas"
    },
    {
      "clave": "27113201",
      "descripcion": "Conjuntos generales de herramientas"
    },
    {
      "clave": "27113202",
      "descripcion": "Kit de herramientas para ajustar rodamiento"
    },
    {
      "clave": "27113203",
      "descripcion": "Kit de herramienta para computadores"
    },
    {
      "clave": "27113204",
      "descripcion": "Kits de electricista"
    },
    {
      "clave": "27113300",
      "descripcion": "Herramientas manuales de precisión"
    },
    {
      "clave": "27113301",
      "descripcion": "Resortes de retorno a presión"
    },
    {
      "clave": "27121500",
      "descripcion": "Prensas hidráulicas"
    },
    {
      "clave": "27121501",
      "descripcion": "Suspensiones a presión retornables"
    },
    {
      "clave": "27121502",
      "descripcion": "Bastidores de prensa hidráulica"
    },
    {
      "clave": "27121503",
      "descripcion": "Columnas de prensa hidráulica"
    },
    {
      "clave": "27121504",
      "descripcion": "Prensa hidráulica industrial"
    },
    {
      "clave": "27121600",
      "descripcion": "Pistones y cilindros hidráulicos"
    },
    {
      "clave": "27121601",
      "descripcion": "Pistones de cilindro"
    },
    {
      "clave": "27121602",
      "descripcion": "Cilindros hidráulicos"
    },
    {
      "clave": "27121603",
      "descripcion": "Vástagos de pistón de cilindro hidráulico"
    },
    {
      "clave": "27121604",
      "descripcion": "Kits de reparación de cilindro hidráulico o sus componentes"
    },
    {
      "clave": "27121605",
      "descripcion": "Cuerpos de cilindro hidráulico"
    },
    {
      "clave": "27121606",
      "descripcion": "Soportes de montaje para cilindros hidráulicos"
    },
    {
      "clave": "27121700",
      "descripcion": "Accesorios de tubería y manga hidráulica"
    },
    {
      "clave": "27121701",
      "descripcion": "Conectores hidráulicos rápidos"
    },
    {
      "clave": "27121702",
      "descripcion": "Injertos o injertos dobles hidráulicos"
    },
    {
      "clave": "27121703",
      "descripcion": "Férulas"
    },
    {
      "clave": "27121704",
      "descripcion": "Uniones hidráulicas"
    },
    {
      "clave": "27121705",
      "descripcion": "Codos hidráulicos o de compresión"
    },
    {
      "clave": "27121706",
      "descripcion": "Tuercas de férula"
    },
    {
      "clave": "27121707",
      "descripcion": "Conectores de pliegue"
    },
    {
      "clave": "27121800",
      "descripcion": "Herramientas hidráulicas"
    },
    {
      "clave": "27121801",
      "descripcion": "Levantadores de cubierta de manhole"
    },
    {
      "clave": "27121802",
      "descripcion": "Acumuladores hidráulicos"
    },
    {
      "clave": "27121803",
      "descripcion": "Almejas hidráulicas"
    },
    {
      "clave": "27121804",
      "descripcion": "Cizallas hidráulicas"
    },
    {
      "clave": "27121805",
      "descripcion": "Extractor hidráulico"
    },
    {
      "clave": "27121806",
      "descripcion": "Doblador de tubos hidráulico"
    },
    {
      "clave": "27121807",
      "descripcion": "Halador hidráulico"
    },
    {
      "clave": "27121808",
      "descripcion": "Cortador de cadenas hidráulico"
    },
    {
      "clave": "27121809",
      "descripcion": "Herramienta hidráulica para romper tuercas"
    },
    {
      "clave": "27121810",
      "descripcion": "Herramienta engastadora hidráulica manual"
    },
    {
      "clave": "27121811",
      "descripcion": "Accesorio de herramienta engastadora hidráulica"
    },
    {
      "clave": "27121812",
      "descripcion": "Remoto hidráulico"
    },
    {
      "clave": "31141603",
      "descripcion": "Molduras al vacío de vidrio"
    },
    {
      "clave": "31141700",
      "descripcion": "Moldeados por inyección de aire"
    },
    {
      "clave": "31141701",
      "descripcion": "Moldeados plásticos por inyección de aire"
    },
    {
      "clave": "31141702",
      "descripcion": "Moldeados de caucho por inyección de aire"
    },
    {
      "clave": "31141800",
      "descripcion": "Moldeos por inyección y reacción (RIM)"
    },
    {
      "clave": "31141801",
      "descripcion": "Moldeados de inyección de reacción de plástico"
    },
    {
      "clave": "31141802",
      "descripcion": "Moldeados de inyección de reacción de caucho"
    },
    {
      "clave": "31141900",
      "descripcion": "Moldeados de inyección con inserción"
    },
    {
      "clave": "31141901",
      "descripcion": "Moldeado plástico con inserción previa a la inyección"
    },
    {
      "clave": "31142000",
      "descripcion": "Ensambles de moldeados termoplásticos"
    },
    {
      "clave": "31142001",
      "descripcion": "Ensamble de moldeado termoplástico por compresión"
    },
    {
      "clave": "31142002",
      "descripcion": "Ensamble de moldeado termoplástico por inmersión"
    },
    {
      "clave": "31142003",
      "descripcion": "Ensamble de moldeado termoplástico por aire"
    },
    {
      "clave": "31142004",
      "descripcion": "Ensamble de moldeado termoplástico por inyección"
    },
    {
      "clave": "31142005",
      "descripcion": "Ensamble de moldeado"
    },
    {
      "clave": "31142606",
      "descripcion": "Ensamble de engaste termofraguado moldeado por disparo múltiple por inyección de alta precisión"
    },
    {
      "clave": "31142607",
      "descripcion": "Ensamble de engaste termofraguado moldeado por disparo múltiple por transferencia"
    },
    {
      "clave": "31142700",
      "descripcion": "Ensambles de engaste termofraguado moldeado"
    },
    {
      "clave": "31142701",
      "descripcion": "Ensamble de engaste termofraguado moldeado por compresión"
    },
    {
      "clave": "31142702",
      "descripcion": "Ensamble de engaste termofraguado moldeado por inmersión"
    },
    {
      "clave": "31142703",
      "descripcion": "Ensamble de engaste termofraguado moldeado por aire"
    },
    {
      "clave": "31142704",
      "descripcion": "Ensamble de engaste termofraguado moldeado por inyección"
    },
    {
      "clave": "31142705",
      "descripcion": "Ensamble de engaste termofraguado moldeado por inyección asistida por gas"
    },
    {
      "clave": "31142706",
      "descripcion": "Ensamble de engaste termofraguado moldeado por inyección de alta precisión"
    },
    {
      "clave": "31142707",
      "descripcion": "Ensamble de engaste termofraguado moldeado por transferencia"
    },
    {
      "clave": "31143000",
      "descripcion": "Moldeados asistidos por gas"
    },
    {
      "clave": "31143001",
      "descripcion": "Moldeado de plástico asistido por gas"
    },
    {
      "clave": "31143002",
      "descripcion": "Moldeado de espuma estructural asistido por gas"
    },
    {
      "clave": "31381319",
      "descripcion": "Imán anisotrópico prensado y sinterizado, maquinado y recubierto de bario ferrita"
    },
    {
      "clave": "31381320",
      "descripcion": "Imán anisotrópico prensado y sinterizado, maquinado y recubierto de estroncio ferrita"
    },
    {
      "clave": "31381321",
      "descripcion": "Imán anisotrópico prensado y sinterizado, maquinado y recubierto de samario cobalto"
    },
    {
      "clave": "31381322",
      "descripcion": "Imán anisotrópico prensado y sinterizado, maquinado y recubierto de aluminio níquel cobalto ferroso"
    },
    {
      "clave": "31381323",
      "descripcion": "Imán isotrópico prensado y sinterizado recubierto de ferrita"
    },
    {
      "clave": "31381324",
      "descripcion": "Imán isotrópico prensado y sinterizado recubierto de bario ferrita"
    },
    {
      "clave": "31381325",
      "descripcion": "Imán isotrópico prensado y sinterizado recubierto de estroncio ferrita"
    },
    {
      "clave": "31381326",
      "descripcion": "Imán isotrópico prensado y sinterizado recubierto de neodimio"
    },
    {
      "clave": "31381327",
      "descripcion": "Imán isotrópico prensado y sinterizado recubierto de samario cobalto"
    },
    {
      "clave": "31381328",
      "descripcion": "Imán isotrópico prensado y sinterizado recubierto de aluminio níquel cobalto ferroso"
    },
    {
      "clave": "31381329",
      "descripcion": "Imán anisotrópico prensado y sinterizado recubierto de ferrita"
    },
    {
      "clave": "31381330",
      "descripcion": "Imán anisotrópico prensado y sinterizado recubierto de bario ferrita"
    },
    {
      "clave": "31381331",
      "descripcion": "Imán anisotrópico prensado y sinterizado recubierto de estroncio ferrita"
    },
    {
      "clave": "31381332",
      "descripcion": "Imán anisotrópico prensado y sinterizado recubierto de samario cobalto"
    },
    {
      "clave": "31381333",
      "descripcion": "Imán anisotrópico prensado y sinterizado recubierto de aluminio níquel cobalto ferroso"
    },
    {
      "clave": "31381334",
      "descripcion": "Herramienta isotrópica prensada y sinterizada maquinada de ferrita"
    },
    {
      "clave": "31381335",
      "descripcion": "Herramienta isotrópica prensada y sinterizada maquinada de bario ferrita"
    },
    {
      "clave": "31381336",
      "descripcion": "Herramienta isotrópica prensada y sinterizada maquinada de estroncio ferrita"
    },
    {
      "clave": "31381337",
      "descripcion": "Herramienta isotrópica prensada y sinterizada maquinada de neodimio"
    },
    {
      "clave": "31381338",
      "descripcion": "Herramienta isotrópica prensada y sinterizada maquinada de samario cobalto"
    },
    {
      "clave": "31381339",
      "descripcion": "Herramienta isot"
    },
    {
      "clave": "39122332",
      "descripcion": "Relés de interrupción de fase"
    },
    {
      "clave": "39122333",
      "descripcion": "Relés de estado sólido"
    },
    {
      "clave": "39122334",
      "descripcion": "Módulo de relés múltiples o de placa de relés"
    },
    {
      "clave": "39122335",
      "descripcion": "Base o toma de relé"
    },
    {
      "clave": "39122336",
      "descripcion": "Relé intermitente de luz direccional"
    },
    {
      "clave": "39122337",
      "descripcion": "Relé de tablero de circuito impreso"
    },
    {
      "clave": "39131500",
      "descripcion": "Marcadores de alambre y dispositivos para marcar alambre"
    },
    {
      "clave": "39131501",
      "descripcion": "Marcador de cable de pinza"
    },
    {
      "clave": "39131502",
      "descripcion": "Marcador de cable de encogimiento por calor"
    },
    {
      "clave": "39131503",
      "descripcion": "Marcador de cable de deslizar"
    },
    {
      "clave": "39131504",
      "descripcion": "Marcador de cable de identificación"
    },
    {
      "clave": "39131505",
      "descripcion": "Herramienta e impresora para rotular cable"
    },
    {
      "clave": "39131506",
      "descripcion": "Libro de marcador de cable"
    },
    {
      "clave": "39131507",
      "descripcion": "Tarjeta de arcador de cable"
    },
    {
      "clave": "39131508",
      "descripcion": "Rollo y dispensador de arcador de cable"
    },
    {
      "clave": "39131509",
      "descripcion": "Marcador de cable de escribir"
    },
    {
      "clave": "39131600",
      "descripcion": "Dispositivos de protección de alambre"
    },
    {
      "clave": "39131601",
      "descripcion": "Tubo corrugado para cableado interno"
    },
    {
      "clave": "39131602",
      "descripcion": "Manga trenzada expandible"
    },
    {
      "clave": "42294940",
      "descripcion": "Convertidores para endoscopia"
    },
    {
      "clave": "42294941",
      "descripcion": "Sets de drenaje biliar para endoscopia"
    },
    {
      "clave": "42294942",
      "descripcion": "Sellos de instrumentos para endoscopia"
    },
    {
      "clave": "42294943",
      "descripcion": "Unidades de válvulas para endoscopia"
    },
    {
      "clave": "42294944",
      "descripcion": "Kits de accesorios para endoscopia"
    },
    {
      "clave": "42294945",
      "descripcion": "Esponjas para endoscopia"
    },
    {
      "clave": "42294946",
      "descripcion": "Mordazas para endoscopia"
    },
    {
      "clave": "42294947",
      "descripcion": "Diafragmas para endoscopia"
    },
    {
      "clave": "42294948",
      "descripcion": "Piezas bucales para endoscopia"
    },
    {
      "clave": "42294949",
      "descripcion": "Manijas de guía de alambre para endoscopia"
    },
    {
      "clave": "42294950",
      "descripcion": "Brocas o taladros para endoscopia"
    },
    {
      "clave": "42294951",
      "descripcion": "Sets de instrumentos para uniones pequeñas para endoscopia"
    },
    {
      "clave": "42294952",
      "descripcion": "Recuperadores o sets para endoscopia"
    },
    {
      "clave": "42294953",
      "descripcion": "Extractores"
    },
    {
      "clave": "42312207",
      "descripcion": "Kits de remoción o bandejas o paquetes o sets para sutura"
    },
    {
      "clave": "42312208",
      "descripcion": "Removedores de suturas"
    },
    {
      "clave": "42312300",
      "descripcion": "Productos para limpiar la herida y desbridamiento"
    },
    {
      "clave": "42312301",
      "descripcion": "Absorbentes para limpieza de heridas"
    },
    {
      "clave": "42312302",
      "descripcion": "Esponjas de debridación"
    },
    {
      "clave": "42312303",
      "descripcion": "Sistemas de lavado pulsado o accesorios relacionados para el tratamiento de heridas"
    },
    {
      "clave": "42312304",
      "descripcion": "Productos de debridación autolítica para uso médico"
    },
    {
      "clave": "42312305",
      "descripcion": "Productos de debridación enzimática para uso médico"
    },
    {
      "clave": "42312306",
      "descripcion": "Productos de debridación mecánica para uso médico"
    },
    {
      "clave": "42312307",
      "descripcion": "Productos de debridación quirúrgica para uso médico"
    },
    {
      "clave": "42312309",
      "descripcion": "Sistemas de irrigación de heridas"
    },
    {
      "clave": "42312310",
      "descripcion": "Botellas limpiadoras"
    },
    {
      "clave": "42312311",
      "descripcion": "Kits de desinfectantes"
    },
    {
      "clave": "42312312",
      "descripcion": "Bandejas de cuidado de heridas o de limpieza"
    },
    {
      "clave": "42312313",
      "descripcion": "Soluciones de limpieza de heridas"
    },
    {
      "clave": "42312400",
      "descripcion": "Productos para la curación de heridas"
    },
    {
      "clave": "42312401",
      "descripcion": "Relleno de alginato de calcio para heridas"
    },
    {
      "clave": "42312402",
      "descripcion": "Férulas o stents nasales"
    },
    {
      "clave": "42312403",
      "descripcion": "Tiras de relleno para cuidado de heridas"
    },
    {
      "clave": "42312500",
      "descripcion": "Dispositivos de sujeción de heridas, y accesorios y suministros"
    },
    {
      "clave": "42312501",
      "descripcion": "Ligaduras de soporte mamario"
    },
    {
      "clave": "42312502",
      "descripcion": "Ligaduras abdominales"
    },
    {
      "clave": "42312503",
      "descripcion": "Soportes para escroto"
    },
    {
      "clave": "42312504",
      "descripcion": "Prenda de soporte facial"
    },
    {
      "clave": "42312600",
      "descripcion": "Productos de terapia de presión negativa para heridas"
    },
    {
      "clave": "42312601",
      "descripcion": "Equipo de terapia de presión negativa para heridas"
    },
    {
      "clave": "42312602",
      "descripcion": "Kits o sistemas de terapia de presión negativa para heridas"
    },
    {
      "clave": "42321500",
      "descripcion": "Implantes de trauma ortopédico"
    },
    {
      "clave": "42321501",
      "descripcion": "Alambre quirúrgico ortopédico"
    },
    {
      "clave": "42321502",
      "descripcion": "Guía de alambre ortopédico o gancho guía o varilla guía"
    },
    {
      "clave": "42321503",
      "descripcion": "Extensor de gancho óseo o sustituto"
    },
    {
      "clave": "42321504",
      "descripcion": "Clavo intramedular"
    },
    {
      "clave": "42321505",
      "descripcion": "Placas óseas"
    },
    {
      "clave": "42321506",
      "descripcion": "Destornill"
    },
    {
      "clave": "43222627",
      "descripcion": "Dispositivos de acceso de redes digitales de servicios integrados isdn"
    },
    {
      "clave": "43222628",
      "descripcion": "Módems"
    },
    {
      "clave": "43222629",
      "descripcion": "Bancos de módems"
    },
    {
      "clave": "43222630",
      "descripcion": "Unidades de acceso multi estaciones"
    },
    {
      "clave": "43222631",
      "descripcion": "Estaciones base de fidelidad inalámbricas"
    },
    {
      "clave": "43222632",
      "descripcion": "Agregadores de banda ancha"
    },
    {
      "clave": "43222633",
      "descripcion": "Adaptadores de manejo remoto"
    },
    {
      "clave": "43222634",
      "descripcion": "Dispositivo de monitoreo o manejo de redes"
    },
    {
      "clave": "43222635",
      "descripcion": "Kit de actualización de equipo de redes"
    },
    {
      "clave": "43222636",
      "descripcion": "Motor de aplicación de redes"
    },
    {
      "clave": "43222637",
      "descripcion": "Red óptica pasiva de gigabytes gpon"
    },
    {
      "clave": "43222638",
      "descripcion": "Equipos de red de línea dedicada manejada mlln"
    },
    {
      "clave": "43222639",
      "descripcion": "Hardware de subsistemas multimedia de protocolo de internet ip"
    },
    {
      "clave": "43222640",
      "descripcion": "Punto de acceso inalámbrico"
    },
    {
      "clave": "43222641",
      "descripcion": "Dispositivo de protocolo de internet compartido"
    },
    {
      "clave": "43222642",
      "descripcion": "Interruptor de enrutador (router)"
    },
    {
      "clave": "43222643",
      "descripcion": "Probador de cable de red"
    },
    {
      "clave": "43222644",
      "descripcion": "Controlador de"
    },
    {
      "clave": "50192900",
      "descripcion": "Pasta o tallarines natural"
    },
    {
      "clave": "50192901",
      "descripcion": "Pasta sencilla o fideos"
    },
    {
      "clave": "50192902",
      "descripcion": "Pasta o fideos de repisa"
    },
    {
      "clave": "50193000",
      "descripcion": "Bebidas y Comidas Infantiles"
    },
    {
      "clave": "50193001",
      "descripcion": "Comida para infante"
    },
    {
      "clave": "50193002",
      "descripcion": "Bebidas para infantes"
    },
    {
      "clave": "50193100",
      "descripcion": "Materiales y mezclas instantáneas"
    },
    {
      "clave": "50193101",
      "descripcion": "Mezcla de botanas instantáneas"
    },
    {
      "clave": "50193102",
      "descripcion": "Mezcla de postres"
    },
    {
      "clave": "50193103",
      "descripcion": "Mezcla de salsa"
    },
    {
      "clave": "50193104",
      "descripcion": "Base para sopas"
    },
    {
      "clave": "50193105",
      "descripcion": "Mezcla para rebosar o de pan"
    },
    {
      "clave": "50193106",
      "descripcion": "Puré instantáneo"
    },
    {
      "clave": "50193107",
      "descripcion": "Puré de papa instantáneo"
    },
    {
      "clave": "50193108",
      "descripcion": "Puré preparado de varios vegetales"
    },
    {
      "clave": "50193200",
      "descripcion": "Ensaladas preparadas"
    },
    {
      "clave": "50193201",
      "descripcion": "Ensalada fresca preparada"
    },
    {
      "clave": "50193202",
      "descripcion": "Ensalada preparada congelada"
    },
    {
      "clave": "50193203",
      "descripcion": "Ensalada fresca de repisa"
    },
    {
      "clave": "50201700",
      "descripcion": "Café y té"
    },
    {
      "clave": "50201706",
      "descripcion": "Café"
    },
    {
      "clave": "50201707",
      "descripcion": "Sustituto de café"
    },
    {
      "clave": "50201708",
      "descripcion": "Bebida de café"
    },
    {
      "clave": "50201709",
      "descripcion": "Café instantáneo"
    },
    {
      "clave": "50201710",
      "descripcion": "Té de hoja"
    },
    {
      "clave": "50201711",
      "descripcion": "Té instantáneo"
    },
    {
      "clave": "50201712",
      "descripcion": "Bebidas de té"
    },
    {
      "clave": "50201713",
      "descripcion": "Bolsas de té"
    },
    {
      "clave": "50201714",
      "descripcion": "Cremas no lácteas"
    },
    {
      "clave": "50201715",
      "descripcion": "Té de frutas"
    },
    {
      "clave": "50202200",
      "descripcion": "Bebidas alcohólicas"
    },
    {
      "clave": "50202201",
      "descripcion": "Cerveza"
    },
    {
      "clave": "50202202",
      "descripcion": "Cidra"
    },
    {
      "clave": "50202203",
      "descripcion": "Vino"
    },
    {
      "clave": "50202204",
      "descripcion": "Vino fortificado"
    },
    {
      "clave": "50202205",
      "descripcion": "Vino espumoso"
    },
    {
      "clave": "50202206",
      "descripcion": "Licor destilado"
    },
    {
      "clave": "50202207",
      "descripcion": "Cocteles de alcohol o bebidas mixtas"
    },
    {
      "clave": "50202208",
      "descripcion": "Takju - vino de arroz coreano"
    },
    {
      "clave": "50202209",
      "descripcion": "Soju - bebida destilada de grano"
    },
    {
      "clave": "50202210",
      "descripcion": "Vino de arroz"
    },
    {
      "clave": "50202300",
      "descripcion": "Bebidas no alcohólicas"
    },
    {
      "clave": "50202301",
      "descripcion": "Agua"
    },
    {
      "clave": "50202302",
      "descripcion": "Hielo"
    },
    {
      "clave": "50202303",
      "descripcion": "Jugos congelados"
    },
    {
      "clave": "50202304",
      "descripcion": "Jugos de repisa"
    },
    {
      "clave": "50202305",
      "descripcion": "Jugo fresco"
    },
    {
      "clave": "50202306",
      "descripcion": "Refrescos"
    },
    {
      "clave": "50202307",
      "descripcion": "Bebida de chocolate o malta u otros"
    },
    {
      "clave": "50202308",
      "descripcion": "Cocteles libre de alcohol o mezcla de bebidas"
    },
    {
      "clave": "50202309",
      "descripcion": "Bebidas deportivas o de energía"
    },
    {
      "clave": "50202310",
      "descripcion": "Agua mineral"
    },
    {
      "clave": "50202311",
      "descripcion": "Bebida mixta de polvo"
    },
    {
      "clave": "50202400",
      "descripcion": "Jugos o concentrados de cítricos frescos"
    },
    {
      "clave": "50202401",
      "descripcion": "Jugo de mandarina clementina"
    },
    {
      "clave": "50202403",
      "descripcion": "Jugo de kumquat"
    },
    {
      "clave": "50202404",
      "descripcion": "Jugo de limón"
    },
    {
      "clave": "50202405",
      "descripcion": "Jugo de limón amarillo"
    },
    {
      "clave": "50202406",
      "descripcion": "Jugo de lima"
    },
    {
      "clave": "50202407",
      "descripcion": "Jugo de mandarina"
    },
    {
      "clave": "50202408",
      "descripcion": "Jugo de tangelo minneola"
    },
    {
      "clave": "50202409",
      "descripcion": "Jugo de naranja"
    },
    {
      "clave": "50202410",
      "descripcion": "Jugo de pomelo"
    },
    {
      "clave": "54101513",
      "descripcion": "Pisacorbatas"
    },
    {
      "clave": "54101600",
      "descripcion": "Bisutería"
    },
    {
      "clave": "54101601",
      "descripcion": "Brazaletes"
    },
    {
      "clave": "54101602",
      "descripcion": "Collares"
    },
    {
      "clave": "54101603",
      "descripcion": "Anillos"
    },
    {
      "clave": "54101604",
      "descripcion": "Aretes"
    },
    {
      "clave": "54101605",
      "descripcion": "Joyas para el cuerpo"
    },
    {
      "clave": "54101700",
      "descripcion": "Herramientas y materiales de joyería"
    },
    {
      "clave": "54101701",
      "descripcion": "Compuestos conservantes"
    },
    {
      "clave": "54101702",
      "descripcion": "Bloques para producir hemisferios (“dapping punches”)"
    },
    {
      "clave": "54101703",
      "descripcion": "Molinos de alambre"
    },
    {
      "clave": "54101704",
      "descripcion": "Mandriles para joyería"
    },
    {
      "clave": "54101705",
      "descripcion": "Medidores de tamaño para anillos"
    },
    {
      "clave": "54101706",
      "descripcion": "Materiales o accesorios plásticos amigables maleables a bajas temperaturas"
    },
    {
      "clave": "54111500",
      "descripcion": "Relojes de pulsera o bolsillo"
    },
    {
      "clave": "54111501",
      "descripcion": "Relojes de pulso"
    },
    {
      "clave": "54111502",
      "descripcion": "Relojes de bolsillo"
    },
    {
      "clave": "54111503",
      "descripcion": "Relojes cronómetros"
    },
    {
      "clave": "54111504",
      "descripcion": "Cronómetros marinos"
    },
    {
      "clave": "54111505",
      "descripcion": ""
    },
    {
      "clave": "42294101",
      "descripcion": "Lazos de tracción o bucles de tracción o productos relacionados para uso quirúrgico"
    },
    {
      "clave": "42294102",
      "descripcion": "Dispositivos de tracción del cráneo para uso quirúrgico o productos relacionados"
    },
    {
      "clave": "42294103",
      "descripcion": "Collares de tracción para uso quirúrgico"
    },
    {
      "clave": "42294300",
      "descripcion": "Instrumentos de biopsia de invasiva mínima del pecho y suministros y equipo"
    },
    {
      "clave": "42294301",
      "descripcion": "Conductores o módulos de disparo o accesorios para biopsia de seno mínimamente invasiva"
    },
    {
      "clave": "42294302",
      "descripcion": "Unidades de carga premium para biopsia de seno mínimamente invasiva"
    },
    {
      "clave": "42294303",
      "descripcion": "Guías de aguja para biopsia de seno mínimamente invasiva"
    },
    {
      "clave": "42294304",
      "descripcion": "Instrumentos marcadores para biopsia de seno mínimamente invasiva"
    },
    {
      "clave": "42294305",
      "descripcion": "Unidades de vacío o accesorios para biopsia de seno mínimamente invasiva"
    },
    {
      "clave": "42294306",
      "descripcion": "Aguja de localización de seno"
    },
    {
      "clave": "42294400",
      "descripcion": "Sistemas cardiacos y vasculares"
    },
    {
      "clave": "42294401",
      "descripcion": "Sistemas de cosecha de venas"
    },
    {
      "clave": "42294402",
      "descripcion": "Sistemas de visualización coronaria"
    },
    {
      "clave": "42294600",
      "descripcion": "Productos de autotransfusión"
    },
    {
      "clave": "42294601",
      "descripcion": "Bolsas de autotransfusión o transferencia de sangre"
    },
    {
      "clave": "42294602",
      "descripcion": "Kits de contenedores de autotransfusión o kits centrífugos"
    },
    {
      "clave": "42294603",
      "descripcion": "Unidades de autotransfusión"
    },
    {
      "clave": "42294604",
      "descripcion": "Filtros de autotransfusión"
    },
    {
      "clave": "42294605",
      "descripcion": "Reservorios o sus accesorios de autotransfusión"
    },
    {
      "clave": "42294606",
      "descripcion": "Sets o kits de tubos de autotransfusión"
    },
    {
      "clave": "42294607",
      "descripcion": "Válvulas de autotransfusión"
    },
    {
      "clave": "42294711",
      "descripcion": "Hemoconcentradores de perfusión o accesorios"
    },
    {
      "clave": "42295300",
      "descripcion": "Suministros y accesorios para cirugía de corazón abierto y productos relacionados"
    },
    {
      "clave": "42295301",
      "descripcion": "Sopladores o vaporizadores o accesorios de uso quirúrgico"
    },
    {
      "clave": "42295302",
      "descripcion": "Cánulas de perfusión de uso quirúrgico"
    },
    {
      "clave": "42295303",
      "descripcion": "Catéteres o conectores o accesorios de uso quirúrgico"
    },
    {
      "clave": "42295304",
      "descripcion": "Almohadillas para nervios frénicos o almohadas cardíacas de uso quirúrgico"
    },
    {
      "clave": "42295305",
      "descripcion": "Torniquetes u oclusores vasculares o ligantes o accesorios de uso quirúrgico"
    },
    {
      "clave": "42295306",
      "descripcion": "Lanzaderas de vasos o cintas de retracción de uso quirúrgico"
    },
    {
      "clave": "42295307",
      "descripcion": "Decapantes de arteria carótida o accesorios de uso quirúrgico"
    },
    {
      "clave": "42295308",
      "descripcion": "Sets de perfusión coronaria"
    },
    {
      "clave": "42295600",
      "descripcion": "Productos y accesorios de drenaje de fluido cerebroespinal"
    },
    {
      "clave": "42295601",
      "descripcion": "Catéter o adaptador de drenaje ventricular cerebral"
    },
    {
      "clave": "42295602",
      "descripcion": "Bolsa o reservorio de drenaje ventricular cerebral externa"
    },
    {
      "clave": "42295603",
      "descripcion": "Drenaje de fluido cerebroespinal lumbar o kit"
    },
    {
      "clave": "42295803",
      "descripcion": "Catéteres de ablación térmica para uso quirúrgico"
    },
    {
      "clave": "42295900",
      "descripcion": "Stents quirúrgicos"
    },
    {
      "clave": "42295901",
      "descripcion": "Stents gastrointestinales"
    },
    {
      "clave": "42295902",
      "descripcion": "Stents traqueales"
    },
    {
      "clave": "42295904",
      "descripcion": "Stents uterinos o vaginales"
    },
    {
      "clave": "42295905",
      "descripcion": "Endoprótesis o stents de pared o tubos"
    },
    {
      "clave": "42295906",
      "descripcion": "Stents esofágicos"
    },
    {
      "clave": "42296100",
      "descripcion": "Implantes neuroquirúrgicos"
    },
    {
      "clave": "42296101",
      "descripcion": "Clip implantable para aneurisma"
    },
    {
      "clave": "42296102",
      "descripcion": "Clip temporal para aneurisma"
    },
    {
      "clave": "42296103",
      "descripcion": "Reemplazo dural o dispositivo de reparación"
    },
    {
      "clave": "50476314",
      "descripcion": "Batata okinawan orgánica enlatada o envasada"
    },
    {
      "clave": "50476315",
      "descripcion": "Batata naranja orgánica enlatada o envasada"
    },
    {
      "clave": "50476316",
      "descripcion": "Batata"
    }
  ];
  
  // Opcionalmente, puedes definir la interfaz para un mejor tipado en TypeScript:
  /*
  export interface ProductoCartaPorte {
    clave: string;
    descripcion: string;
  }
  */