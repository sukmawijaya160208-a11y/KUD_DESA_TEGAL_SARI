import "./globals.css";
import ClientLayout from "@/components/ClientLayout";
import LenisProvider from "@/components/LenisProvider";

export const metadata = {
  title: "KUD Desa Sari Subur",
  description: "Sistem Informasi Koperasi Unit Desa Sari Subur",
  icons: {
    icon: "/logo/logo.jpg?v=2",
    shortcut: "/logo/logo.jpg?v=2",
    apple: "/logo/logo.jpg?v=2",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="id" className="h-full antialiased">
      <head>
        <link rel="icon" href="/logo/logo.jpg?v=2" type="image/jpeg" />
        <link rel="shortcut icon" href="/logo/logo.jpg?v=2" type="image/x-icon" />
        <link rel="apple-touch-icon" href="/logo/logo.jpg?v=2" />
      </head>
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <LenisProvider>
          <ClientLayout>{children}</ClientLayout>
        </LenisProvider>
      </body>
    </html>
  );
}
