import { Outfit } from "next/font/google";
import ClientAnimationsProvider from "@/app/components/ClientAnimationsProvider";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-outfit",
  display: "swap",
});

export const metadata = {
  title: "Think India Bihar — Nation Building Through Legal Awareness",
  description:
    "Think India Bihar is a platform for law students and young professionals committed to nation-building through policy research, legal awareness, and civic engagement across Bihar.",
  openGraph: {
    title: "Think India Bihar",
    description:
      "Nation building through legal awareness and civic engagement.",
    type: "website",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={outfit.variable}>
      <body>
        <ClientAnimationsProvider>
          {children}
        </ClientAnimationsProvider>
      </body>
    </html>
  );
}
