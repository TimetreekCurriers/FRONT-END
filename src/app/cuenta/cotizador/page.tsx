"use client";

import { useState } from "react";
import * as Select from "@radix-ui/react-select";
import { CheckIcon, ChevronDownIcon } from "@radix-ui/react-icons";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { FormFields, OrdenDrawerModern } from "@/components/orderDrawer";
import { useAuth } from "@/components/authProvider";
import { FindAddress } from "@/services/dipomex";
import {
  CourierOptionFromQuoteSoloenvios,
  buildPayloadQuoteSoloenvios,
} from "@/app/utils";
import { CreateQuoteSoloenvios } from "@/services/shipping";
import { QuotationSoloenviosRequest } from "@/type/soloenvios-quote";
import { Toast } from "@/components/toast";
import { ResponseFindAddressByCP } from "@/type/dipomex";

export interface CourierOption {
  id: string;
  courier: string;
  logo: string;
  type: string;
  cost: number;
  time: string;
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

  const [form, setForm] = useState({
    postal_code_origin: "",
    postal_code_destination: "",
    /* packaging: "sobre", */
    length: "",
    height: "",
    width: "",
    weight: "",
  });
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<CourierOption[] | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedCourier, setSelectedCourier] = useState<CourierOption | null>(
    null
  );
  const [errorQuote, setErrorQuote] = useState(false);
  const balance = session?.user?.balance;

  if (!userid) return <p>No estás logueado</p>;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    // Solo números
    if (/^\d*$/.test(value)) {
      // Validación para códigos postales: entre 4 y 5 dígitos
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
        colonies: [quotePayload?.quotation?.address_from?.area_level3],
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
        colonies: [quotePayload?.quotation?.address_to?.area_level3],
      });
    }
    setSelectedCourier(opt);
    setErrorQuote(false);
    setTimeout(() => {
      setDrawerOpen(true);
    }, 100);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
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
          weight: Number(form.weight),
        },
      ]
    );

    try {
      setQuotePayload(payloadSoloenvios);

      const sleep = (ms: number) =>
        new Promise((resolve) => setTimeout(resolve, ms));

      let dataStart: any[] | null = null;
      let data: any[] | null = null;

      for (let i = 0; i < 5; i++) {
        const quote = await CreateQuoteSoloenvios(payloadSoloenvios);
        data = CourierOptionFromQuoteSoloenvios(quote);

        if (data.length > 0 && data.length > dataStart?.length)
          dataStart = data;
        if (data && data.length >= 3) break;

        await sleep(1800);
      }

      const sorted =
        data?.length > 0
          ? data.sort((a, b) => a.cost - b.cost)
          : dataStart.sort((a, b) => a.cost - b.cost);
      setResults(sorted);
    } catch (error) {
      console.log("Error al crear la cotización:", error);
    } finally {
      setLoading(false);
    }
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
          <div className="flex flex-col flex-1 min-w-[160px] w-full sm:w-1/2">
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
          <div className="flex flex-col flex-1 min-w-[160px] w-full sm:w-1/2">
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

          {/* Embalaje */}
          {/*           <div className="flex flex-col flex-1 min-w-[160px] w-full sm:w-1/2">
            <label className="text-base font-medium text-gray-700">
              Embalaje
            </label>
            <Select.Root
              value={form.packaging}
              onValueChange={(value) => setForm({ ...form, packaging: value })}
            >
              <Select.Trigger className="mt-1 inline-flex items-center justify-between w-full px-3 py-2 text-base border border-gray-300 rounded-md text-left focus:outline-none focus:ring-1 focus:ring-[#101f37] focus:border-[#101f37] bg-white">
                <Select.Value />
                <Select.Icon>
                  <ChevronDownIcon />
                </Select.Icon>
              </Select.Trigger>
              <Select.Content
                className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 animate-slide-fade overflow-hidden"
                sideOffset={5}
              >
                <Select.Viewport>
                  {["sobre", "caja", "tarima"].map((item) => (
                    <Select.Item
                      key={item}
                      value={item}
                      className="px-4 py-2 text-gray-700 cursor-pointer flex items-center justify-between text-base hover:bg-gray-100 focus:outline-none focus:bg-gray-100 select-none"
                    >
                      <Select.ItemText>
                        {item.charAt(0).toUpperCase() + item.slice(1)}
                      </Select.ItemText>
                      <Select.ItemIndicator>
                        <CheckIcon className="text-[#101f37]" />
                      </Select.ItemIndicator>
                    </Select.Item>
                  ))}
                </Select.Viewport>
              </Select.Content>
            </Select.Root>
          </div> */}

          {/* Dimensiones y Peso */}
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
                className="flex flex-col flex-1 min-w-[120px] max-w-[130px] w-full sm:w-1/2"
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
        <div className="flex justify-end mt-2 gap-4 flex-wrap">
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

      <div className="relative">
        {/* Resultados */}
        <AnimatePresence>
          {results !== null &&
            (results.length > 0 ? (
              <motion.div
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
                        <div className="flex items-center gap-3 min-w-0 w-[45%]">
                          <Image
                            src={opt.logo}
                            alt={`${opt.courier} logo`}
                            width={50}
                            height={50}
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

                        <div className="w-[120px] text-center font-medium">
                          {opt.cost}
                          <span className="text-gray-500 text-base"> MXN</span>
                        </div>

                        {/* Botón con tooltip */}
                        <div className="flex justify-end relative group">
                          <button
                            onClick={() => {
                              if (balance >= opt.cost)
                                handleSelectedCourier(opt);
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

                          {/* Popup saldo insuficiente */}
                          {balance < opt.cost && (
                            <div
                              className="
                              absolute -top-10 left-1/2 -translate-x-1/2
                              bg-red-500 text-white text-sm font-medium
                              px-3 py-1 rounded-lg shadow-lg
                              opacity-0 group-hover:opacity-100
                              transform translate-y-2 group-hover:translate-y-0
                              transition-all duration-300
                              pointer-events-none
                              whitespace-nowrap
                            "
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
                            width={50}
                            height={50}
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

                        <div className="flex justify-between mt-3 relative group">
                          <div className="font-medium">
                            {opt.cost}
                            <span className="text-gray-500 text-base">
                              {" "}
                              MXN
                            </span>
                          </div>

                          <button
                            onClick={() => {
                              if (balance >= opt.cost)
                                handleSelectedCourier(opt);
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

                          {/* Popup saldo insuficiente (mobile) */}
                          {balance < opt.cost && (
                            <div
                              className="
                              absolute -top-10 right-0
                              bg-red-500 text-white text-sm font-medium
                              px-3 py-1 rounded-lg shadow-lg
                              opacity-0 group-hover:opacity-100
                              transform translate-y-2 group-hover:translate-y-0
                              transition-all duration-300
                              pointer-events-none
                              whitespace-nowrap
                            "
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
            ) : (
              <motion.div
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
            ))}
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
            length: form.length,
            height: form.height,
            width: form.width,
            weight: form.weight,
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
