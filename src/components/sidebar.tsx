"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";

// Íconos amigables
import { AiOutlineCalculator } from "react-icons/ai";
import { HiOutlineTruck, HiOutlineClock } from "react-icons/hi";
import { BsWallet2, BsFillPersonLinesFill, BsPeople } from "react-icons/bs"; // <-- agregado BsPeople
import type { Session } from "next-auth";

interface SidebarProps {
  session: Session | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ session, isOpen, onClose }: SidebarProps) {
  const sidebarRef = useRef<HTMLDivElement>(null);
  const admin = session?.user?.role === "admin";

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  return (
    <>
      {/* Overlay solo en mobile */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden"></div>
      )}

      <aside
        ref={sidebarRef}
        className={`
          fixed top-0 left-0 h-full w-60 bg-[#101F37] shadow-lg text-gray-100 flex flex-col
          overflow-auto transform transition-transform duration-300 ease-in-out
          translate-x-0
          max-[1024px]:-translate-x-full
          ${isOpen ? "max-[1024px]:translate-x-0 z-50" : ""}
        `}
      >
        {/* Logo */}
        <div className="p-6 flex justify-center items-center">
          <Image
            src="https://i.postimg.cc/mZjCtjBP/Captura-de-pantalla-2025-09-15-a-la-s-8-10-51-p-m.png"
            alt="Logo empresa"
            width={176}
            height={176}
            className="rounded-xl"
          />
        </div>

        {/* Menú */}
        <nav className="flex-1 px-4 py-6">
          <ul className="space-y-3">
            {/* Sección Envíos */}
            <li className="mt-6">
              <span className="block p-2 font-semibold text-xs uppercase text-gray-400">
                Envíos
              </span>
              <ul className="ml-4 space-y-2">
                <li>
                  <Link
                    href="/cuenta/cotizador"
                    className="flex items-center gap-3 p-2 rounded-xl text-gray-100 text-base hover:bg-gray-800 transition-colors duration-200"
                    onClick={onClose}
                  >
                    <AiOutlineCalculator className="w-6 h-6" />
                    Cotizador
                  </Link>
                </li>
                <li>
                  <Link
                    href="/cuenta/envios"
                    className="flex items-center gap-3 p-2 rounded-xl text-gray-100 text-base hover:bg-gray-800 transition-colors duration-200"
                    onClick={onClose}
                  >
                    <HiOutlineTruck className="w-6 h-6" />
                    Envíos
                  </Link>
                </li>
                <li>
                  <Link
                    href="/cuenta/recolecciones"
                    className="flex items-center gap-3 p-2 rounded-xl text-gray-100 text-base hover:bg-gray-800 transition-colors duration-200"
                    onClick={onClose}
                  >
                    <HiOutlineClock className="w-6 h-6" />
                    Recolecciones
                  </Link>
                </li>
              </ul>
            </li>

            {/* Sección Negocio */}
            <li className="mt-6">
              <span className="block p-2 font-semibold text-xs uppercase text-gray-400">
                Negocio
              </span>
              <ul className="ml-4 space-y-2">
                <li>
                  <Link
                    href="/cuenta/movimientos"
                    className="flex items-center gap-3 p-2 rounded-xl text-gray-100 text-base hover:bg-gray-800 transition-colors duration-200"
                    onClick={onClose}
                  >
                    <BsWallet2 className="w-5 h-5" />
                    Movimientos
                  </Link>
                </li>
                <li>
                  <Link
                    href="/cuenta/directorio"
                    className="flex items-center gap-3 p-2 rounded-xl text-gray-100 text-base hover:bg-gray-800 transition-colors duration-200"
                    onClick={onClose}
                  >
                    <BsFillPersonLinesFill className="w-5 h-5" />
                    Directorio
                  </Link>
                </li>
              </ul>
            </li>
            {/* Sección Usuarios */}
            {admin && (
              <li className="mt-6">
                <span className="block p-2 font-semibold text-xs uppercase text-gray-400">
                  Usuarios
                </span>
                <ul className="ml-4 space-y-2">
                  <li>
                    <Link
                      href="/cuenta/usuarios"
                      className="flex items-center gap-3 p-2 rounded-xl text-gray-100 text-base hover:bg-gray-800 transition-colors duration-200"
                      onClick={onClose}
                    >
                      <BsPeople className="w-5 h-5" />
                      Usuarios
                    </Link>
                  </li>
                </ul>
              </li>
            )}
          </ul>
        </nav>
      </aside>
    </>
  );
}
