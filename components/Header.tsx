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
    <header
      className="border-b sticky top-0 z-50 shadow-sm"
      style={{ backgroundColor: '#4646FF', color: '#FFFFFF' }}
    >
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center space-x-4">
            <FileText className="h-8 w-8" style={{ color: '#FFFFFF' }} />
            <div className="hidden md:block">
              <h1 className="text-xl font-bold" style={{ color: '#FFFFFF' }}>
                Portal de Decretos, Resoluciones y Ordenanzas
              </h1>
              <p className="text-sm" style={{ color: '#E6E6FF' }}>Sistema de Gestión Normativa</p>
            </div>
            <div className="md:hidden">
              <h1 className="text-lg font-bold" style={{ color: '#FFFFFF' }}>PDRO</h1>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-4">
            <Link href="/">
              <Button
                variant={!isAdminRoute ? 'default' : 'ghost'}
                style={{ backgroundColor: '#4646FF', color: '#FFFFFF' }}
              >
                Portal Público
              </Button>
            </Link>
            <Link href="/admin">
              <Button
                variant={isAdminRoute ? 'default' : 'ghost'}
                style={{ backgroundColor: '#4646FF', color: '#FFFFFF' }}
              >
                <Settings className="h-4 w-4 mr-2" style={{ color: '#FFFFFF' }} />
                Administración
              </Button>
            </Link>
          </nav>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            style={{ color: '#FFFFFF' }}
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6" style={{ color: '#FFFFFF' }} />
            ) : (
              <Menu className="h-6 w-6" style={{ color: '#FFFFFF' }} />
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
