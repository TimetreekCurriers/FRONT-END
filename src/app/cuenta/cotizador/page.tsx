"use client";

import { useState } from "react";
import * as Select from "@radix-ui/react-select";
import {
  BoxIcon,
  CheckIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from "@radix-ui/react-icons";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { FormFields, OrdenDrawerModern } from "@/components/orderDrawer";
import { useAuth } from "@/components/authProvider";
import { FindAddress } from "@/services/dipomex";
import {
  CourierOptionFromQuoteSoloenvios,
  buildPayloadQuoteSoloenvios,
} from "@/app/utils";
import {
  CreateQuoteSoloenvios,
  CreateQuoteSkydropx,
} from "@/services/shipping";
import {
  Quotation,
  QuotationSoloenviosRequest,
  RateSimple,
  RateSoloenvios,
} from "@/type/soloenvios-quote";
import { Toast } from "@/components/toast";
import { ResponseFindAddressByCP } from "@/type/dipomex";
import { HiOutlineClock } from "react-icons/hi";

export interface CourierOption {
  id: string;
  courier: string;
  logo: string;
  type: string;
  cost: number;
  time: string;
  pickup?: boolean | null;
  source: string;
}

const initialFormState: FormFields = {
  name: "",
  email: "",
  phone: "",
  company: "",
  country: "México",
  postalCode: "",
  state: "",
  city: "",
  neighborhood: "",
  street: "",
  extNumber: "",
  intNumber: "",
  references: "",
  colonies: [],
};

export default function CotizadorPage() {
  const { session } = useAuth();
  const [quotePayload, setQuotePayload] =
    useState<QuotationSoloenviosRequest | null>(null);
  const [originForm, setOriginForm] = useState<FormFields>(initialFormState);
  const [destForm, setDestForm] = useState<FormFields>(initialFormState);
  const [package_type, setPackage_type] = useState("");

  const [toast, setToast] = useState<{
    visible: boolean;
    message: string;
    type?: "success" | "error";
  }>({
    visible: false,
    message: "",
    type: "success",
  });

  const userid = session?.user?.sub;

  const packages = [
    { key: "4G", value: "Caja de cartón" },
    { key: "4F", value: "Tarima" },
    { key: "5H4", value: "Saco (bolsa) de película de plástico" },
    { key: "5M1", value: "Saco (bolsa) de papel de varias hojas" },
    { key: "7H1", value: "Bulto de plástico" },
    { key: "4B", value: "Caja de aluminio" },
  ];

  const [form, setForm] = useState({
    postal_code_origin: "",
    postal_code_destination: "",
    /* packaging: "sobre", */
    length: "",
    height: "",
    width: "",
    weight: "",
    package_type: "4G",
  });

  const [dataToQuote, setDataToQuote] = useState({
    postal_code_origin: "",
    postal_code_destination: "",
    package_type: "",
    length: "",
    height: "",
    width: "",
    weight: "",
  });
  const [loading, setLoading] = useState(false);
  const [loadingTimer, setLoadingTimer] = useState(false);
  const [results, setResults] = useState<CourierOption[] | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedCourier, setSelectedCourier] = useState<CourierOption | null>(
    null
  );
  const [errorQuote, setErrorQuote] = useState(false);
  const balance = session?.user?.balance;

  if (!userid) return <p>No estás logueado</p>;

  type FormChangeTarget = {
    name: string;
    value: string;
  };

  const handleChange = (
    e:
      | React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
      | FormChangeTarget
  ) => {
    // Si viene de un Select Radix (no tiene e.target)
    if (!("target" in e)) {
      const { name, value } = e;
      setForm({ ...form, [name]: value });
      return;
    }

    const { name, value } = e.target;

    // Si es un <select> HTML estándar
    if (e.target instanceof HTMLSelectElement) {
      setForm({ ...form, [name]: value });
      return;
    }

    // Si es un input: solo números
    if (/^\d*$/.test(value)) {
      if (name === "postal_code_origin" || name === "postal_code_destination") {
        if (value.length <= 5) {
          setForm({ ...form, [name]: value });
        }
      } else {
        setForm({ ...form, [name]: value });
      }
    }
  };

  const handleSelectedCourier = (opt: CourierOption) => {
    if (quotePayload) {
      setOriginForm({
        name: "",
        email: "",
        phone: "",
        company: "",
        country: "México",
        postalCode: quotePayload?.quotation?.address_from?.postal_code,
        state: quotePayload?.quotation?.address_from?.area_level1,
        city: quotePayload?.quotation?.address_from?.area_level2,
        neighborhood: quotePayload?.quotation?.address_from?.area_level3,
        street: "",
        extNumber: "",
        intNumber: "",
        references: "",
        colonies: quotePayload?.quotation?.colonies_from ?? [],
      });

      setDestForm({
        name: "",
        email: "",
        phone: "",
        company: "",
        country: "México",
        postalCode: quotePayload?.quotation?.address_to?.postal_code,
        state: quotePayload?.quotation?.address_to?.area_level1,
        city: quotePayload?.quotation?.address_to?.area_level2,
        neighborhood: quotePayload?.quotation?.address_to?.area_level3,
        street: "",
        extNumber: "",
        intNumber: "",
        references: "",
        colonies: quotePayload?.quotation?.colonies_to ?? [],
      });
    }
    setSelectedCourier(opt);
    setErrorQuote(false);
    setTimeout(() => {
      setDrawerOpen(true);
    }, 100);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    const rechargeableW =
      (Number(form?.height) * Number(form?.length) * Number(form?.width)) /
      5000;
    const weight =
      Number(form.weight) > rechargeableW ? Number(form.weight) : rechargeableW;
    setDataToQuote({ ...form, weight: Math.ceil(weight).toString() });
    e.preventDefault();
    setLoading(true);
    setLoadingTimer(true);
    setResults(null);

    const postal_code_origin = form.postal_code_origin;
    const postal_code_destination = form.postal_code_destination;

    let address_from: ResponseFindAddressByCP | null = null;
    let address_to: ResponseFindAddressByCP | null = null;

    try {
      address_from = await FindAddress(postal_code_origin);
    } catch (error) {
      console.log("Error al buscar dirección de origen:", error);
      setToast({
        visible: true,
        message: "No se encontró dirección con el código postal de origen",
        type: "error",
      });
    }

    try {
      address_to = await FindAddress(postal_code_destination);
    } catch (error) {
      console.log("Error al buscar dirección de destino:", error);
      setToast({
        visible: true,
        message: "No se encontró dirección con el código postal de destino",
        type: "error",
      });
      setLoading(false);
      setTimeout(() => {
        setLoadingTimer(false);
      }, 500);
    }

    if (!address_from || !address_to) return;
    const payloadSoloenvios = buildPayloadQuoteSoloenvios(
      address_from,
      address_to,
      [
        {
          length: Number(form.length),
          height: Number(form.height),
          width: Number(form.width),
          weight: Number(Math.ceil(weight)),
        },
      ]
    );

    try {
      setQuotePayload(payloadSoloenvios);

      const sleep = (ms: number) =>
        new Promise((resolve) => setTimeout(resolve, ms));

      let dataStartSoloenvios: any[] | null = null;
      let dataSoloenvios: any[] | null = null;
      let dataStartSkydropx: any[] | null = null;
      let dataSkydropx: any[] | null = null;

      if (
        process.env.NEXT_QUOTE_OPTION === "SOLOENVIOS" ||
        process.env.NEXT_QUOTE_OPTION === "ALL"
      ) {
        for (let i = 0; i < 5; i++) {
          const quoteSoloenvios = await CreateQuoteSoloenvios(
            payloadSoloenvios
          );
          dataSoloenvios = CourierOptionFromQuoteSoloenvios(
            quoteSoloenvios,
            "soloenvios"
          );

          if (
            dataSoloenvios.length > 0 &&
            dataSoloenvios.length > dataStartSoloenvios?.length
          )
            dataStartSoloenvios = dataSoloenvios;
          if (dataSoloenvios && dataSoloenvios.length >= 3) break;

          await sleep(1800);
        }
      }

      if (
        process.env.NEXT_QUOTE_OPTION === "SKYDROPX" ||
        process.env.NEXT_QUOTE_OPTION === "ALL"
      ) {
        for (let i = 0; i < 5; i++) {
          const quoteSkydropx = await CreateQuoteSkydropx(payloadSoloenvios);
          dataSkydropx = CourierOptionFromQuoteSoloenvios(
            quoteSkydropx,
            "skydropx"
          );

          if (
            dataSkydropx.length > 0 &&
            dataSkydropx.length > dataStartSkydropx?.length
          )
            dataStartSkydropx = dataSkydropx;
          if (dataSkydropx && dataSkydropx.length >= 3) break;

          await sleep(1800);
        }
      }

      const soloenviosData =
        dataSoloenvios?.length > 0 ? dataSoloenvios : dataStartSoloenvios;
      const skydropxData =
        dataSkydropx?.length > 0 ? dataSkydropx : dataStartSkydropx;

      const results = comparePrices(soloenviosData, skydropxData);

      const sorted = results.sort((a, b) => a.cost - b.cost);
      setResults(sorted);
    } catch (error) {
      console.log("Error al crear la cotización:", error);
    } finally {
      setLoading(false);
      setTimeout(() => {
        setLoadingTimer(false);
      }, 500);
    }
  };

  const comparePrices = (
    soloenvios: RateSimple[],
    skydropx: RateSimple[]
  ): RateSimple[] => {
    // Añadimos la fuente a cada tarifa
    const markRates = (
      rates: RateSimple[],
      source: "soloenvios" | "skydropx"
    ) => (rates || []).map((r) => ({ ...r, source }));

    // Unimos todas las tarifas
    const allRates = [
      ...markRates(soloenvios, "soloenvios"),
      ...markRates(skydropx, "skydropx"),
    ];

    // Creamos un mapa para almacenar el mejor precio por courier + type
    const bestRatesMap = new Map<string, RateSimple>();

    for (const rate of allRates) {
      const key = `${rate.courier}-${rate.type}`;
      const existing = bestRatesMap.get(key);

      if (!existing || rate.cost < existing.cost) {
        bestRatesMap.set(key, rate);
      }
    }

    return Array.from(bestRatesMap.values());
  };

  const handleReset = () => {
    setForm({
      postal_code_origin: "",
      postal_code_destination: "",
      /* packaging: "sobre", */
      length: "",
      height: "",
      width: "",
      weight: "",
      package_type: "4G",
    });
    setResults(null);
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        staggerChildren: 0.1,
        ease: "easeOut" as const,
        duration: 0.5,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { ease: "easeOut" as const, duration: 0.4 },
    },
  };

  return (
    <motion.div
      className="p-6"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <motion.h1
        className="text-2xl font-semibold mb-6"
        variants={itemVariants}
      >
        Cotizar y crear envíos
      </motion.h1>

      <motion.form
        onSubmit={handleSubmit}
        className="flex flex-col gap-4"
        variants={itemVariants}
      >
        <div className="flex flex-wrap gap-4">
          {/* Código Postal Origen */}
          <div className="flex flex-col flex-1 min-w-[150px] max-w-[150px] w-full sm:w-1/2">
            <label className="text-base font-medium text-gray-700">
              C.P Origen
            </label>
            <input
              type="text"
              name="postal_code_origin"
              value={form.postal_code_origin}
              onChange={handleChange}
              placeholder="C.P"
              required
              pattern="^\d{4,5}$"
              title="El código postal debe tener entre 4 y 5 dígitos"
              className="mt-1 w-full px-3 py-2 text-base border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#101f37] focus:border-[#101f37]"
            />
          </div>

          {/* Código Postal Destino */}
          <div className="flex flex-col flex-1 min-w-[150px] max-w-[150px] w-full sm:w-1/2">
            <label className="text-base font-medium text-gray-700">
              C.P Destino
            </label>
            <input
              type="text"
              name="postal_code_destination"
              value={form.postal_code_destination}
              onChange={handleChange}
              placeholder="C.P"
              required
              pattern="^\d{4,5}$"
              title="El código postal debe tener entre 4 y 5 dígitos"
              className="mt-1 w-full px-3 py-2 text-base border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#101f37] focus:border-[#101f37]"
            />
          </div>

          <div className="flex flex-col flex-1 min-w-[160px] w-full sm:w-1/2">
            <label className="text-base font-medium text-gray-700">
              Tipo de paquete
            </label>

            <Select.Root
              value={form.package_type}
              onValueChange={(value) =>
                handleChange({ name: "package_type", value })
              }
            >
              <Select.Trigger
                className="
        mt-1 w-full px-3 py-2 text-base border border-gray-300 rounded-md 
        focus:outline-none focus:ring-1 focus:ring-[#101f37] focus:border-[#101f37]
        flex justify-between items-center bg-white text-gray-700
      "
              >
                <Select.Value placeholder="Empaque" className="text-gray-700" />
                <Select.Icon>
                  <ChevronDownIcon className="w-4 h-4 text-gray-500" />
                </Select.Icon>
              </Select.Trigger>

              <Select.Portal>
                <Select.Content
                  position="popper"
                  className="
          overflow-hidden bg-white rounded-lg shadow-lg z-50 
          animate-in fade-in slide-in-from-top-1 border border-gray-200
          w-[420px] min-w-[var(--radix-select-trigger-width)] max-w-[95vw]
        "
                >
                  <Select.ScrollUpButton className="flex items-center justify-center text-gray-500 py-1">
                    <ChevronUpIcon className="w-4 h-4" />
                  </Select.ScrollUpButton>

                  <Select.Viewport className="p-1 max-h-[300px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
                    {packages.map((item) => (
                      <Select.Item
                        key={item.key}
                        value={item.key}
                        className="
                relative flex items-start px-8 py-2 text-sm rounded-md cursor-pointer select-none 
                hover:bg-gray-100 focus:bg-gray-100 focus:outline-none text-gray-700
              "
                      >
                        <Select.ItemText>
                          <span className="block whitespace-normal break-words text-left">
                            {item.value}
                          </span>
                        </Select.ItemText>

                        <Select.ItemIndicator className="absolute left-2 inline-flex items-center">
                          <CheckIcon className="w-3 h-3 text-gray-500" />
                        </Select.ItemIndicator>
                      </Select.Item>
                    ))}
                  </Select.Viewport>

                  <Select.ScrollDownButton className="flex items-center justify-center text-gray-500 py-1">
                    <ChevronDownIcon className="w-4 h-4" />
                  </Select.ScrollDownButton>
                </Select.Content>
              </Select.Portal>
            </Select.Root>
          </div>

          {["length", "height", "width", "weight"].map((field) => {
            const labelMap: Record<string, string> = {
              length: "Largo",
              height: "Alto",
              width: "Ancho",
              weight: "Peso",
            };
            const unitMap: Record<string, string> = {
              length: "cm",
              height: "cm",
              width: "cm",
              weight: "kg",
            };
            return (
              <div
                key={field}
                className="flex flex-col flex-1 min-w-[120px] max-w-[120px] w-full sm:w-1/2"
              >
                <label className="text-base font-medium text-gray-700">
                  {labelMap[field]}
                </label>
                <div className="relative">
                  <input
                    type="text"
                    name={field}
                    value={form[field as keyof typeof form]}
                    onChange={handleChange}
                    placeholder="0"
                    required
                    className="mt-1 w-full px-3 py-2 text-base border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#101f37] focus:border-[#101f37]"
                  />
                  <span className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 text-sm">
                    {unitMap[field]}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Botones */}
        <div
          style={{ marginBottom: "32px" }}
          className="flex justify-end mt-2 gap-4 flex-wrap"
        >
          <button
            type="submit"
            className="px-6 py-2 bg-[#101f37] text-white rounded-xl hover:bg-[#0e1b32] cursor-pointer transition-all duration-300 font-medium flex items-center gap-2"
            disabled={loading}
          >
            Cotizar
            {loading && (
              <span className="animate-spin border-2 border-white border-t-transparent rounded-full w-5 h-5"></span>
            )}
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="px-6 py-2 bg-transparent text-gray-700 border border-gray-400 rounded-xl hover:bg-gray-100 cursor-pointer transition-all duration-300 font-medium"
          >
            Limpiar
          </button>
        </div>
      </motion.form>

      <div className="relative mt-6 min-h-[200px]">
        <AnimatePresence>
          {loading && (
            <motion.div
              key="loading"
              className="flex flex-col items-center justify-center py-12 gap-4 bg-gray-50 border border-gray-200 rounded-xl"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
            >
              <motion.p
                className="text-gray-700 font-medium text-lg"
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
              >
                Cotizando tus tarifas...
              </motion.p>
            </motion.div>
          )}
          {results && results?.length === 0 && !loadingTimer && (
            <motion.div
              key="no-results"
              className="mt-6 flex flex-col items-center justify-center text-gray-500 gap-2 p-6 border border-gray-200 rounded-xl bg-gray-50"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.4 }}
            >
              <span className="text-lg font-medium">
                No se encontraron resultados para la búsqueda
              </span>
              <span className="text-sm text-gray-400">
                Intenta modificar los códigos postales o dimensiones
              </span>
            </motion.div>
          )}
          {results && results.length > 0 && !loadingTimer && (
            <motion.div
              key="results"
              className="mt-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.4 }}
            >
              <div className="text-gray-600 mb-2 font-medium">
                Mostrando del más barato al más caro
              </div>

              <div className="flex flex-col border-t border-b border-gray-200 divide-y divide-gray-200">
                {results.map((opt, idx) => (
                  <motion.div
                    key={idx}
                    className="px-4 py-4 hover:bg-gray-50 transition-colors"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                  >
                    {/* Desktop */}
                    <div className="hidden md:flex items-center justify-between">
                      {/* Courier info */}
                      <div className="flex items-center gap-3 min-w-0 w-[28%]">
                        <Image
                          src={opt.logo}
                          alt={`${opt.courier} logo`}
                          width={80}
                          height={80}
                          className="rounded-md"
                        />
                        <div className="flex flex-col truncate">
                          <span className="font-medium truncate">
                            {opt.courier} {opt.type}
                          </span>
                          <span className="text-gray-500 text-base">
                            {opt.time}
                          </span>
                        </div>
                      </div>

                      {/* Nueva columna: Recolección */}
                      <div className="w-[20%] flex items-center justify-center">
                        {opt.pickup ? (
                          <div className="flex items-center gap-2  font-medium">
                            <HiOutlineClock className="w-4 h-4" />

                            <span>Recolección disponible</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 text-gray-400">
                            <HiOutlineClock className="h-5 w-5" />
                            <span>Recolección no disponible</span>
                          </div>
                        )}
                      </div>

                      {/* Precio */}
                      <div className="w-[120px] text-center font-medium">
                        {opt.cost}
                        <span className="text-gray-500 text-base"> MXN</span>
                      </div>

                      {/* Botón */}
                      <div className="flex justify-end relative group">
                        <button
                          onClick={() => {
                            if (balance >= opt.cost) handleSelectedCourier(opt);
                          }}
                          disabled={balance < opt.cost}
                          className={`px-3 py-1 rounded-xl inline-block text-center transition-colors
            ${
              balance < opt.cost
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-[#101f37] text-white hover:bg-[#0e1b32] cursor-pointer"
            }`}
                        >
                          Continuar
                        </button>

                        {balance < opt.cost && (
                          <div
                            className="absolute -top-10 left-1/2 -translate-x-1/2
              bg-red-500 text-white text-sm font-medium
              px-3 py-1 rounded-lg shadow-lg
              opacity-0 group-hover:opacity-100
              transform translate-y-2 group-hover:translate-y-0
              transition-all duration-300
              pointer-events-none
              whitespace-nowrap"
                          >
                            ⚠️ Saldo insuficiente
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Mobile */}
                    <div className="flex flex-col md:hidden">
                      <div className="flex items-center gap-3">
                        <Image
                          src={opt.logo}
                          alt={`${opt.courier} logo`}
                          width={80}
                          height={80}
                          className="rounded-md"
                        />
                        <div className="flex flex-col truncate">
                          <span className="font-medium truncate">
                            {opt.courier} {opt.type}
                          </span>
                          <span className="text-gray-500 text-base">
                            {opt.time}
                          </span>

                          {/* Recolección info */}
                          <div className="mt-1 text-sm">
                            {opt.pickup ? (
                              <div className="flex items-center gap-1  font-medium">
                                <HiOutlineClock className="w-4 h-4" />

                                <span>Recolección disponible</span>
                              </div>
                            ) : (
                              <div className="flex items-center gap-1 text-gray-400">
                                <HiOutlineClock className="h-4 w-4" />
                                <span>Recolección no disponible</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-between mt-3 relative group">
                        <div className="font-medium">
                          {opt.cost}
                          <span className="text-gray-500 text-base"> MXN</span>
                        </div>

                        <button
                          onClick={() => {
                            if (balance >= opt.cost) handleSelectedCourier(opt);
                          }}
                          disabled={balance < opt.cost}
                          className={`px-3 py-1 rounded-xl inline-block text-center transition-colors
            ${
              balance < opt.cost
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-[#101f37] text-white hover:bg-[#0e1b32] cursor-pointer"
            }`}
                        >
                          Continuar
                        </button>

                        {balance < opt.cost && (
                          <div
                            className="absolute -top-10 right-0
              bg-red-500 text-white text-sm font-medium
              px-3 py-1 rounded-lg shadow-lg
              opacity-0 group-hover:opacity-100
              transform translate-y-2 group-hover:translate-y-0
              transition-all duration-300
              pointer-events-none
              whitespace-nowrap"
                          >
                            ⚠️ Saldo insuficiente
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {selectedCourier && (
        <OrdenDrawerModern
          setOriginForm={setOriginForm}
          originForm={originForm}
          setDestForm={setDestForm}
          destForm={destForm}
          setSelectedCourier={setSelectedCourier}
          selectedCourier={selectedCourier}
          open={drawerOpen}
          onOpenChange={setDrawerOpen}
          box={{
            length: dataToQuote.length,
            height: dataToQuote.height,
            width: dataToQuote.width,
            weight: dataToQuote.weight,
            package_type: dataToQuote.package_type,
          }}
          userid={userid}
          setErrorQuote={setErrorQuote}
          errorQuote={errorQuote}
        />
      )}
      <Toast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ ...toast, visible: false })}
      />
    </motion.div>
  );
}
