import { Outfit, Cormorant_Garamond } from "next/font/google";
import ClientAnimationsProvider from "@/app/components/ClientAnimationsProvider";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-outfit",
  display: "swap",
});

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-cormorant",
  display: "swap",
});

export const metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://thinkindiabihar.org"),
  title: {
    default: "Think India Bihar — Nation Building Through Legal Awareness",
    template: "%s | Think India Bihar",
  },
  description:
    "Think India Bihar is a platform for law students, researchers, and young professionals committed to nation-building through policy research, legal awareness, and civic engagement across Bihar.",
  alternates: {
    canonical: "./",
  },
  openGraph: {
    title: "Think India Bihar",
    description: "Nation building through policy research, legal awareness, and civic engagement.",
    url: "https://thinkindiabihar.org",
    siteName: "Think India Bihar",
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Think India Bihar",
    description: "Nation building through policy research, legal awareness, and civic engagement.",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${outfit.variable} ${cormorant.variable}`}>
      <body>
        <a href="#main-content" className="sr-only skip-link">
          Skip to content
        </a>
        <ClientAnimationsProvider>
          <div id="main-content">
            {children}
          </div>
        </ClientAnimationsProvider>
      </body>
    </html>
  );
}
