'use client';

import { usePathname, useRouter } from 'next/navigation';
import { 
  LayoutDashboard, 
  Calendar, 
  Users, 
  BookOpen, 
  MessageSquare, 
  Settings, 
  LogOut,
  GraduationCap,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useState } from 'react';

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/tutor/dashboard' },
  { icon: Calendar, label: 'Interview', href: '/tutor/interview/status' },
  { icon: Users, label: 'My Students', href: '/tutor/students' },
  { icon: BookOpen, label: 'Sessions', href: '/tutor/sessions' },
  { icon: MessageSquare, label: 'Messages', href: '/tutor/messages' },
  { icon: Settings, label: 'Settings', href: '/tutor/settings' },
];

export default function TutorSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    sessionStorage.clear();
    router.push('/auth/login');
  };

  const handleMenuClick = (href) => {
    router.push(href);
    setMobileMenuOpen(false);
  };

  return (
    <>
      {/* Mobile Hamburger Header - Only visible on mobile (below 1024px) */}
      <div className="block lg:hidden fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-50 h-16">
        <div className="flex items-center justify-between h-full px-4">
          <div className="flex items-center gap-2">
            <div className="bg-blue-500 p-2 rounded-lg">
              <GraduationCap className="text-white" size={20} />
            </div>
            <div>
              <h1 className="font-bold text-gray-800 text-sm">PVC Tutor</h1>
              <p className="text-xs text-gray-500">Teaching Portal</p>
            </div>
          </div>
          
          {/* Hamburger Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="w-10 h-10 flex flex-col items-center justify-center gap-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            aria-label="Toggle menu"
          >
            <span className={`block w-6 h-0.5 bg-gray-800 transition-transform ${mobileMenuOpen ? 'rotate-45 translate-y-2' : ''}`}></span>
            <span className={`block w-6 h-0.5 bg-gray-800 transition-opacity ${mobileMenuOpen ? 'opacity-0' : ''}`}></span>
            <span className={`block w-6 h-0.5 bg-gray-800 transition-transform ${mobileMenuOpen ? '-rotate-45 -translate-y-2' : ''}`}></span>
          </button>
        </div>
      </div>

      {/* Mobile Overlay */}
      {mobileMenuOpen && (
        <div 
          className="block lg:hidden fixed inset-0 bg-black bg-opacity-30 z-30"
          style={{ top: '64px' }}
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`
          bg-white border-r-2 border-gray-100 flex flex-col
          transition-all duration-300 h-screen
          
          /* Mobile: Fixed positioning with slide animation */
          ${mobileMenuOpen ? 'fixed' : 'hidden'} lg:flex
          lg:relative fixed
          top-16 lg:top-0 bottom-0 left-0 z-50
          ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0
          
          /* Mobile opacity */
          ${mobileMenuOpen ? 'bg-white bg-opacity-95' : 'bg-white'}
          
          /* Width */
          ${collapsed ? 'lg:w-20 w-64' : 'w-64'}
        `}
      >
        {/* Logo Section - Only visible on desktop/tablet */}
        <div className="hidden lg:flex p-6 border-b-2 border-gray-100 items-center justify-between flex-shrink-0">
          {!collapsed && (
            <div className="flex items-center gap-2">
              <div className="bg-blue-500 p-2 rounded-lg">
                <GraduationCap className="text-white" size={24} />
              </div>
              <div>
                <h1 className="font-bold text-gray-800">PVC Tutor</h1>
                <p className="text-xs text-gray-500">Teaching Portal</p>
              </div>
            </div>
          )}
          {collapsed && (
            <div className="bg-blue-500 p-2 rounded-lg mx-auto">
              <GraduationCap className="text-white" size={24} />
            </div>
          )}
        </div>

        {/* Toggle Button - Hidden on mobile */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="hidden lg:block absolute -right-3 top-20 bg-white border-2 border-gray-100 rounded-full p-1 hover:bg-gray-50 transition-colors shadow-md z-10"
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>

        {/* Menu Items - Scrollable */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            
            return (
              <button
                key={item.href}
                onClick={() => handleMenuClick(item.href)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                  isActive
                    ? 'bg-blue-500 text-white shadow-lg'
                    : 'text-gray-600 hover:bg-gray-50'
                } ${collapsed ? 'justify-center' : ''}`}
                title={collapsed ? item.label : ''}
              >
                <Icon size={20} />
                {!collapsed && <span className="font-medium">{item.label}</span>}
              </button>
            );
          })}
        </nav>

        {/* User Info & Logout - Fixed at bottom */}
        <div className="p-4 border-t-2 border-gray-100 space-y-2 flex-shrink-0">
          {!collapsed && (
            <div className="px-4 py-2 bg-gray-50 rounded-lg mb-2">
              <p className="text-xs text-gray-500">Logged in as</p>
              <p className="text-sm font-semibold text-gray-800 truncate">
                {typeof window !== 'undefined' && sessionStorage.getItem('userEmail')}
              </p>
            </div>
          )}
          <button
            onClick={handleLogout}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 transition-colors ${collapsed ? 'justify-center' : ''}`}
            title={collapsed ? 'Logout' : ''}
          >
            <LogOut size={20} />
            {!collapsed && <span className="font-medium">Logout</span>}
          </button>
        </div>
      </aside>
    </>
  );
}