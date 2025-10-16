import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@mui/material/styles";
import theme from "@/config/theme";
import AuthProvider from "@/providers/AuthProvider";
import metadata from "./metadata";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export { metadata };
export default async function RootLayout({ children }) {
  return (
    <html lang="ko">
      <head></head>
      <body
        className={[
          `bg-[#1f1f1f] text-white vsc-initialized ${geistSans.variable} ${geistMono.variable}`,
        ]}
      >
        <AuthProvider>
          <ThemeProvider theme={theme}>{children}</ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
