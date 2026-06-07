'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';

function MenuIcon({ open }) {
  return (
    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      {open ? (
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
      ) : (
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
      )}
    </svg>
  );
}

function MobileNavLink({ href, children, onClick, isActive }) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`block px-3 py-2 text-base font-medium transition-colors duration-200 relative ${
        isActive ? 'text-indigo-600' : 'text-gray-700 hover:text-indigo-600'
      }`}
    >
      <span className="relative inline-block">
        {children}
        {isActive && (
          <motion.span
            className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-indigo-500 to-blue-500 rounded-full"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.2 }}
          />
        )}
      </span>
    </Link>
  );
}

function MobileDropdown({ title, items, isOpen, onClick, currentPath }) {
  return (
    <div className="border-b border-gray-100 last:border-b-0">
      <button
        onClick={onClick}
        className={`w-full flex items-center justify-between px-3 py-2 text-base font-medium transition-colors duration-200 relative ${
          items.some(item => item.href === currentPath) ? 'text-indigo-600' : 'text-gray-700 hover:text-indigo-600'
        }`}
      >
        <span className="relative inline-block">
          {title}
          {items.some(item => item.href === currentPath) && (
            <motion.span
              className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-indigo-500 to-blue-500 rounded-full"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.2 }}
            />
          )}
        </span>
        <svg
          className={`ml-2 h-4 w-4 transform transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-indigo-600' : 'text-gray-400'
          }`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="pl-4"
          >
            {items.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`block px-3 py-2 text-sm transition-colors duration-150 relative ${
                  currentPath === item.href ? 'text-indigo-600' : 'text-gray-600 hover:text-indigo-600'
                }`}
              >
                <span className="relative inline-block">
                  {item.name}
                  {currentPath === item.href && (
                    <motion.span
                      className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-indigo-500 to-blue-500 rounded-full"
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: 1 }}
                      transition={{ duration: 0.2 }}
                    />
                  )}
                </span>
              </Link>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function Navbar({ user, onLogout }) {
  const pathname = usePathname();
  const [openMobileSection, setOpenMobileSection] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    console.log('Current pathname:', pathname);
    setIsMobileMenuOpen(false);
  }, [pathname]);

  return (
    <nav className="bg-white shadow-lg">
      <div className="max-w-7xl mx-auto">
        <div className="relative z-50">
          <div className="flex justify-between items-center px-4 sm:px-6 lg:px-8 h-16">
            <Link href="/home" className="flex-shrink-0 flex items-center">
              <Image
                src="/assets/veerive_logo.svg"
                alt="Veerive"
                width={200}
                height={80}
                className="h-10 w-auto"
                priority
              />
            </Link>

            <div className="hidden md:flex md:items-center md:space-x-6">
              <NavLink href="/pulse-today" isActive={pathname === '/pulse-today'}>
                Pulse Today
              </NavLink>
              <NavLink href="/influencer-comment" isActive={pathname === '/influencer-comment'}>
                Think Tank
              </NavLink>
              <NavLink href="/analyzer/trend-analyzer" isActive={pathname === '/analyzer/trend-analyzer'}>
                Trend Analyzer
              </NavLink>
              <NavLink href="/my-dashboard" isActive={pathname === '/my-dashboard'}>
                Dashboard
              </NavLink>
            </div>

            <div className="flex items-center space-x-4">
              <div className="hidden md:flex items-center space-x-3">
                {user ? (
                  <>
                    <Link 
                      href="/my-dashboard" 
                      className="flex items-center space-x-2 text-sm font-medium text-gray-700 hover:text-indigo-600"
                    >
                      <span>{user.name}</span>
                      <div className="relative">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-indigo-500 to-blue-500 flex items-center justify-center ring-2 ring-white">
                          <span className="text-sm font-medium text-white">
                            {user.name?.[0]?.toUpperCase()}
                          </span>
                        </div>
                      </div>
                    </Link>
                    <button
                      onClick={onLogout}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-full text-white bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200 ease-in-out transform hover:scale-105 shadow-md hover:shadow-lg"
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <Link
                    href="/login"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-full text-white bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200 ease-in-out transform hover:scale-105 shadow-md hover:shadow-lg"
                  >
                    Login
                  </Link>
                )}
              </div>

              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
              >
                <span className="sr-only">Open menu</span>
                <MenuIcon open={isMobileMenuOpen} />
              </button>
            </div>
          </div>
        </div>

        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-white border-t border-gray-100"
            >
              <div className="px-2 py-2 space-y-1">
                <MobileNavLink
                  href="/pulse-today"
                  isActive={pathname === '/pulse-today'}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Pulse Today
                </MobileNavLink>

                <MobileNavLink
                  href="/influencer-comment"
                  isActive={pathname === '/influencer-comment'}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Think Tank
                </MobileNavLink>

                <MobileNavLink
                  href="/analyzer/trend-analyzer"
                  isActive={pathname === '/analyzer/trend-analyzer'}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Trend Analyzer
                </MobileNavLink>

                <MobileNavLink
                  href="/my-dashboard"
                  isActive={pathname === '/my-dashboard'}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Dashboard
                </MobileNavLink>

                <div className="mt-4 pt-4 border-t border-gray-200">
                  {user ? (
                    <>
                      <div className="flex items-center px-3 py-2">
                        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-indigo-500 to-blue-500 flex items-center justify-center ring-2 ring-white mr-3">
                          <span className="text-xs font-medium text-white">
                            {user.name?.[0]?.toUpperCase()}
                          </span>
                        </div>
                        <span className="text-sm font-medium text-gray-700">{user.name}</span>
                      </div>
                      <button
                        onClick={() => {
                          onLogout();
                          setIsMobileMenuOpen(false);
                        }}
                        className="w-full mx-2 mt-2 px-3 py-2 text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-blue-600 rounded-lg shadow-md hover:from-indigo-700 hover:to-blue-700 transition-all duration-200 flex items-center justify-center space-x-2"
                      >
                        <span>Logout</span>
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                      </button>
                    </>
                  ) : (
                    <Link
                      href="/login"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="w-full mx-2 mt-2 px-3 py-2 text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-blue-600 rounded-lg shadow-md hover:from-indigo-700 hover:to-blue-700 transition-all duration-200 flex items-center justify-center space-x-2"
                    >
                      <span>Login</span>
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                      </svg>
                    </Link>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
}

function NavLink({ href, children, isActive }) {
  return (
    <Link
      href={href}
      className={`relative px-3 py-2 text-sm font-medium transition-colors duration-200 rounded-md ${
        isActive ? 'text-indigo-600' : 'text-gray-600 hover:text-indigo-600'
      }`}
    >
      {children}
      {isActive && (
        <motion.span
          className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-indigo-500 to-blue-500 rounded-full"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.2 }}
        />
      )}
    </Link>
  );
}

function NavDropdown({ title, items, isActive, currentPath, className }) {
  const [isOpen, setIsOpen] = useState(false);
  const activeItem = items.find((item) => item.href === currentPath);
  const displayTitle = isActive && activeItem ? `${activeItem.name}` : title;

  return (
    <div className="relative" onMouseEnter={() => setIsOpen(true)} onMouseLeave={() => setIsOpen(false)}>
      <button
        className={`relative px-3 py-2 text-sm font-medium transition-colors duration-200 rounded-md ${
          isActive ? 'text-indigo-600' : 'text-gray-600 hover:text-indigo-600'
        }`}
      >
        {displayTitle}
        {isActive && (
          <motion.span
            className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-indigo-500 to-blue-500 rounded-full"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.2 }}
          />
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className={`absolute left-1/2 transform -translate-x-1/2 mt-2 ${className}`}
          >
            <div className="relative">
              <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                <div className="w-4 h-4 bg-white rotate-45 border-t border-l border-gray-200" />
              </div>
              <div className="relative bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                <div className="py-1">
                  {items.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`block px-3 py-2 text-sm transition-colors duration-150 relative ${
                        currentPath === item.href ? 'text-indigo-600' : 'text-gray-700 hover:text-indigo-600'
                      }`}
                    >
                      <span className="relative inline-block">
                        {item.name}
                        {currentPath === item.href && (
                          <motion.span
                            className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-indigo-500 to-blue-500 rounded-full"
                            initial={{ scaleX: 0 }}
                            animate={{ scaleX: 1 }}
                            transition={{ duration: 0.2 }}
                          />
                        )}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}