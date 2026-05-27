import type { Metadata } from "next";
import { Cinzel, Inter, JetBrains_Mono, Cinzel_Decorative, Cormorant_Garamond } from "next/font/google";
import "./globals.css";

const cinzel = Cinzel({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
  display: "swap",
});

const cinzelDecorative = Cinzel_Decorative({
  variable: "--font-display-decorative",
  subsets: ["latin"],
  weight: ["700"],
  display: "swap",
});

const cormorantGaramond = Cormorant_Garamond({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  style: ["normal", "italic"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-body",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Code Learning Arena — Learn to Code Like a Hero",
  description:
    "A gamified coding education platform that teaches programming through story-driven missions, AI mentorship, and RPG progression. Start your coding quest today.",
  keywords: [
    "learn to code",
    "coding for beginners",
    "gamified coding",
    "programming RPG",
    "Python tutorial",
  ],
  openGraph: {
    title: "Code Learning Arena",
    description: "Learn to code like a hero. Story-driven missions. AI mentor. RPG progression.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${cinzel.variable} ${cinzelDecorative.variable} ${cormorantGaramond.variable} ${inter.variable} ${jetbrainsMono.variable} h-full`}
    >
      <body suppressHydrationWarning className="min-h-full flex flex-col bg-void text-mist antialiased selection:bg-arcane-500/30 selection:text-white">
        {/* Inline blocking script to resolve Flash of Unthemed Content (FOUC) */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  const saved = localStorage.getItem("CLA_THEME");
                  if (saved) {
                    document.body.classList.add("theme-" + saved);
                  } else {
                    document.body.classList.add("theme-syntaxis");
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
        {children}
      </body>
    </html>
  );
}
