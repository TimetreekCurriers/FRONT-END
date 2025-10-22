"use client";

import * as Select from "@radix-ui/react-select";
import {
  ChevronDownIcon,
  ChevronUpIcon,
  CheckIcon,
  Loader2,
} from "lucide-react";
import { useEffect, useState, useCallback, useRef } from "react";
import { FindAll as FindCartaPorte } from "@/services/cartaporte";
import { CartaporteCollectionInterface } from "@/type/cartaporte.interface";

export default function CartaPorteSelect({
  value,
  onChange,
  error,
}: {
  value?: string;
  onChange: (val: string) => void;
  error?: boolean;
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [data, setData] = useState<CartaporteCollectionInterface[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // 🔍 Buscar datos
  const fetchData = useCallback(
    async (newSearch: string, newPage = 1, append = false) => {
      try {
        setLoading(true);
        const result = await FindCartaPorte(newSearch, {
          page: newPage,
          perpage: 20,
        });
        const items = result?.records || [];
        setData((prev) => (append ? [...prev, ...items] : items));
        setHasMore(items.length === 20);
      } catch (err) {
        console.error("Error cargando carta porte:", err);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // 🕒 Debounce
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setPage(1);
      fetchData(searchTerm);
    }, 500);
  }, [searchTerm, fetchData]);

  // 📜 Scroll para paginación infinita
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollTop + clientHeight >= scrollHeight - 10 && !loading && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchData(searchTerm, nextPage, true);
    }
  };

  // 🏁 Carga inicial
  useEffect(() => {
    fetchData("");
  }, [fetchData]);

  return (
    <div>
      <label className="text-base font-medium text-gray-700 mb-1">
        Carta porte*
      </label>

      <Select.Root value={value} onValueChange={onChange}>
        <Select.Trigger
          className={`mt-1 w-full flex items-center justify-between px-3 py-2 text-base border rounded-md bg-white cursor-pointer
          ${error ? "border-red-500" : "border-gray-300"}
          focus:outline-none focus:ring-2 focus:ring-blue-500`}
        >
          {/* 🔹 Quitar asChild para evitar error */}
          <Select.Value placeholder="Selecciona una carta porte">
            <span className="truncate text-ellipsis overflow-hidden whitespace-nowrap flex-1 text-left">
              {data.find((item) => item.key === value)?.value ||
                "Selecciona una carta porte"}
            </span>
          </Select.Value>

          <Select.Icon className="flex-shrink-0 ml-2">
            <ChevronDownIcon className="w-4 h-4 text-gray-600" />
          </Select.Icon>
        </Select.Trigger>

        <Select.Portal>
          <Select.Content
            className="overflow-hidden bg-white rounded-md shadow-md z-50 animate-in fade-in slide-in-from-top-1 border border-gray-200"
            position="popper"
          >
            <Select.ScrollUpButton className="flex items-center justify-center text-gray-500">
              <ChevronUpIcon className="w-4 h-4" />
            </Select.ScrollUpButton>

            {/* 🔍 Input de búsqueda */}
            <div className="p-2 border-b border-gray-200">
              <input
                type="text"
                placeholder="Buscar..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.stopPropagation()}
                className="w-full px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-0 text-sm"
              />
            </div>

            {/* 📋 Lista de resultados */}
            <Select.Viewport
              onScroll={handleScroll}
              className="p-1 max-h-60 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent"
            >
              {data.length > 0 ? (
                data.map((item) => (
                  <Select.Item
                    key={item._id}
                    value={item.key}
                    className="relative flex items-center px-8 py-2 text-sm rounded-md cursor-pointer select-none 
                    hover:bg-gray-100 focus:bg-gray-100 focus:outline-none"
                  >
                    <Select.ItemText>
                      <span className="truncate text-ellipsis overflow-hidden whitespace-nowrap block max-w-[220px]">
                        {item.value}
                      </span>
                    </Select.ItemText>

                    <Select.ItemIndicator className="absolute left-2 inline-flex items-center">
                      <CheckIcon className="w-3 h-3 text-gray-500" />
                    </Select.ItemIndicator>
                  </Select.Item>
                ))
              ) : (
                !loading && (
                  <div className="px-4 py-2 text-gray-400 text-sm">
                    Sin resultados
                  </div>
                )
              )}

              {loading && (
                <div className="flex justify-center py-2">
                  <Loader2 className="animate-spin text-gray-500 w-4 h-4" />
                </div>
              )}
            </Select.Viewport>

            <Select.ScrollDownButton className="flex items-center justify-center text-gray-500">
              <ChevronDownIcon className="w-4 h-4" />
            </Select.ScrollDownButton>
          </Select.Content>
        </Select.Portal>
      </Select.Root>
    </div>
  );
}
