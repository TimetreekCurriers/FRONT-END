"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import Image from "next/image";
import {jwtDecode} from "jwt-decode";
import { register } from "@/services/user";
import { Toast } from "@/components/toast";

interface InvitePayload {
  email: string;
  [key: string]: any;
}

export default function RegisterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const invite = searchParams.get("invite");
  const [allowed, setAllowed] = useState<boolean | null>(null);
  const [toast, setToast] = useState<{
    visible: boolean;
    message: string;
    type?: "success" | "error";
  }>({
    visible: false,
    message: "",
    type: "success",
  });
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    second_last_name: "",
    email: "",
    phone: "",
    company: "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!invite) {
      setAllowed(false);
      return;
    }

    try {
      const decoded = jwtDecode<InvitePayload>(invite);
      if (decoded?.email) {
        setForm((prev) => ({ ...prev, email: decoded.email }));
        setAllowed(true);
      } else {
        setAllowed(false);
      }
    } catch (err) {
      console.error("Token inválido", err);
      setAllowed(false);
    }
  }, [invite]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    // Validaciones dinámicas en tiempo real
    if (
      ["first_name", "last_name", "second_last_name"].includes(name) &&
      /[^a-zA-ZáéíóúÁÉÍÓÚüÜñÑ\s]/.test(value)
    ) {
      return; // no permite números o símbolos
    }

    if (name === "phone" && /[^0-9]/.test(value)) {
      return; // solo números
    }

    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    // Validaciones básicas (empresa opcional)
    if (
      !form.first_name ||
      !form.last_name ||
      !form.second_last_name ||
      !form.email ||
      !form.phone ||
      !form.password ||
      !form.confirmPassword
    ) {
      setError("Todos los campos son obligatorios excepto empresa");
      return;
    }

    // Validación: solo letras en nombres y apellidos
    const nameRegex = /^[a-zA-ZáéíóúÁÉÍÓÚüÜñÑ\s]+$/;
    if (
      !nameRegex.test(form.first_name) ||
      !nameRegex.test(form.last_name) ||
      !nameRegex.test(form.second_last_name)
    ) {
      setError("El nombre y apellidos solo deben contener letras");
      return;
    }

    // Validación: teléfono obligatorio, solo números, 10 dígitos
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(form.phone)) {
      setError("El teléfono debe tener exactamente 10 dígitos");
      return;
    }

    // Validación: correo electrónico
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) {
      setError("El formato del correo electrónico no es válido");
      return;
    }

    // Validación: contraseñas coinciden
    if (form.password !== form.confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }

    setLoading(true);

    try {
      await register(invite, form);
      setSuccess(true);
      setToast({
        visible: true,
        message: "Registro exitoso ✔",
        type: "success",
      });
      setTimeout(() => router.push("/auth/iniciar-sesion"), 1000);
    } catch (err) {
      console.error(err);
      setToast({
        visible: true,
        message: "Falló el registro",
        type: "error",
      });
      setLoading(false);
    }
  };

  if (allowed === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <span className="animate-spin border-4 border-gray-400 border-t-transparent rounded-full w-8 h-8"></span>
      </div>
    );
  }

  if (allowed === false) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white shadow-lg rounded-xl p-8 text-center"
        >
          <h1 className="text-2xl font-semibold text-red-600 mb-2">
            Acceso denegado
          </h1>
          <p className="text-gray-600">
            El enlace de invitación no es válido o ha expirado.
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <motion.div
      className="min-h-screen flex flex-col md:flex-row"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      <div className="w-full md:w-1/4 bg-[#101f37] flex justify-center items-center py-8">
        <Image
          src="https://i.postimg.cc/y6F7LtXv/Captura-de-pantalla-2025-09-19-a-la-s-8-14-04-p-m.png"
          alt="Logo empresa"
          width={200}
          height={200}
        />
      </div>

      <div className="w-full md:w-3/4 flex justify-center items-center bg-gray-100 py-8">
        <motion.div
          className="w-full max-w-lg bg-white rounded-2xl shadow-2xl p-8"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-2xl font-semibold text-center mb-6">
            Registro de usuario
          </h1>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col">
              <label className="text-gray-700 font-medium">Nombre*</label>
              <input
                type="text"
                name="first_name"
                value={form.first_name}
                onChange={handleChange}
                required
                className="mt-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-[#101f37]"
              />
            </div>

            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex flex-col w-full">
                <label className="text-gray-700 font-medium">
                  Apellido paterno*
                </label>
                <input
                  type="text"
                  name="last_name"
                  value={form.last_name}
                  onChange={handleChange}
                  required
                  className="mt-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-[#101f37] w-full"
                />
              </div>
              <div className="flex flex-col w-full">
                <label className="text-gray-700 font-medium">
                  Apellido materno*
                </label>
                <input
                  type="text"
                  name="second_last_name"
                  value={form.second_last_name}
                  onChange={handleChange}
                  required
                  className="mt-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-[#101f37] w-full"
                />
              </div>
            </div>

            <div className="flex flex-col">
              <label className="text-gray-700 font-medium">
                Correo electrónico*
              </label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                readOnly={!!invite}
                required
                className={`mt-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-[#101f37] ${
                  invite ? "bg-gray-100 cursor-not-allowed" : ""
                }`}
              />
            </div>

            <div className="flex flex-col">
              <label className="text-gray-700 font-medium">Teléfono*</label>
              <input
                type="tel"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                maxLength={10}
                required
                className="mt-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-[#101f37]"
              />
            </div>

            <div className="flex flex-col">
              <label className="text-gray-700 font-medium">Empresa</label>
              <input
                type="text"
                name="company"
                value={form.company}
                onChange={handleChange}
                className="mt-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-[#101f37]"
              />
            </div>

            <div className="flex flex-col">
              <label className="text-gray-700 font-medium">Contraseña*</label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                required
                className="mt-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-[#101f37]"
              />
            </div>

            <div className="flex flex-col">
              <label className="text-gray-700 font-medium">
                Confirmar contraseña*
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={form.confirmPassword}
                onChange={handleChange}
                required
                className="mt-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-[#101f37]"
              />
            </div>

            {error && <div className="text-red-500 text-sm">{error}</div>}
            {success && (
              <div className="text-green-500 text-sm">
                Registro exitoso. Redirigiendo...
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="mt-4 px-6 py-2 bg-[#101f37] text-white rounded-xl hover:bg-[#0e1b32] transition-all duration-300 font-medium flex justify-center items-center gap-2 cursor-pointer"
            >
              {loading ? (
                <span className="animate-spin border-2 border-white border-t-transparent rounded-full w-5 h-5"></span>
              ) : (
                "Registrarme"
              )}
            </button>
          </form>
        </motion.div>
      </div>

      <Toast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ ...toast, visible: false })}
      />
    </motion.div>
  );
}
