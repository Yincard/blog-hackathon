// app/layout.js
import { AuthProvider } from './context/AuthContext';
import { Inter } from "next/font/google";
import "./styles/globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Blogify",
  description: "Generated by create next app",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>{inter.classname}{children}</AuthProvider>
      </body>
    </html>
  );
}