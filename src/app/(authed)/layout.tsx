
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
  Settings,
} from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { useState, useMemo } from 'react';
import { NotificationBell } from '@/components/notification-bell';
import { useAccount } from '@/hooks/use-account';
import { Skeleton } from '@/components/ui/skeleton';
import { useTranslation } from '@/hooks/use-translation';


export default function AuthedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading: isAuthLoading } = useAuth();
  const { notifications, markNotificationsAsRead, isLoading: isAccountLoading } = useAccount(user?.uid);
  const router = useRouter();
  const pathname = usePathname();
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const { t } = useTranslation();

  const navItems = useMemo(() => [
    { href: '/dashboard', label: t('nav.dashboard'), icon: LayoutDashboard },
    { href: '/transactions', label: t('nav.transactions'), icon: History },
    { href: '/qr-pay', label: t('nav.qrPay'), icon: QrCode },
    { href: '/my-qr', label: t('nav.myQr'), icon: User },
    { href: '/settings', label: t('nav.settings'), icon: Settings },
  ], [t]);

  const currentPage = useMemo(() => {
    return navItems.find(item => item.href === pathname) || { label: t('nav.dashboard') };
  }, [pathname, navItems, t]);

  const handleLogout = async () => {
    await signOut(auth);
    router.push('/login');
  };
  
  if (isAuthLoading || isAccountLoading) {
    return (
      <div className="flex min-h-screen w-full bg-muted/40">
        <div className="hidden md:flex md:w-[240px] flex-col gap-4 border-r bg-background p-4">
            <Skeleton className="h-8 w-32" />
            <div className="flex-1 space-y-2 mt-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
        </div>
        <div className="flex-1 p-6">
            <Skeleton className="h-full w-full" />
        </div>
      </div>
    )
  }

function NavLink({
  href,
  label,
  icon: Icon,
  isMobile = false,
  onClose,
}: {
  href: string;
  label:string;
  icon: React.ElementType;
  isMobile?: boolean;
  onClose?: () => void;
}) {
  const isActive = pathname === href;

  return (
    <Link
      href={href}
      onClick={onClose}
      className={cn(
        'flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary',
        isActive && 'bg-primary/10 text-primary font-semibold',
        isMobile && 'text-lg'
      )}
    >
      <Icon className="h-5 w-5" />
      {label}
    </Link>
  );
}

  return (
    <div className="grid min-h-screen w-full md:grid-cols-[240px_1fr] bg-muted/40">
      {/* Desktop Sidebar */}
      <aside className="hidden border-r bg-background md:block">
        <div className="flex h-full max-h-screen flex-col gap-2">
          <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
            <Link href="/" className="flex items-center gap-2 font-semibold">
              <Landmark className="h-6 w-6 text-primary" />
              <span className="text-xl">FinSim</span>
            </Link>
          </div>
          <nav className="flex-1 grid items-start px-2 text-sm font-medium lg:px-4 py-4">
            {navItems.map((item) => (
              <NavLink key={item.href} {...item} />
            ))}
          </nav>
          <div className="mt-auto p-4">
             <Button variant="ghost" onClick={handleLogout} className="w-full justify-start">
              <LogOut className="mr-2 h-4 w-4" />
              {t('logout')}
            </Button>
          </div>
        </div>
      </aside>
      
      <div className="flex flex-col">
        {/* Mobile Header */}
        <header className="flex h-14 items-center gap-4 border-b bg-background px-4 lg:h-[60px] lg:px-6 md:hidden sticky top-0 z-30">
            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="shrink-0">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle navigation menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="flex flex-col">
                 <SheetHeader className="sr-only">
                    <SheetTitle>Navigation Menu</SheetTitle>
                    <SheetDescription>Main navigation links for the application.</SheetDescription>
                 </SheetHeader>
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
                        {t('logout')}
                    </Button>
                </div>
              </SheetContent>
            </Sheet>
          <div className="w-full flex-1">
             <h1 className="font-semibold text-lg">{currentPage.label}</h1>
          </div>
          <NotificationBell notifications={notifications} onOpen={markNotificationsAsRead} />
        </header>
        
        {/* Desktop Header */}
        <header className="hidden md:flex h-14 items-center gap-4 border-b bg-background px-4 lg:h-[60px] lg:px-6 justify-end sticky top-0 z-30">
            <div className="font-semibold">{user?.email}</div>
            <NotificationBell notifications={notifications} onOpen={markNotificationsAsRead} />
        </header>

        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 animate-fade-in-up">
           {children}
        </main>
      </div>
    </div>
  );
}
