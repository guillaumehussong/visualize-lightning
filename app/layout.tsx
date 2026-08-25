import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://visualizelightning.org"),
  title: "Visualize Lightning",
  description:
    "The Lightning Network explained as a live 3D machine, running on real network data.",
  openGraph: {
    title: "Visualize Lightning",
    description:
      "The Lightning Network explained as a live 3D machine, running on real network data.",
    images: ["/og.png"],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Visualize Lightning",
    description:
      "The Lightning Network explained as a live 3D machine, running on real network data.",
    images: ["/og.png"],
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              name: "Visualize Lightning",
              url: "https://visualizelightning.org",
              description:
                "The Lightning Network explained as a live 3D machine, running on real network data.",
            }),
          }}
        />
        {children}
      </body>
    </html>
  );
}
