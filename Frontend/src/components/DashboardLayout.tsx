import type { ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/stores/useAuthStore';
import { Button } from '@/components/ui/button';
import { GraduationCap, LogOut, Calendar, BarChart3, Users, Settings, FileText } from 'lucide-react';
import { ROLE_NAMES } from '@/lib/db';
import type { Role } from '@/lib/db';

interface DashboardLayoutProps {
  children: ReactNode;
}

interface NavItem {
  label: string;
  path: string;
  icon: React.ReactNode;
  roles: Role[];
}

const navItems: NavItem[] = [
  { label: 'Tổng quan', path: '/dashboard', icon: <BarChart3 />, roles: ['student', 'organizer', 'admin'] },
  { label: 'Hoạt động', path: '/activities', icon: <Calendar />, roles: ['student', 'organizer', 'admin'] },
  { label: 'Lịch sử tham gia', path: '/my-activities', icon: <FileText />, roles: ['student'] },
  { label: 'Quản lý hoạt động', path: '/manage-activities', icon: <Calendar />, roles: ['organizer'] },
  { label: 'Điểm danh', path: '/attendance', icon: <Users />, roles: ['organizer'] },
  { label: 'Quản lý người dùng', path: '/users', icon: <Users />, roles: ['admin'] },
  { label: 'Duyệt hoạt động', path: '/approve-activities', icon: <Settings />, roles: ['admin'] },
];

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user, signOut } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/LoginPage');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const userRole = user?.role as Role | undefined;
  const filteredNavItems = navItems.filter(item => (userRole ? item.roles.includes(userRole) : false));

  return (
    <div className="min-h-screen bg-background">
      
      {/* TOP BAR */}
      <header className="sticky top-0 z-50 border-b bg-card/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-bold text-lg">Quản lý Hoạt động SV</h1>
              <p className="text-xs text-muted-foreground">
                {userRole ? ROLE_NAMES[userRole] : ""}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium">{user?.displayName || user?.username}</p>
              <p className="text-xs text-muted-foreground">{user?.email}</p>
            </div>
            <Button variant="ghost" size="icon" onClick={handleLogout} title="Đăng xuất">
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      <div className="flex">
        
        {/* SIDEBAR */}
        <aside className="hidden md:flex md:flex-col w-64 border-r bg-card min-h-[calc(100vh-4rem)] sticky top-16">
          <nav className="flex-1 p-4 space-y-1">
            {filteredNavItems.map(item => (
              <Button
                key={item.path}
                variant={location.pathname === item.path ? 'secondary' : 'ghost'}
                className="w-full justify-start"
                onClick={() => navigate(item.path)}
              >
                {item.icon}
                <span className="ml-2">{item.label}</span>
              </Button>
            ))}
          </nav>
        </aside>

        {/* MAIN */}
        <main className="flex-1 p-4 md:p-6 lg:p-8">
          {children}
        </main>

      </div>
    </div>
  );
}
