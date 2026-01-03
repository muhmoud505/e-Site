import "./globals.css";
import { StoreProvider } from "@/context/StoreContext";
import { Toaster } from "react-hot-toast";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
export const dynamic = 'force-dynamic';
export const metadata = {
  title: "متجر الأناقة",
  description: "تسوق أحدث صيحات الموضة. اكتشف مجموعتنا الحصرية من المنتجات عالية الجودة بأسعار منافسة.",
  manifest: "/manifest.json",
  openGraph: {
    title: "متجر الأناقة",
    description: "تسوق بأناقة وثقة",
    url: "https://your-website.com", // Replace with your actual domain
    siteName: "متجر الأناقة",
    images: [
      // Add a URL to a featured image for social sharing
      // { url: 'https://your-website.com/og-image.png', width: 800, height: 600 },
    ],
    locale: 'ar_SA',
    type: 'website',
  },
};

export const viewport = {
  themeColor: "#8B5CF6",
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="ar" dir="rtl">
      <body className="antialiased overflow-x-hidden">
        <StoreProvider>
          <Toaster />
          <Header />
          <main className="min-h-screen">
            {children}
          </main>
          <Footer />
        </StoreProvider>
      </body>
    </html>
  );
}