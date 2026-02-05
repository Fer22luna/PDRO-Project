'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FileText, Menu, X } from 'lucide-react';
import { useState } from 'react';

export default function Header() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isAdminRoute = pathname?.startsWith('/admin');

  return (
    <header className="site-header sticky top-0 z-50">
      <div className="header-content">
        <div className="flex items-center space-x-4">
          <FileText className="h-8 w-8 header-icon" />
          <div className="hidden md:block">
            <h1 className="text-xl font-bold">Portal de Decretos, Resoluciones y Ordenanzas</h1>
            <p className="text-sm text-white/90">Sistema de Gestión Normativa</p>
          </div>
          <div className="md:hidden">
            <h1 className="text-lg font-bold">PDRO</h1>
          </div>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-4 header-buttons">
          <Link href="/" className="btn-header">📄 Portal Público</Link>
          <Link href="/admin" className="btn-header">⚙️ Administración</Link>
        </nav>

        {/* Mobile Menu Button */}
        <button className="md:hidden text-white" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <nav className="md:hidden py-4 space-y-2 w-full">
            <Link href="/" className="btn-header w-full" onClick={() => setMobileMenuOpen(false)}>Portal Público</Link>
            <Link href="/admin" className="btn-header w-full" onClick={() => setMobileMenuOpen(false)}>⚙️ Administración</Link>
          </nav>
        )}
      </div>
    </header>
  );
}
