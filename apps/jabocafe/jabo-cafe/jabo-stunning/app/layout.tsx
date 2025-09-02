import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Jabô Café - Tradição e Excelência desde 1938",
  description: "Café especial cultivado com paixão na Fazenda Jaboticabeiras, Guaxupé-MG. Três gerações de dedicação à qualidade e sustentabilidade.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}