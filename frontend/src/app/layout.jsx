import { Poppins, Open_Sans } from "next/font/google";
import "./globals.css";
import ClientLayout from "@/components/ClientLayout";

const poppins = Poppins({ variable: "--font-poppins", subsets: ["latin"], weight: ["400", "500", "600", "700"] });
const openSans = Open_Sans({ variable: "--font-open-sans", subsets: ["latin"], weight: ["300", "400", "500", "600", "700"] });

export const metadata = {
  title: "KUD Desa Tegal Sari",
  description: "Sistem Informasi Koperasi Unit Desa Tegal Sari",
};

export default function RootLayout({ children }) {
  return (
    <html lang="id" className={`${poppins.variable} ${openSans.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
