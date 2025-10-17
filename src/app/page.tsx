import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { authOptions } from "@/lib/authOptions";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Dashboard App",
  description: "Dashboard profesional con sidebar y header moderno",
};

export default async function RootLayout({}: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  if (session) {
    redirect("/cuenta/cotizador");
  } else {
    redirect("/auth/iniciar-sesion");
  }
  return (
    <html lang="es">
      <body
        className={`${geistSans.variable} ${geistMono.variable} font-sans bg-gray-50 text-gray-900`}
      >
        <></>
      </body>
    </html>
  );
}
