import type { Metadata } from "next";
import { Inter, Poppins } from "next/font/google";
import AntdRegistry from "@/config/AntdRegistry";
import { ConfigProvider, App } from "antd";
import { miaTheme } from "@/config/theme";
import { AuthProvider } from "@/app/context/AuthContext";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const poppins = Poppins({
  weight: ["500", "700"],
  subsets: ["latin"],
  variable: "--font-poppins",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Studio MIA - Educação Personalizada",
  description: "Plataforma de gestão educacional para professores",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className={`${inter.variable} ${poppins.variable}`}>
      <body suppressHydrationWarning={true}>
        <AntdRegistry>
          <ConfigProvider theme={miaTheme} wave={{ disabled: true }}>
            <App>
              <AuthProvider>
                {children}
              </AuthProvider>
            </App>
          </ConfigProvider>
        </AntdRegistry>
      </body>
    </html>
  );
}