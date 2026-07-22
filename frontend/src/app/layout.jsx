import "./globals.css";
import ClientLayout from "@/components/ClientLayout";
import LenisProvider from "@/components/LenisProvider";

export const metadata = {
  title: "KUD Desa Sari Subur",
  description: "Sistem Informasi Koperasi Unit Desa Sari Subur",
};

export default function RootLayout({ children }) {
  return (
    <html lang="id" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <LenisProvider>
          <ClientLayout>{children}</ClientLayout>
        </LenisProvider>
      </body>
    </html>
  );
}
