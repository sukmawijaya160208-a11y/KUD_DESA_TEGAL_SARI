import "./globals.css";
import ClientLayout from "@/components/ClientLayout";

export const metadata = {
  title: "KUD Desa Sari Subur",
  description: "Sistem Informasi Koperasi Unit Desa Sari Subur",
  icons: {
    icon: "/icon",
    shortcut: "/icon",
    apple: "/icon",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="id" className="h-full antialiased">
      <head>
        <link rel="icon" href="/icon" type="image/x-icon" />
        <link rel="shortcut icon" href="/icon" type="image/x-icon" />
        <link rel="apple-touch-icon" href="/icon" />
      </head>
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
