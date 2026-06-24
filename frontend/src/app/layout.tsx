import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FoodTrace - Immutable Blockchain Food Safety",
  description: "Demonstrating farm-to-table food safety tracking using Polygon Blockchain technology.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 flex flex-col justify-between">
        <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-9 w-9 bg-gradient-to-tr from-emerald-600 to-green-400 rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-sm">
                F
              </div>
              <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-emerald-700 to-green-600 bg-clip-text text-transparent">
                FoodTrace
              </span>
            </div>
            <nav className="flex items-center gap-6">
              <a href="/" className="text-sm font-medium text-slate-600 hover:text-emerald-600 transition-colors">
                Home
              </a>
              <a href="/login" className="text-sm font-medium text-slate-600 hover:text-emerald-600 transition-colors">
                Dashboard
              </a>
            </nav>
          </div>
        </header>
        <main className="flex-grow">
          {children}
        </main>
        <footer className="bg-white border-t border-slate-200 py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm text-slate-500">
            &copy; {new Date().getFullYear()} FoodTrace MVP. Built with Next.js, NestJS, and Polygon.
          </div>
        </footer>
      </body>
    </html>
  );
}
