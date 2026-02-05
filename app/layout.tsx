import type { Metadata } from 'next'
import './globals.css'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { Toaster } from 'sonner'

export const metadata: Metadata = {
  title: 'Portal de Decretos, Resoluciones y Ordenanzas',
  description: 'Sistema de gestión y publicación de normativas institucionales',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body className="font-sans bg-[var(--gray-50)] text-[var(--gray-900)]">
        <div className="flex flex-col min-h-screen">
          <Header />
          <main className="flex-1">
            <div className="page-container">{children}</div>
          </main>
          <Footer />
        </div>
        <Toaster 
          richColors
          position="top-right"
          duration={4000}
          expand
          closeButton
        />
      </body>
    </html>
  )
}
