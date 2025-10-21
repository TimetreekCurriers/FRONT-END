"use client";

import * as Dialog from "@radix-ui/react-dialog";
import * as Select from "@radix-ui/react-select";
import { AnimatePresence, motion, Variants } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import {
  CheckIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  Cross2Icon,
} from "@radix-ui/react-icons";
import { useRouter } from "next/navigation";
import { FindAll, Create } from "@/services/address"; // tus services
import { CartaPorteData } from "@/app/utils";
import {
  CreateQuoteSoloenvios,
  CreateShipmentSoloenvios,
} from "@/services/shipping"; // tus services

import { FindAddress } from "@/services/dipomex"; // nuevo service
import type { PageOptionsDto } from "@/type/general";
import type { AddressCollectionInterface } from "@/type/address.interface";
import type { ResponseFindAddressByCP } from "@/type/dipomex"; // interface del response
import {
  buildPayloadQuoteSoloenvios,
  buildPayloadshipmentSoloenvios,
  CourierOptionFromQuoteSoloenvios,
} from "@/app/utils";
import { QuotationSoloenviosRequest } from "@/type/soloenvios-quote";
import { CourierOption } from "@/app/cuenta/cotizador/page";
import { Toast } from "./toast";

// ==================== INTERFACES ====================

interface DrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  box: {
    length: string;
    height: string;
    width: string;
    weight: string;
  };
  userid: string;
  setSelectedCourier: (courier: CourierOption | null) => void;
  selectedCourier: CourierOption | null;
  destForm: FormFields;
  originForm: FormFields;
  setDestForm: (form: FormFields) => void;
  setOriginForm: (form: FormFields) => void;
  setErrorQuote: (val: boolean) => void;
  errorQuote: boolean;
}

export type FormFields = {
  id?: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  country: string;
  postalCode: string;
  state: string;
  city: string;
  neighborhood: string;
  street: string;
  extNumber: string;
  intNumber: string;
  references: string;
  colonies?: string[]; // para el dropdown de colonias
};

// ==================== HELPERS ====================

const mapAddressToForm = (addr: AddressCollectionInterface): FormFields => ({
  id: addr._id,
  name: addr.name || "",
  email: addr.email || "",
  phone: addr.phone || "",
  company: addr.company || "",
  country: addr.country || "México",
  postalCode: addr.postal_code || "",
  state: addr.state || "",
  city: addr.municipality || "",
  neighborhood: addr.neighborhood || "",
  street: addr.street || "",
  extNumber: addr.number_ext || "",
  intNumber: addr.number_int || "",
  references: addr.references || "",
});

const mapFormToAddress = (form: FormFields): AddressCollectionInterface => ({
  _id: form.id,
  name: form.name,
  email: form.email,
  phone: form.phone,
  company: form.company,
  country: form.country,
  postal_code: form.postalCode,
  state: form.state,
  municipality: form.city,
  neighborhood: form.neighborhood,
  street: form.street,
  number_ext: form.extNumber,
  number_int: form.intNumber,
  references: form.references,
});

// ==================== COMPONENT ====================

export function OrdenDrawerModern({
  open,
  onOpenChange,
  box,
  userid,
  setSelectedCourier,
  selectedCourier,
  destForm,
  originForm,
  setDestForm,
  setOriginForm,
  setErrorQuote,
  errorQuote,
}: DrawerProps) {
  const router = useRouter();
  const executedRef = useRef(false);
  const [savedAddresses, setSavedAddresses] = useState<
    AddressCollectionInterface[]
  >([]);



  const [toast, setToast] = useState<{
    visible: boolean;
    message: string;
    type?: "success" | "error";
  }>({
    visible: false,
    message: "",
    type: "success",
  });

  const [results, setResults] = useState<
    {
      id: string;
      courier: string;
      logo: string;
      type: string;
      cost: number;
      time: string;
    }[]
  >([]);

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

  const [saveOrigin, setSaveOrigin] = useState(false);
  const [saveDest, setSaveDest] = useState(false);
  const [loadingQuote, setLoadingQuote] = useState(false);
  const [consignmentNote, setConsignmentNote] = useState("");

  /* 
  const [cartaPorte, setCartaPorte] = useState<string>("CP001"); */
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const [loadingCP, setLoadingCP] = useState(false);
  const [loadingAddresses, setLoadingAddresses] = useState<boolean>(true);
  const [debouncedOriginCP, setDebouncedOriginCP] = useState("");
  const [debouncedDestCP, setDebouncedDestCP] = useState("");
  const [loadingCreateOrder, setLoadingCreateOrder] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");

  const filteredData = CartaPorteData.filter(
    (item) =>
      item.descripcion.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.clave.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    if (debouncedOriginCP) {
      const handler = setTimeout(() => {
        if (debouncedOriginCP)
          if (debouncedOriginCP?.length > 3)
            handlePostalCodeDebounced("origin", debouncedOriginCP);
      }, 1000);
      return () => clearTimeout(handler);
    }
  }, [debouncedOriginCP]);

  // Debounce dest
  useEffect(() => {
    if (debouncedDestCP) {
      const handler = setTimeout(() => {
        if (debouncedDestCP?.length > 3)
          handlePostalCodeDebounced("dest", debouncedDestCP);
      }, 1000);
      return () => clearTimeout(handler);
    }
  }, [debouncedDestCP]);

  // ==================== LOAD ADDRESSES ====================

  useEffect(() => {
    if (executedRef.current) return;
    executedRef.current = true;

    const fetchAddresses = async () => {
      try {
        const pagination: PageOptionsDto = { page: 1, perpage: 50 };
        const res = await FindAll(userid, pagination);
        setSavedAddresses(res.records);
      } catch (err) {
        console.error("Error cargando direcciones:", err);
      } finally {
        setLoadingAddresses(false);
      }
    };
    fetchAddresses();
  }, [executedRef]);

  // ==================== HANDLERS ====================

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
    type: "origin" | "dest"
  ) => {
    const { name, value } = e.target;
    if (type === "origin") setOriginForm({ ...originForm, [name]: value });
    else setDestForm({ ...destForm, [name]: value });
  };

  // Autocomplete CP
  const handlePostalCodeDebounced = async (
    type: "origin" | "dest",
    postalCode: string
  ) => {
    try {
      setLoadingCP(true);
      const res: ResponseFindAddressByCP = await FindAddress(postalCode);
      if (!res.error && res.codigo_postal) {
        const updatedForm: FormFields = {
          ...(type === "origin" ? originForm : destForm),
          state: res.codigo_postal.estado,
          city: res.codigo_postal.municipio,
          colonies: res.codigo_postal.colonias,
          neighborhood: res.codigo_postal.colonias[0] || "",
        };

        const payloadSoloenvios = buildPayloadQuoteSoloenvios(
          type === "origin"
            ? res
            : {
                error: false,
                message: "ok",
                codigo_postal: {
                  estado: originForm?.state,
                  estado_abreviatura: originForm?.state,
                  municipio: originForm?.neighborhood,
                  centro_reparto: "",
                  codigo_postal: originForm?.postalCode,
                  colonias: originForm?.neighborhood
                    ? [originForm?.neighborhood]
                    : originForm?.colonies ?? [],
                },
              },
          type === "dest"
            ? res
            : {
                error: false,
                message: "ok",
                codigo_postal: {
                  estado: destForm?.state,
                  estado_abreviatura: destForm?.state,
                  municipio: destForm?.neighborhood,
                  centro_reparto: "",
                  codigo_postal: destForm?.postalCode,

                  colonias: destForm?.neighborhood
                    ? [destForm?.neighborhood]
                    : destForm?.colonies ?? [],
                },
              },
          [
            {
              length: Number(box.length),
              height: Number(box.height),
              width: Number(box.width),
              weight: Number(box.weight),
            },
          ]
        );
        await recalculateQuote(payloadSoloenvios);

        type === "origin"
          ? setOriginForm(updatedForm)
          : setDestForm(updatedForm);
      }
    } catch (err) {
      console.error("Error buscando CP:", err);
      type === "origin"
        ? setOriginForm({
            ...(type === "origin" ? originForm : destForm),
            state: "",
            city: "",
            colonies: [],
            neighborhood: "",
          })
        : setDestForm({
            ...destForm,
            state: "",
            city: "",
            colonies: [],
            neighborhood: "",
          });
      setErrorQuote(true);
      setResults([]);
    } finally {
      setLoadingCP(false);
    }
  };

  const handleGenerateOrder = async () => {
    if (!selectedCourier && (!consignmentNote || consignmentNote === ""))
      return;
    setLoadingCreateOrder(true);
    const originErrors = validateForm(originForm);
    const destErrors = validateForm(destForm);
    const allErrors = { ...originErrors, ...destErrors };
    setErrors(allErrors);

    if (Object.keys(allErrors).length === 0) {
      try {
        const payload = buildPayloadshipmentSoloenvios(
          originForm,
          destForm,
          selectedCourier?.id,
          consignmentNote
        );

        const shipment = await CreateShipmentSoloenvios(userid, payload);

        // Guardar direcciones nuevas si corresponde
        if (saveOrigin && !originForm.id) {
          const created = await Create(userid, mapFormToAddress(originForm));
          setSavedAddresses((prev) => [...prev, created]);
        }
        if (saveDest && !destForm.id) {
          const created = await Create(userid, mapFormToAddress(destForm));
          setSavedAddresses((prev) => [...prev, created]);
        }
        setTimeout(() => {
          setToast({
            visible: true,
            message: "Envío creado, espere un momento...",
            type: "success",
          });
        }, 10000);

        setTimeout(() => {
          window.location.href = `/cuenta/envios/${shipment?._id}`;
        }, 14000);
      } catch (err: any) {
        console.error("Error generando orden:", err);
        setToast({
          visible: true,
          message:
            err?.response?.data?.message ??
            "Hubo un error al procesar la solicitud ❌",
          type: "error",
        });
        setLoadingCreateOrder(false);
      }
    }
  };

  const validateForm = (form: FormFields) => {
    const newErrors: { [key: string]: string } = {};
    Object.entries(form).forEach(([key, value]) => {
      // Ignorar campos opcionales
      if (
        (key === "company" || key === "intNumber") &&
        (!value || (value.length && value?.[0].trim() === ""))
      ) {
        return;
      }
      if (
        !value ||
        (Array.isArray(value)
          ? value.length === 0
          : typeof value === "string" && value.trim() === "")
      ) {
        newErrors[key] = "Este campo es requerido";
      }
      if (!consignmentNote || consignmentNote === "") {
        newErrors["consignmentNote"] = "Este campo es requerido";
      }
    });
    return newErrors;
  };

  const isFormIncomplete = (): boolean => {
    const ignoredFields = ["company", "intNumber"];

    const checkForm = (form: FormFields) =>
      Object.entries(form).some(
        ([key, value]) =>
          !ignoredFields.includes(key) &&
          (value === undefined ||
            value === null ||
            (typeof value === "string" && value.trim() === "") ||
            (Array.isArray(value) && value.length === 0))
      );

    return checkForm(originForm) || checkForm(destForm);
  };

  const handleSelectedAddress = async (
    type: string,
    data: AddressCollectionInterface
  ) => {
    let originData = originForm;
    let destData = destForm;
    if (type === "dest") {
      destData = mapAddressToForm(data);
      setDestForm(destData);
      setSaveDest(false);
      setErrors({});
    }

    if (type === "origin") {
      originData = mapAddressToForm(data);
      setOriginForm(originData);
      setErrors({});
    }
    const payloadSoloenvios = buildPayloadQuoteSoloenvios(
      {
        error: false,
        message: "ok",
        codigo_postal: {
          estado: originData?.state,
          estado_abreviatura: originData?.state,
          municipio: originData?.neighborhood,
          centro_reparto: "",
          codigo_postal: originData?.postalCode,
          colonias: originData?.neighborhood
            ? [originData?.neighborhood]
            : originData?.colonies ?? [],
        },
      },
      {
        error: false,
        message: "ok",
        codigo_postal: {
          estado: destData?.state,
          estado_abreviatura: destData?.state,
          municipio: destData?.neighborhood,
          centro_reparto: "",
          codigo_postal: destData?.postalCode,
          colonias: destData?.neighborhood
            ? [destData?.neighborhood]
            : destData?.colonies ?? [],
        },
      },
      [
        {
          length: Number(box.length),
          height: Number(box.height),
          width: Number(box.width),
          weight: Number(box.weight),
        },
      ]
    );

    await recalculateQuote(payloadSoloenvios);
  };
  const recalculateQuote = async (
    payloadSoloenvios: QuotationSoloenviosRequest
  ) => {
    try {
      setLoadingQuote(true);
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
      setErrorQuote(false);
    } catch (error) {
      console.error("Error recalculando cotización:", error);
      setSelectedCourier(null);
      setResults([]);
      setErrorQuote(true);
    } finally {
      setLoadingQuote(false);
      /*  setSelectedCourier(null); */
    }
  };

  // ==================== UI VARIANTS ====================
  const drawerVariants: Variants = {
    hidden: { x: "100%" },
    visible: {
      x: "0%",
      transition: { type: "spring", stiffness: 300, damping: 30 },
    },
    exit: {
      x: "100%",
      transition: { type: "spring", stiffness: 300, damping: 30 },
    },
  };

  const overlayVariants: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.25 } },
    exit: { opacity: 0, transition: { duration: 0.25 } },
  };

  const labels: Record<string, string> = {
    name: "Nombre*",
    email: "Email*",
    phone: "Teléfono*",
    company: "Compañía",
    country: "País*",
    postalCode: "C.P*",
    state: "Estado*",
    city: "Ciudad*",
    neighborhood: "Colonia*",
    street: "Calle*",
    extNumber: "No. exterior*",
    intNumber: "No. interior",
    references: "Referencias*",
  };

  const inputGridClasses = "flex flex-col flex-1 min-w-[120px]";

  // ==================== RENDER FORM ====================
  const renderForm = (
    form: FormFields,
    type: "origin" | "dest",
    saveSwitch: boolean,
    setSaveSwitch: (val: boolean) => void
  ) => (
    <div className="flex flex-col gap-4 mb-6">
      {/* Select de direcciones */}
      <div className="flex flex-col mb-4">
        <label className="text-base font-medium text-gray-700 mb-1">
          Seleccionar de directorio
        </label>
        <Select.Root
          value={form.id || ""}
          onValueChange={(value) => {
            if (value === "new") {
              const empty = { ...initialFormState };
              type === "origin" ? setOriginForm(empty) : setDestForm(empty);
              setResults([]);
              setSaveSwitch(true);
            } else {
              const selected = savedAddresses.find(
                (addr) => addr._id === value
              );
              if (!selected) return;
              handleSelectedAddress(type, selected);
              setSaveSwitch(false);
            }
          }}
        >
          <Select.Trigger className="cursor-pointer mt-1 inline-flex items-center justify-between w-full px-3 py-2 border border-gray-300 rounded-md bg-white">
            <Select.Value
              placeholder={loadingAddresses ? "Cargando..." : "Selecciona"}
            />
            <Select.Icon>
              <ChevronDownIcon />
            </Select.Icon>
          </Select.Trigger>
          <Select.Content className="absolute mt-1 w-full bg-white rounded-md shadow-lg z-50">
            <Select.Viewport>
              {loadingAddresses ? (
                <div className="px-4 py-2 text-gray-500">Cargando...</div>
              ) : (
                savedAddresses.map((addr) => (
                  <Select.Item
                    key={addr._id}
                    value={addr._id!}
                    className="px-4 py-2 cursor-pointer hover:bg-gray-100 flex justify-between items-center rounded-md"
                  >
                    <Select.ItemText>{addr.name}</Select.ItemText>
                    <Select.ItemIndicator>
                      <CheckIcon className="text-blue-500" />
                    </Select.ItemIndicator>
                  </Select.Item>
                ))
              )}
              <Select.Item
                value="new"
                className="px-4 py-2 cursor-pointer hover:bg-gray-100"
              >
                <Select.ItemText>➕ Nueva dirección</Select.ItemText>
              </Select.Item>
            </Select.Viewport>
          </Select.Content>
        </Select.Root>
      </div>

      {/* Campos */}
      <div className="flex flex-wrap gap-4">
        {Object.keys(form).map((key) => {
          if (key === "id" || key === "colonies") return null;

          const isTextArea = key === "references";
          const value = form[key as keyof typeof form];

          if (key === "postalCode") {
            return (
              <div key={key} className={inputGridClasses}>
                <label className="text-base font-medium text-gray-700">
                  {labels[key]}
                </label>
                <input
                  type="text"
                  name={key}
                  value={value}
                  onChange={(e) => {
                    handleChange(e, type);
                    if (type === "origin") setDebouncedOriginCP(e.target.value);
                    else setDebouncedDestCP(e.target.value);
                  }}
                  className={`mt-1 w-full px-3 py-2 text-base border rounded-md ${
                    errors[key] ? "border-red-500" : "border-gray-300"
                  }`}
                />

                {loadingCP && (
                  <span className="text-gray-500 text-sm">
                    Buscando código postal...
                  </span>
                )}
                {errors[key] && (
                  <span className="text-red-500 text-sm mt-1">
                    {errors[key]}
                  </span>
                )}
              </div>
            );
          }

          if (key === "name") {
            return (
              <div key={key} className={inputGridClasses}>
                <label className="text-base font-medium text-gray-700">
                  {labels[key]}
                </label>
                <input
                  maxLength={30}
                  type="text"
                  name={key}
                  value={value}
                  onChange={(e) => handleChange(e, type)}
                  className={`mt-1 w-full px-3 py-2 text-base border rounded-md ${
                    errors[key] ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {errors[key] && (
                  <span className="text-red-500 text-sm mt-1">
                    {errors[key]}
                  </span>
                )}
              </div>
            );
          }

          if (
            key === "neighborhood" &&
            form.colonies &&
            form.colonies.length > 0
          ) {
            // Dropdown de colonias
            /* hover:bg-gray-100 */
            return (
              <div key={key} className={inputGridClasses}>
                <label className="text-base font-medium text-gray-700">
                  {labels[key]}
                </label>
                <Select.Root
                  value={form.neighborhood}
                  onValueChange={(val) => {
                    handleChange(
                      {
                        target: {
                          name: key,
                          value: val,
                        },
                      } as unknown as React.ChangeEvent<
                        | HTMLInputElement
                        | HTMLTextAreaElement
                        | HTMLSelectElement
                      >,
                      type
                    );
                  }}
                >
                  <Select.Trigger
                    className={`mt-1 w-full flex items-center justify-between px-3 py-2 text-base border rounded-md bg-white  cursor-pointer
      ${errors[key] ? "border-red-500" : "border-gray-300"}
      focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    aria-label={key}
                  >
                    {/* ✅ Forzamos truncamiento del texto seleccionado */}
                    <Select.Value placeholder="Selecciona una colonia" asChild>
                      <span className="truncate text-ellipsis overflow-hidden whitespace-nowrap flex-1 text-left">
                        {form.neighborhood || "Selecciona una colonia"}
                      </span>
                    </Select.Value>

                    <Select.Icon className="flex-shrink-0 ml-2">
                      <ChevronDownIcon />
                    </Select.Icon>
                  </Select.Trigger>

                  <Select.Portal>
                    <Select.Content
                      className="overflow-hidden bg-white rounded-md shadow-md z-50 animate-in fade-in slide-in-from-top-1"
                      position="popper"
                    >
                      <Select.ScrollUpButton className="flex items-center justify-center text-gray-500">
                        <ChevronUpIcon />
                      </Select.ScrollUpButton>

                      {/* 🔽 Scroll con altura máxima */}
                      <Select.Viewport className="p-1 max-h-60 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
                        {form.colonies.map((col: string) => (
                          <Select.Item
                            key={col}
                            value={col}
                            className="relative flex items-center px-8 py-2 text-sm rounded-md cursor-pointer 
              select-none hover:hover:bg-gray-100  focus:hover:bg-gray-100  focus:outline-none"
                          >
                            {/* También truncamos las opciones largas */}
                            <Select.ItemText>
                              <span className="truncate text-ellipsis overflow-hidden whitespace-nowrap block max-w-[220px]">
                                {col}
                              </span>
                            </Select.ItemText>

                            <Select.ItemIndicator className="absolute left-2 inline-flex items-center">
                              <CheckIcon />
                            </Select.ItemIndicator>
                          </Select.Item>
                        ))}
                      </Select.Viewport>

                      <Select.ScrollDownButton className="flex items-center justify-center text-gray-500">
                        <ChevronDownIcon />
                      </Select.ScrollDownButton>
                    </Select.Content>
                  </Select.Portal>
                </Select.Root>

                {errors[key] && (
                  <span className="text-red-500 text-sm mt-1">
                    {errors[key]}
                  </span>
                )}
              </div>
            );
          }

          if (isTextArea) {
            return (
              <div key={key} className="w-full flex flex-col">
                <label className="text-base font-medium text-gray-700">
                  {labels[key]}
                </label>
                <textarea
                  name={key}
                  value={value}
                  onChange={(e) => handleChange(e, type)}
                  className={`mt-1 w-full px-3 py-2 text-base border rounded-md ${
                    errors[key] ? "border-red-500" : "border-gray-300"
                  }`}
                  rows={3}
                />
                {errors[key] && (
                  <span className="text-red-500 text-sm mt-1">
                    {errors[key]}
                  </span>
                )}
              </div>
            );
          }

          return (
            <div key={key} className={inputGridClasses}>
              <label className="text-base font-medium text-gray-700">
                {labels[key]}
              </label>
              <input
                type="text"
                name={key}
                disabled={
                  key === "country" ||
                  key === "state" ||
                  key === "neighborhood" ||
                  key === "city"
                }
                value={value}
                onChange={(e) => handleChange(e, type)}
                className={`mt-1 w-full px-3 py-2 text-base border rounded-md ${
                  errors[key] ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors[key] && (
                <span className="text-red-500 text-sm mt-1">{errors[key]}</span>
              )}
            </div>
          );
        })}
      </div>

      {/* Toggle switch */}
      {!form.id && (
        <div className="mt-2 flex items-center gap-3">
          <span className="text-sm text-gray-700">Guardar dirección</span>
          <button
            type="button"
            onClick={() => setSaveSwitch(!saveSwitch)}
            className={`cursor-pointer relative inline-flex h-6 w-11 items-center rounded-full ${
              saveSwitch ? "bg-[#101f37]" : "bg-gray-300"
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white ${
                saveSwitch ? "translate-x-5" : "translate-x-1"
              }`}
            />
          </button>
        </div>
      )}
    </div>
  );

  // ==================== RETURN ====================
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        {/* Overlay */}
        <AnimatePresence>
          {open && (
            <Dialog.Overlay asChild forceMount>
              <motion.div
                className="fixed inset-0 bg-black/40 z-40"
                variants={overlayVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
              />
            </Dialog.Overlay>
          )}
        </AnimatePresence>

        {/* Drawer */}
        <AnimatePresence>
          {open && (
            <Dialog.Content asChild forceMount>
              <motion.div
                className="fixed top-0 right-0 h-full w-full lg:w-[900px] bg-white shadow-2xl flex flex-col lg:flex-row z-50 overflow-y-auto lg:overflow-hidden"
                variants={drawerVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
              >
                <Dialog.Title asChild>
                  <VisuallyHidden>Detalles del envío</VisuallyHidden>
                </Dialog.Title>

                {/* Header */}
                <div className="absolute top-0 left-0 w-full h-[46px] lg:h-[63px] bg-white border-b border-gray-300 flex items-center justify-between px-6 z-50">
                  <h1 className="text-xl font-semibold">Generar guía</h1>
                  <Dialog.Close asChild>
                    <button
                      className="p-2 rounded-md hover:bg-gray-100"
                      aria-label="Cerrar"
                    >
                      <Cross2Icon className="w-5 h-5" />
                    </button>
                  </Dialog.Close>
                </div>

                {/* Columna izquierda */}
                <div className="flex-1 pt-[60px] lg:pt-[80px] p-6 pb-[36px] lg:border-r border-gray-300 space-y-6 lg:overflow-y-auto">
                  {/* Origen */}
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold">
                      Formulario de Origen
                    </h2>
                    <button
                      type="button"
                      className="text-sm text-[#101f37] hover:underline"
                      onClick={() => {
                        setOriginForm(initialFormState);
                        setSaveDest(false);
                        setResults([]);
                      }}
                    >
                      Limpiar
                    </button>
                  </div>
                  {renderForm(originForm, "origin", saveOrigin, setSaveOrigin)}

                  {/* Destino */}
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold">
                      Formulario de Destinatario
                    </h2>
                    <button
                      type="button"
                      className="text-sm text-[#101f37] hover:underline"
                      onClick={() => {
                        setDestForm(initialFormState);
                        setSaveDest(false);
                        setResults([]);
                      }}
                    >
                      Limpiar
                    </button>
                  </div>
                  {renderForm(destForm, "dest", saveDest, setSaveDest)}
                  <label className="text-base font-medium text-gray-700 mb-1">
                    Carta porte*
                  </label>
                  <Select.Root
                    value={consignmentNote}
                    onValueChange={setConsignmentNote}
                  >
                    <Select.Trigger className="cursor-pointer mt-1 inline-flex items-center justify-between w-full px-3 py-2 border border-gray-300 rounded-md bg-white">
                      <Select.Value placeholder="Carta porte" />
                      <Select.Icon>
                        <ChevronDownIcon />
                      </Select.Icon>
                    </Select.Trigger>

                    <Select.Portal>
                      <Select.Content
                        className="z-50 mt-1 bg-white border border-gray-200 rounded-md shadow-lg w-[var(--radix-select-trigger-width)]"
                        position="popper"
                      >
                        <div className="p-2 border-b border-gray-200">
                          <input
                            type="text"
                            placeholder="Buscar..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            onKeyDown={(e) => e.stopPropagation()}
                            className="w-full px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-400 text-sm"
                          />
                        </div>

                        <Select.Viewport className="max-h-48 overflow-y-auto">
                          {filteredData.length > 0 ? (
                            filteredData.map((code) => (
                              <Select.Item
                                key={code.clave}
                                value={code.clave}
                                className="px-4 py-2 cursor-pointer hover:bg-gray-100 flex justify-between items-center rounded-md text-sm"
                              >
                                <Select.ItemText>
                                  {code.descripcion}
                                </Select.ItemText>
                                <Select.ItemIndicator>
                                  <CheckIcon className="text-blue-500" />
                                </Select.ItemIndicator>
                              </Select.Item>
                            ))
                          ) : (
                            <div className="px-4 py-2 text-gray-400 text-sm">
                              Sin resultados
                            </div>
                          )}
                        </Select.Viewport>
                      </Select.Content>
                    </Select.Portal>
                  </Select.Root>
                </div>

                <div className="flex flex-col lg:flex-row gap-4">
                  {results && results.length > 0 && (
                    <div className="w-full lg:w-[380px] p-6 pt-[24px] lg:pt-[80px] flex flex-col flex-shrink-0 bg-white lg:bg-gray-50 border-t border-gray-300 lg:border-t-0 relative">
                      {/* Título */}
                      <h2 className="text-lg font-semibold mb-4">
                        Selecciona la paquetería
                      </h2>

                      <div className="flex flex-col gap-6 lg:bg-white lg:rounded-2xl lg:p-5 lg:border lg:border-gray-300">
                        {results.map((opt, idx) => (
                          <motion.div
                            key={idx}
                            className="flex flex-col p-3 border rounded-lg hover:shadow-sm transition-shadow bg-white gap-3"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.05 }}
                          >
                            {/* Fila 1: Logo + nombre + días */}
                            <div className="flex items-center gap-2 md:gap-3 min-w-0">
                              <Image
                                src={opt.logo}
                                alt={`${opt.courier} logo`}
                                width={40}
                                height={40}
                                className="rounded-md flex-shrink-0"
                              />
                              <div className="flex flex-col truncate text-sm">
                                <span className="font-medium truncate">
                                  {opt.courier} {opt.type}
                                </span>
                                <span className="text-gray-500">
                                  {opt.time}
                                </span>
                              </div>
                            </div>

                            {/* Fila 2: Costo + botón */}
                            <div className="flex items-center justify-between mt-2">
                              <div className="font-medium text-sm">
                                {opt.cost}{" "}
                                <span className="text-gray-500">MXN</span>
                              </div>
                              <button
                                onClick={() => {
                                  setSelectedCourier(opt);
                                  setResults([]);
                                }}
                                className="px-3 py-1 bg-[#101f37] text-white rounded-lg hover:bg-[#0e1b32] text-sm cursor-pointer"
                              >
                                Continuar
                              </button>
                            </div>
                          </motion.div>
                        ))}
                      </div>

                      {/* Overlay con blur y loading */}
                      {loadingQuote && (
                        <div className="absolute inset-0 bg-white/70 backdrop-blur-sm flex items-center justify-center rounded-2xl z-10">
                          <div className="animate-spin rounded-full h-10 w-10 border-4 border-[#101f37] border-t-transparent"></div>
                        </div>
                      )}
                    </div>
                  )}
                  {selectedCourier && results.length === 0 && !errorQuote && (
                    <div className="w-full lg:w-[380px] p-6 pt-[24px] lg:pt-[80px] flex flex-col flex-shrink-0 bg-white lg:bg-gray-50 border-t border-gray-300 lg:border-t-0 relative">
                      {/* Card principal */}
                      <div className="flex flex-col gap-6 lg:bg-white lg:rounded-2xl lg:p-5 lg:border lg:border-gray-300 relative">
                        <div className="flex items-center gap-4">
                          <Image
                            src={selectedCourier?.logo}
                            alt={`${selectedCourier?.courier} logo`}
                            width={50}
                            height={50}
                            className="rounded-md"
                          />
                          <div>
                            <p className="font-semibold text-lg">
                              {selectedCourier?.courier}
                            </p>
                            <p className="text-gray-600">
                              {selectedCourier?.type}
                            </p>
                            <p className="text-gray-500 text-sm">
                              {selectedCourier?.time}
                            </p>
                          </div>
                        </div>

                        {/* Dimensiones */}
                        <div className="border-t border-gray-300 pt-4">
                          <h3 className="font-semibold mb-2">
                            Dimensiones del paquete
                          </h3>
                          <div className="flex items-center gap-6">
                            <div className="space-y-1.5 text-sm">
                              <p>Largo: {box.length} cm</p>
                              <p>Ancho: {box.width} cm</p>
                              <p>Alto: {box.height} cm</p>
                              <p>Peso: {box.weight} kg</p>
                            </div>
                            <Image
                              src="https://i.postimg.cc/HnNjw6kZ/dimension.png"
                              alt="box"
                              width={70}
                              height={70}
                              className="flex-shrink-0"
                            />
                          </div>
                        </div>

                        {/* Resumen */}
                        <div className="border-t border-gray-300 pt-4">
                          <div className="mb-4">
                            <h3 className="font-semibold mb-2">📍 Origen</h3>
                            <p className="text-sm text-gray-700">
                              {originForm.name}
                            </p>
                            <p className="text-sm text-gray-700">
                              {originForm.street} {originForm.extNumber},{" "}
                              {originForm.neighborhood}
                            </p>
                            <p className="text-sm text-gray-700">
                              {originForm.city}, {originForm.state}, CP{" "}
                              {originForm.postalCode}
                            </p>
                            <p className="text-sm text-gray-700">
                              {originForm.phone}
                            </p>
                          </div>

                          <div>
                            <h3 className="font-semibold mb-2">📦 Destino</h3>
                            <p className="text-sm text-gray-700">
                              {destForm.name}
                            </p>
                            <p className="text-sm text-gray-700">
                              {destForm.street} {destForm.extNumber},{" "}
                              {destForm.neighborhood}
                            </p>
                            <p className="text-sm text-gray-700">
                              {destForm.city}, {destForm.state}, CP{" "}
                              {destForm.postalCode}
                            </p>
                            <p className="text-sm text-gray-700">
                              {destForm.phone}
                            </p>
                          </div>
                        </div>

                        {/* Total */}
                        <div className="border-t border-gray-300 pt-4 mt-auto">
                          <p className="text-lg font-semibold">
                            Total: $ {selectedCourier?.cost} MXN
                          </p>
                          <button
                            onClick={handleGenerateOrder}
                            disabled={loadingCreateOrder || isFormIncomplete()}
                            className={`mt-3 w-full px-4 py-2 rounded-xl transition text-white 
    ${
      loadingCreateOrder || isFormIncomplete()
        ? "bg-gray-400 cursor-not-allowed"
        : "bg-[#101f37] hover:bg-[#0e1b32] cursor-pointer"
    }`}
                          >
                            {loadingCreateOrder ? (
                              <div className="flex items-center justify-center gap-2">
                                <svg
                                  className="animate-spin h-5 w-5 text-white"
                                  xmlns="http://www.w3.org/2000/svg"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                >
                                  <circle
                                    className="opacity-25"
                                    cx="12"
                                    cy="12"
                                    r="10"
                                    stroke="currentColor"
                                    strokeWidth="4"
                                  ></circle>
                                  <path
                                    className="opacity-75"
                                    fill="currentColor"
                                    d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                                  ></path>
                                </svg>
                                Generando envío...
                              </div>
                            ) : (
                              "Generar Envío"
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Overlay con blur y loading */}
                      {loadingQuote && (
                        <div className="absolute inset-0 bg-white/70 backdrop-blur-sm flex items-center justify-center rounded-2xl z-10">
                          <div className="animate-spin rounded-full h-10 w-10 border-4 border-[#101f37] border-t-transparent"></div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </motion.div>
            </Dialog.Content>
          )}
        </AnimatePresence>
        <Toast
          visible={toast.visible}
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ ...toast, visible: false })}
        />
      </Dialog.Portal>
    </Dialog.Root>
  );
}
