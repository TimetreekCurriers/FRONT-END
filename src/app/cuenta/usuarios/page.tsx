"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { DotsVerticalIcon } from "@radix-ui/react-icons";
import { findAllUsers } from "@/services/user";
import { inviteUser } from "@/services/user";
import { Create } from "@/services/transactions";
import { UserCollectionInterface } from "@/type/user.interface";
import { Toast } from "@/components/toast";
import { useAuth } from "@/components/authProvider";
import { createPortal } from "react-dom";
import Link from "next/link";

const PAGE_SIZE = 10;

export default function UsersPage() {
  const { session } = useAuth();
  const userid = session?.user?.sub;
  const isAdmin = session?.user?.role === "admin";

  if (!isAdmin)
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

  const [users, setUsers] = useState<UserCollectionInterface[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteName, setInviteName] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [sendingInvite, setSendingInvite] = useState(false);

  const [toast, setToast] = useState<{
    visible: boolean;
    message: string;
    type?: "success" | "error";
  }>({
    visible: false,
    message: "",
    type: "success",
  });

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const pagination = { page, perpage: PAGE_SIZE };
      const res = await findAllUsers(userid, pagination, search);
      setUsers(res.records);
      setTotalPages(res.totalpages);
    } catch (err) {
      console.error("Error cargando usuarios:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [page, search]);

  // Cerrar modal con Escape
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setShowInviteModal(false);
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  const handleInvite = async () => {
    if (!inviteName.trim() || !inviteEmail.trim()) {
      setToast({
        visible: true,
        message: "Por favor completa todos los campos.",
        type: "error",
      });
      return;
    }

    setSendingInvite(true);
    try {
      await inviteUser(  inviteName,  inviteEmail );
      setToast({
        visible: true,
        message: "Invitación enviada correctamente ✔",
        type: "success",
      });
      setInviteName("");
      setInviteEmail("");
      setShowInviteModal(false);
    } catch (error) {
      console.error(error);
      setToast({
        visible: true,
        message: "Error al enviar invitación",
        type: "error",
      });
    } finally {
      setSendingInvite(false);
    }
  };

  return (
    <motion.div
      className="p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <motion.h1
        className="text-2xl font-semibold mb-4"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        Usuarios
      </motion.h1>

      {/* Subheader */}
      <motion.div
        className="flex flex-wrap items-center justify-between gap-4 mb-6"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <div className="flex gap-2 flex-1 min-w-[300px]">
          <input
            type="text"
            placeholder="Buscar por nombre o correo..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#101f37] focus:border-[#101f37]"
          />
          <button
            onClick={() => setShowInviteModal(true)}
            className="px-4 py-2 bg-[#101f37] text-white rounded-xl hover:bg-[#0e1b32] transition-colors cursor-pointer inline-block text-center"
          >
            Nuevo usuario
          </button>
        </div>
      </motion.div>

      {/* Tabla desktop */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full table-fixed text-left border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="px-4 py-2 w-[20%]">Nombre</th>
              <th className="px-4 py-2 w-[25%]">Correo</th>
              <th className="px-4 py-2 w-[15%]">Balance</th>
              <th className="px-4 py-2 w-[15%]">Fecha Registro</th>
              <th className="px-4 py-2 w-[15%]">Constancia</th>
              <th className="px-4 py-2 w-[10%] text-right"></th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="text-center py-6 text-gray-500">
                  Cargando...
                </td>
              </tr>
            ) : (
              users.map((user, i) => (
                <motion.tr
                  key={user._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: i * 0.05 }}
                  className="border-b border-gray-200 hover:bg-gray-50 transition-colors"
                >
                  <td className="px-4 py-3 font-medium">
                    {user?.first_name + " " + user?.last_name}
                  </td>
                  <td className="px-4 py-3">{user.email}</td>
                  <td className="px-4 py-3 font-semibold text-gray-800">
                    ${user.balance?.toFixed(2) || "0.00"}
                  </td>
                  <td className="px-4 py-3">
                    {new Date(user.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
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
                  </td>
                  <td className="px-4 py-3 text-left">
                    <UserActionsModal
                      fetchUsers={fetchUsers}
                      adminUserid={userid}
                      setToast={setToast}
                      user={user}
                    />
                  </td>
                </motion.tr>
              ))
            )}
          </tbody>
        </table>
              {/* Paginación */}
      <div className="flex justify-end gap-2 mt-4 flex-wrap">
        <button
          onClick={() => setPage((p) => Math.max(p - 1, 1))}
          disabled={page === 1}
          className="px-3 py-1 rounded-xl border border-gray-300 hover:bg-gray-100 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Anterior
        </button>
        <span className="px-3 py-1">
          {page} / {totalPages}
        </span>
        <button
          onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
          disabled={page === totalPages}
          className="px-3 py-1 rounded-xl border border-gray-300 hover:bg-gray-100 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Siguiente
        </button>
      </div>
      </div>

      {/* Tabla mobile */}
<div className="md:hidden flex flex-col gap-4">
  {loading ? (
    <div className="text-center py-6 text-gray-500">Cargando...</div>
  ) : users.length === 0 ? (
    <div className="text-center py-6 text-gray-500">No hay usuarios</div>
  ) : (
    users.map((user, i) => (
      <motion.div
        key={user._id}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: i * 0.05 }}
        className="bg-white border border-gray-200 rounded-xl shadow-sm p-4 flex flex-col gap-2"
      >
        <div className="flex justify-between items-center">
          <span className="font-medium">{user.first_name} {user.last_name}</span>
          <UserActionsModal
            fetchUsers={fetchUsers}
            adminUserid={userid!}
            setToast={setToast}
            user={user}
          />
        </div>
        <div className="text-gray-600 text-sm">Correo: {user.email}</div>
        <div className="text-gray-800 font-semibold">Balance: ${user.balance?.toFixed(2) || "0.00"}</div>
        <div className="text-gray-500 text-sm">Registro: {new Date(user.created_at).toLocaleDateString()}</div>
        <div>
          Constancia:{" "}
          {user.tax_status_certificate ? (
            <a
              href={user.tax_status_certificate}
              target="_blank"
              rel="noopener noreferrer"
              className="px-2 py-1 bg-[#101f37] text-white rounded-lg text-xs hover:bg-[#0e1b32]"
            >
              Descargar
            </a>
          ) : (
            <span className="text-gray-400 text-xs">No disponible</span>
          )}
        </div>
      </motion.div>
    ))
  )}
  {/* Paginación mobile */}
  <div className="flex justify-center gap-2 mt-4 flex-wrap">
    <button
      onClick={() => setPage((p) => Math.max(p - 1, 1))}
      disabled={page === 1}
      className="px-3 py-1 rounded-xl border border-gray-300 hover:bg-gray-100 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
    >
      Anterior
    </button>
    <span className="px-3 py-1">
      {page} / {totalPages}
    </span>
    <button
      onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
      disabled={page === totalPages}
      className="px-3 py-1 rounded-xl border border-gray-300 hover:bg-gray-100 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
    >
      Siguiente
    </button>
  </div>
</div>


      {/* Modal de invitación */}
      <AnimatePresence>
        {showInviteModal && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm bg-black/30"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowInviteModal(false)}
          >
            <motion.div
              className="bg-white p-6 rounded-xl shadow-2xl max-w-md w-full flex flex-col gap-6 relative"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setShowInviteModal(false)}
                className="absolute top-4 right-4 text-black hover:text-gray-700 font-bold text-lg"
              >
                ×
              </button>

              <h3 className="text-xl font-semibold text-center text-[#101f37]">
                Invitar usuario
              </h3>

              <div>
                <label className="block text-sm font-medium mb-1">Nombre</label>
                <input
                  value={inviteName}
                  onChange={(e) => setInviteName(e.target.value)}
                  placeholder="Nombre completo"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#101f37]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Correo</label>
                <input
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="correo@ejemplo.com"
                  type="email"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#101f37]"
                />
              </div>

              <div className="flex justify-end gap-3 mt-4">
                <button
                  onClick={() => setShowInviteModal(false)}
                  className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-100 cursor-pointer"
                  disabled={sendingInvite}
                >
                  Cancelar
                </button>
                <button
                  onClick={handleInvite}
                  disabled={sendingInvite}
                  className={`px-6 py-2 rounded-xl text-white flex items-center justify-center transition-all cursor-pointer ${
                    sendingInvite
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-[#101f37] hover:bg-[#0e1b32]"
                  }`}
                >
                  {sendingInvite ? "Enviando..." : "Aceptar"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <Toast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ ...toast, visible: false })}
      />
    </motion.div>
  );
}

/* ===============================
   Modal de acciones de usuario con Portal
   =============================== */
function UserActionsModal({
  fetchUsers,
  adminUserid,
  setToast,
  user,
}: {
  fetchUsers: () => Promise<void>;
  adminUserid: string;
  setToast: (value: {
    visible: boolean;
    message: string;
    type?: "success" | "error";
  }) => void;
  user: UserCollectionInterface;
}) {
  const [showModal, setShowModal] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [action, setAction] = useState<"agregar" | "quitar">("agregar");
  const [amount, setAmount] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [popupPos, setPopupPos] = useState<{ top: number; left: number }>({
    top: 0,
    left: 0,
  });
  const popupRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(e.target as Node)) {
        setShowPopup(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setShowModal(false);
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  const handleConfirm = async () => {
    if (!amount || Number(amount) <= 0) {
      setToast({ visible: true, message: "Monto inválido", type: "error" });
      return;
    }

    setLoading(true);
    try {
      await Create(user?._id, {
        type: action === "agregar" ? "add" : "remove",
        amount,
        userid: user._id!,
        reason: action === "agregar" ? "Recarga a wallet" : "Retiro de wallet",
        byAdmin: true,
        user_admin_id: adminUserid,
      });
      await fetchUsers();
      setToast({
        visible: true,
        message: "Transacción realizada ✔",
        type: "success",
      });
      setShowModal(false);
    } catch (error) {
      setToast({
        visible: true,
        message: "Error al procesar transacción",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const displayChange = action === "agregar" ? amount : amount ? -amount : 0;

  return (
    <>
      <div className="relative inline-block">
        <button
          onClick={(e) => {
            const rect = (
              e.currentTarget as HTMLElement
            ).getBoundingClientRect();
            setPopupPos({
              top: rect.bottom + window.scrollY,
              left: rect.left + window.scrollX - 120,
            });
            setShowPopup(!showPopup);
          }}
          className="p-2 rounded-full hover:bg-gray-100 text-gray-600 cursor-pointer"
        >
          <DotsVerticalIcon className="w-5 h-5" />
        </button>

        {/* Popup con portal */}
        {showPopup &&
          createPortal(
            <AnimatePresence>
              <motion.div
                ref={popupRef}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                style={{
                  position: "absolute",
                  top: popupPos.top,
                  left: popupPos.left,
                  width: 160,
                }}
                className="bg-white border border-gray-200 rounded-lg shadow-lg z-50 flex flex-col"
              >
                <button
                  onClick={() => {
                    setShowModal(true);
                    setShowPopup(false);
                  }}
                  className="px-4 py-2 text-left hover:bg-gray-100 w-full cursor-pointer"
                >
                  Abonar a wallet
                </button>
                <Link
                  href={`/cuenta/usuarios/envios/${user._id}`}
                  className="px-4 py-2 text-left hover:bg-gray-100 w-full cursor-pointer block"
                  onClick={() => setShowPopup(false)}
                >
                  Ver envíos
                </Link>
              </motion.div>
            </AnimatePresence>,
            document.body
          )}
      </div>

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm bg-black/30"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowModal(false)}
          >
            <motion.div
              className="bg-white p-6 rounded-xl shadow-2xl max-w-md w-full flex flex-col gap-6 relative"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setShowModal(false)}
                className="absolute top-4 right-4 text-black hover:text-gray-700 font-bold text-lg"
              >
                ×
              </button>

              <h3 className="text-xl font-semibold text-center text-[#101f37]">
                Modificar Balance
              </h3>

              <div className="text-center mb-2">
                <span className="text-gray-700">
                  Balance actual:{" "}
                  <span className="font-bold text-blue-700">
                    ${user.balance?.toFixed(2) || "0.00"}
                  </span>
                </span>
              </div>

              <div className="flex justify-center gap-3">
                <button
                  onClick={() => setAction("agregar")}
                  className={`cursor-pointer px-4 py-2 rounded-lg border ${
                    action === "agregar"
                      ? "bg-[#101f37] text-white"
                      : "border-gray-300 text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  Agregar
                </button>
                <button
                  onClick={() => setAction("quitar")}
                  className={`cursor-pointer px-4 py-2 rounded-lg border ${
                    action === "quitar"
                      ? "bg-[#101f37] text-white"
                      : "border-gray-300 text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  Quitar
                </button>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Monto</label>
                <input
                  value={Number(amount)}
                  onChange={(e) => {
                    if (!isNaN(Number(e.target.value)))
                      setAmount(Number(e.target.value));
                  }}
                  placeholder="0.00"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#101f37]"
                />
              </div>

              <div
                className={`text-right font-semibold ${
                  displayChange > 0
                    ? "text-green-600"
                    : displayChange < 0
                    ? "text-red-600"
                    : "text-gray-500"
                }`}
              >
                {displayChange > 0 ? "+" : displayChange < 0 ? "-" : ""}$
                {Math.abs(displayChange).toFixed(2)}
              </div>

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-100 cursor-pointer"
                  disabled={loading}
                >
                  Cancelar
                </button>
                <button
                  onClick={handleConfirm}
                  disabled={loading}
                  className={`px-6 py-2 rounded-xl text-white cursor-pointer ${
                    loading
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-[#101f37] hover:bg-[#0e1b32]"
                  }`}
                >
                  {loading ? "Procesando..." : "Aceptar"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
