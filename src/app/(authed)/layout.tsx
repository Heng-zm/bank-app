
'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useAuth } from '@/hooks/use-auth';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  LayoutDashboard,
  LogOut,
  QrCode,
  Landmark,
  Menu,
  User,
  History,
} from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from '@/components/ui/sheet';
import { useState } from 'react';
import { NotificationBell } from '@/components/notification-bell';
import { useAccount } from '@/hooks/use-account';
import { Skeleton } from '@/components/ui/skeleton';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/transactions', label: 'Transactions', icon: History },
  { href: '/qr-pay', label: 'Scan to Pay', icon: QrCode },
  { href: '/my-qr', label: 'My QR Code', icon: User },
];

function NavLink({
  href,
  label,
  icon: Icon,
  isMobile = false,
  onClose,
}: {
  href: string;
  label: string;
  icon: React.ElementType;
  isMobile?: boolean;
  onClose?: () => void;
}) {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link href={href} legacyBehavior passHref>
      <a
        onClick={onClose}
        className={cn(
          'flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary',
          isActive && 'bg-primary/10 text-primary font-semibold',
          isMobile && 'text-lg'
        )}
      >
        <Icon className="h-4 w-4" />
        {label}
      </a>
    </Link>
  );
}

export default function AuthedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading: isAuthLoading } = useAuth();
  const { notifications, markNotificationsAsRead, isLoading: isAccountLoading } = useAccount(user?.uid);
  const router = useRouter();
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const handleLogout = async () => {
    await signOut(auth);
    router.push('/login');
  };
  
  if (isAuthLoading || isAccountLoading) {
    return (
      <div className="flex min-h-screen w-full">
        <div className="hidden md:flex md:w-[240px] flex-col gap-4 border-r bg-muted/40 p-4">
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
        </div>
        <div className="flex-1 p-6">
            <Skeleton className="h-full w-full" />
        </div>
      </div>
    )
  }

  return (
    <div className="grid min-h-screen w-full md:grid-cols-[240px_1fr]">
      {/* Desktop Sidebar */}
      <aside className="hidden border-r bg-card md:block">
        <div className="flex h-full max-h-screen flex-col gap-2">
          <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
            <Link href="/" className="flex items-center gap-2 font-semibold">
              <Landmark className="h-6 w-6 text-primary" />
              <span className="text-xl">FinSim</span>
            </Link>
          </div>
          <nav className="flex-1 grid items-start px-2 text-sm font-medium lg:px-4">
            {navItems.map((item) => (
              <NavLink key={item.href} {...item} />
            ))}
          </nav>
          <div className="mt-auto p-4">
             <Button variant="ghost" onClick={handleLogout} className="w-full justify-start">
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </aside>
      
      <div className="flex flex-col">
        {/* Mobile Header */}
        <header className="flex h-14 items-center gap-4 border-b bg-card px-4 lg:h-[60px] lg:px-6 md:hidden">
            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="shrink-0">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle navigation menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="flex flex-col">
                 <div className="flex h-14 items-center border-b mb-4">
                    <Link href="/" className="flex items-center gap-2 font-semibold text-lg">
                    <Landmark className="h-8 w-8 text-primary" />
                    <span>FinSim</span>
                    </Link>
                </div>
                <nav className="grid gap-4 text-lg font-medium">
                  {navItems.map((item) => (
                    <NavLink key={item.href} {...item} isMobile={true} onClose={() => setIsSheetOpen(false)}/>
                  ))}
                </nav>
                 <div className="mt-auto">
                    <Button variant="ghost" onClick={handleLogout} className="w-full justify-start text-lg">
                        <LogOut className="mr-3 h-5 w-5" />
                        Logout
                    </Button>
                </div>
              </SheetContent>
            </Sheet>
          <div className="w-full flex-1">
             <h1 className="font-semibold text-lg">Dashboard</h1>
          </div>
          <NotificationBell notifications={notifications} onOpen={markNotificationsAsRead} />
        </header>
        
        {/* Desktop Header */}
        <header className="hidden md:flex h-14 items-center gap-4 border-b bg-card px-4 lg:h-[60px] lg:px-6 justify-end">
            <div className="font-semibold">{user?.email}</div>
            <NotificationBell notifications={notifications} onOpen={markNotificationsAsRead} />
        </header>

        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
           {children}
        </main>
      </div>
    </div>
  );
}
