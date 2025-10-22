"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { UserCollectionInterface } from "@/type/user.interface";

interface ModalDetalleUsuarioProps {
  user: UserCollectionInterface;
  visible: boolean;
  onClose: () => void;
}

export default function ModalDetalleUsuario({
  user,
  visible,
  onClose,
}: ModalDetalleUsuarioProps) {
  // Formatear fecha en español
  const formatDate = (dateStr?: Date) => {
    if (!dateStr) return "-";
    const date = new Date(dateStr);
    return date.toLocaleDateString("es-ES", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  // Cerrar modal con Escape
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm bg-black/30"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="bg-white p-6 rounded-xl shadow-2xl max-w-md w-full flex flex-col gap-4 relative"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-black hover:text-gray-700 font-bold text-lg cursor-pointer"
            >
              ×
            </button>

            <h3 className="text-xl font-semibold text-center text-[#101f37]">
              Detalle del usuario
            </h3>

            <div className="flex flex-col gap-2">
              <div><span className="font-medium">Nombre:</span> {user.first_name}</div>
              <div><span className="font-medium">Apellido:</span> {user.last_name}</div>
              <div><span className="font-medium">Segundo Apellido:</span> {user.second_last_name || "-"}</div>
              <div><span className="font-medium">Teléfono:</span> {user.phone || "-"}</div>
              <div><span className="font-medium">Correo:</span> {user.email}</div>
              <div><span className="font-medium">Empresa:</span> {user.company || "N/A"}</div>
              <div>
                <span className="font-medium">Balance:</span> ${user.balance?.toFixed(2) || "0.00"}
              </div>
              <div>
                <span className="font-medium">Fecha de registro:</span> {formatDate(user?.created_at)}
              </div>
              <div>
                <span className="font-medium">Constancia:</span>{" "}
                {user.tax_status_certificate ? (
                  <a
                    href={user.tax_status_certificate}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1 bg-[#101f37] text-white rounded-lg hover:bg-[#0e1b32]"
                  >
                    Descargar
                  </a>
                ) : (
                  <span className="text-gray-400">No disponible</span>
                )}
              </div>
            </div>

            <div className="flex justify-end mt-4">
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-100 cursor-pointer"
              >
                Cerrar
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
