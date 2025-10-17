"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getUser, updateUser } from "@/services/user";
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
  const [toast, setToast] = useState<{
    visible: boolean;
    message: string;
    type?: "success" | "error";
  }>({
    visible: false,
    message: "",
    type: "success",
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [changed, setChanged] = useState(false);
  const [loadingUser, setLoadingUser] = useState(true);
  const [loadingSave, setLoadingSave] = useState(false);

  const phoneRegex = /^\d{10}$/;

  // Fetch user
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
      } catch (err) {
        console.error("Error al obtener el usuario", err);
      } finally {
        setLoadingUser(false);
      }
    };
    fetchUser();
  }, [session?.user?.sub]);

  // Detectar cambios
  useEffect(() => {
    if (!user) return;
    const hasChanges =
      form.first_name !== (user.first_name || "") ||
      form.last_name !== (user.last_name || "") ||
      form.second_last_name !== (user.second_last_name || "") ||
      form.phone !== (user.phone || "");
    setChanged(hasChanges);
  }, [form, user]);

  // Manejo inputs con filtrado en tiempo real
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    if (["first_name", "last_name", "second_last_name"].includes(name)) {
      // Permitir solo letras y espacios
      const filteredValue = value.replace(/[^A-Za-z\s]/g, "");
      setForm((prev) => ({ ...prev, [name]: filteredValue }));
    } else if (name === "phone") {
      // Permitir solo números
      const filteredValue = value.replace(/\D/g, "");
      setForm((prev) => ({ ...prev, [name]: filteredValue }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }

    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  // Guardar cambios
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

  // Reset
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

  // Animaciones
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { staggerChildren: 0.05 } },
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 },
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
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <motion.h1
        className="text-2xl font-semibold mb-6"
        variants={itemVariants}
      >
        Mi Cuenta
      </motion.h1>

      <motion.form
        onSubmit={handleSave}
        className="flex flex-wrap gap-6 items-end w-full"
        variants={itemVariants}
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

      <Toast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ ...toast, visible: false })}
      />
    </motion.div>
  );
}
