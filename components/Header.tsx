'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FileText, Settings, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

export default function Header() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isAdminRoute = pathname?.startsWith('/admin');

  return (
    <header className="border-b bg-white sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center space-x-4">
            <FileText className="h-8 w-8 text-primary" />
            <div className="hidden md:block">
              <h1 className="text-xl font-bold text-gray-900">
                Portal de Decretos, Resoluciones y Ordenanzas
              </h1>
              <p className="text-sm text-gray-500">Sistema de Gestión Normativa</p>
            </div>
            <div className="md:hidden">
              <h1 className="text-lg font-bold text-gray-900">PDRO</h1>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-4">
            <Link href="/">
              <Button variant={!isAdminRoute ? 'default' : 'ghost'}>
                Portal Público
              </Button>
            </Link>
            <Link href="/admin">
              <Button variant={isAdminRoute ? 'default' : 'ghost'}>
                <Settings className="h-4 w-4 mr-2" />
                Administración
              </Button>
            </Link>
          </nav>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <nav className="md:hidden py-4 space-y-2">
            <Link href="/" onClick={() => setMobileMenuOpen(false)}>
              <Button variant={!isAdminRoute ? 'default' : 'ghost'} className="w-full">
                Portal Público
              </Button>
            </Link>
            <Link href="/admin" onClick={() => setMobileMenuOpen(false)}>
              <Button variant={isAdminRoute ? 'default' : 'ghost'} className="w-full">
                <Settings className="h-4 w-4 mr-2" />
                Administración
              </Button>
            </Link>
          </nav>
        )}
      </div>
    </header>
  );
}
