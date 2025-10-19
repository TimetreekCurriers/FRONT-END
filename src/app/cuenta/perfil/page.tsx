"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { getUser, updateUser, uploadTaxCertificate } from "@/services/user";
import type { UserCollectionInterface } from "@/type/user.interface";
import { useAuth } from "@/components/authProvider";
import { Toast } from "@/components/toast";

export default function MiCuentaPage() {
  const { session, setSession } = useAuth();
  const [user, setUser] = useState<UserCollectionInterface | null>(null);
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    second_last_name: "",
    phone: "",
    email: "",
  });
  const [toast, setToast] = useState({
    visible: false,
    message: "",
    type: "success" as "success" | "error",
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [changed, setChanged] = useState(false);
  const [loadingUser, setLoadingUser] = useState(true);
  const [loadingSave, setLoadingSave] = useState(false);

  // Estados para constancia fiscal
  const [taxFile, setTaxFile] = useState<File | null>(null);
  const [existingTaxFile, setExistingTaxFile] = useState<string | null>(null);
  const [loadingTax, setLoadingTax] = useState(false);

  const phoneRegex = /^\d{10}$/;

  useEffect(() => {
    const fetchUser = async () => {
      if (!session?.user?.sub) return;
      try {
        setLoadingUser(true);
        const data = await getUser(session.user.sub);
        setUser(data);
        setForm({
          first_name: data.first_name || "",
          last_name: data.last_name || "",
          second_last_name: data.second_last_name || "",
          phone: data.phone || "",
          email: data.email || "",
        });
        // Si existe constancia fiscal, guardamos la URL
        if (data.tax_status_certificate) {
          setExistingTaxFile(data.tax_status_certificate);
        }
      } catch (err) {
        console.error("Error al obtener el usuario", err);
      } finally {
        setLoadingUser(false);
      }
    };
    fetchUser();
  }, [session?.user?.sub]);

  useEffect(() => {
    if (!user) return;
    const hasChanges =
      form.first_name !== (user.first_name || "") ||
      form.last_name !== (user.last_name || "") ||
      form.second_last_name !== (user.second_last_name || "") ||
      form.phone !== (user.phone || "");
    setChanged(hasChanges);
  }, [form, user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (["first_name", "last_name", "second_last_name"].includes(name)) {
      const filteredValue = value.replace(/[^A-Za-z\s]/g, "");
      setForm((prev) => ({ ...prev, [name]: filteredValue }));
    } else if (name === "phone") {
      const filteredValue = value.replace(/\D/g, "");
      setForm((prev) => ({ ...prev, [name]: filteredValue }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!changed || !user) return;

    const newErrors: { [key: string]: string } = {};
    if (!form.first_name) newErrors.first_name = "Requerido";
    if (!form.last_name) newErrors.last_name = "Requerido";
    if (!form.second_last_name) newErrors.second_last_name = "Requerido";
    if (!phoneRegex.test(form.phone))
      newErrors.phone = "Debe tener 10 dígitos numéricos";

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    setLoadingSave(true);
    try {
      const updatedUser = await updateUser(session!.user!.sub, form);
      setSession({
        ...session,
        user: {
          ...session.user,
          name: updatedUser?.first_name,
          email: updatedUser?.email,
          balance: updatedUser?.balance,
        },
      });
      setUser(updatedUser);
      setChanged(false);
      setToast({
        visible: true,
        message: "Datos actualizados ✔",
        type: "success",
      });
    } catch (err) {
      console.error("Error al actualizar usuario", err);
      setToast({
        visible: true,
        message: "Error al actualizar usuario ❌",
        type: "error",
      });
    } finally {
      setLoadingSave(false);
    }
  };

  const handleReset = () => {
    if (!user) return;
    setForm({
      first_name: user.first_name || "",
      last_name: user.last_name || "",
      second_last_name: user.second_last_name || "",
      phone: user.phone || "",
      email: user.email || "",
    });
    setErrors({});
  };

  const handleTaxUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taxFile) {
      setToast({
        visible: true,
        message: "Selecciona un archivo antes de subirlo ❌",
        type: "error",
      });
      return;
    }

    const formData = new FormData();
    formData.append("file", taxFile);

    try {
      setLoadingTax(true);
      await uploadTaxCertificate(session!.user!.sub, formData);
      setToast({
        visible: true,
        message: "Constancia de situación fiscal subida correctamente ✔",
        type: "success",
      });
      // Actualizamos el preview del archivo con el nuevo
      setExistingTaxFile(URL.createObjectURL(taxFile));
      setTaxFile(null);
    } catch (err) {
      console.error("Error al subir constancia fiscal", err);
      setToast({
        visible: true,
        message: "Error al subir el archivo ❌",
        type: "error",
      });
    } finally {
      setLoadingTax(false);
    }
  };

  if (loadingUser) return <p>Cargando...</p>;
  if (!user) return <p>Error cargando usuario</p>;

  const fields = [
    { label: "Nombre", name: "first_name" },
    { label: "Apellido Paterno", name: "last_name" },
    { label: "Apellido Materno", name: "second_last_name" },
    { label: "Teléfono", name: "phone", type: "tel" },
    { label: "Correo", name: "email", type: "email", readOnly: true },
  ];

  return (
    <motion.div
      className="p-6 w-full"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <motion.h1 className="text-2xl font-semibold mb-6">
        Mi Cuenta
      </motion.h1>

      {/* FORMULARIO PERFIL */}
      <motion.form
        onSubmit={handleSave}
        className="flex flex-wrap gap-6 items-end w-full mb-10"
      >
        {fields.map((field) => (
          <div key={field.name} className="flex flex-col flex-1 min-w-[260px]">
            <label className="text-base font-medium text-gray-700 mb-1">
              {field.label}
            </label>
            <input
              type={field.type || "text"}
              name={field.name}
              value={form[field.name as keyof typeof form]}
              onChange={handleChange}
              placeholder={field.label}
              maxLength={field.name === "phone" ? 10 : undefined}
              readOnly={field.readOnly || false}
              className={`mt-1 w-full px-3 py-2 text-base border rounded-md focus:outline-none focus:ring-1 focus:ring-[#101f37] focus:border-[#101f37] ${
                field.readOnly
                  ? "bg-gray-100 cursor-not-allowed"
                  : "border-gray-300"
              }`}
              required
            />
            {errors[field.name] && (
              <p className="text-red-500 text-sm mt-1">{errors[field.name]}</p>
            )}
          </div>
        ))}

        <div className="flex gap-4 mt-2">
          <button
            type="submit"
            disabled={!changed || loadingSave}
            className={`px-6 py-2 bg-[#101f37] text-white rounded-xl hover:bg-[#0e1b32] transition-all duration-300 font-medium flex items-center gap-2 ${
              !changed ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
            }`}
          >
            Guardar
            {loadingSave && (
              <span className="animate-spin border-2 border-white border-t-transparent rounded-full w-5 h-5"></span>
            )}
          </button>

          <button
            type="button"
            onClick={handleReset}
            className="px-6 py-2 bg-transparent text-gray-700 border border-gray-400 rounded-xl hover:bg-gray-100 transition-all duration-300 font-medium cursor-pointer"
          >
            Limpiar
          </button>
        </div>
      </motion.form>

      {/* SECCIÓN DATOS FISCALES */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h2 className="text-xl font-semibold mb-6">Datos fiscales</h2>
        <p className="text-gray-600 mb-6">
          En caso de requerir factura es necesario subir constancia de situación fiscal
          (PDF o imagen legible).
        </p>

        {/* Mostrar archivo existente */}
        {existingTaxFile && (
          <div className="mb-6">
            <a
              href={existingTaxFile}
              target="_blank"
              rel="noopener noreferrer"
              className="text-#101f37 underline hover:text-blue-800"
            >
              Ver actual constancia fiscal
            </a>
          </div>
        )}

        <form onSubmit={handleTaxUpload} className="flex  gap-4 w-full ">
          <input
            type="file"
            accept=".pdf,image/*"
            onChange={(e) => setTaxFile(e.target.files?.[0] || null)}
            className="border border-gray-300 rounded-md px-3 py-2 text-base cursor-pointer focus:ring-1 focus:ring-[#101f37] focus:border-[#101f37]"
          />

          <button
            type="submit"
            disabled={loadingTax}
            className="px-6 py-2 bg-[#101f37] text-white rounded-xl hover:bg-[#0e1b32] transition-all duration-300 font-medium flex items-center gap-2 w-fit cursor-pointer"
          >
            {loadingTax ? (
              <>
                <span className="animate-spin border-2 border-white border-t-transparent rounded-full w-5 h-5"></span>
                Subiendo...
              </>
            ) : (
              "Subir constancia"
            )}
          </button>
        </form>
      </motion.div>

      <Toast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ ...toast, visible: false })}
      />
    </motion.div>
  );
}
