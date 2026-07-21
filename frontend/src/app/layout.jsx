import "./globals.css";
import ClientLayout from "@/components/ClientLayout";

export const metadata = {
  title: "KUD Desa Sari Subur",
  description: "Sistem Informasi Koperasi Unit Desa Tegal Sari",
};

export default function RootLayout({ children }) {
  return (
    <html lang="id" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
