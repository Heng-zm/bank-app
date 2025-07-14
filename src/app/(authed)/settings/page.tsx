
"use client";

import { signOut } from "firebase/auth";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { useAuth } from "@/hooks/use-auth";
import { useAccount } from "@/hooks/use-account";
import { useTranslation } from "@/hooks/use-translation";
import { auth } from "@/lib/firebase";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, User, Bell, Lock, LogOut, ChevronRight, Languages } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";


const SettingsItem = ({ icon: Icon, text, href }: {icon: React.ElementType, text: string, href: string}) => (
    <Link href={href} className="flex items-center w-full p-4 text-left transition-colors rounded-lg hover:bg-muted/50">
        <Icon className="w-5 h-5 mr-4 text-muted-foreground" />
        <span className="flex-1 text-card-foreground">{text}</span>
        <ChevronRight className="w-5 h-5 text-muted-foreground" />
    </Link>
)

export default function SettingsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const { account, isLoading: isAccountLoading } = useAccount(user?.uid);
  const { t } = useTranslation();

  const handleLogout = async () => {
    await signOut(auth);
    router.push('/login');
  };

  if (isAccountLoading) {
    return <div className="flex justify-center items-center h-full"><Loader2 className="w-8 h-8 animate-spin" /></div>
  }

  return (
    <div className="space-y-8">
        {/* Profile Card */}
        <div className="flex flex-col items-center text-center">
            <Avatar className="w-24 h-24 mb-4 text-3xl">
                <AvatarImage src={account.photoURL} alt={account.holderName} />
                <AvatarFallback>
                    <User className="w-12 h-12 text-muted-foreground" />
                </AvatarFallback>
            </Avatar>
            <h1 className="text-2xl font-bold">{account.holderName}</h1>
            <p className="text-muted-foreground">{user?.email}</p>
        </div>
      
      <Card>
        <CardHeader>
          <CardTitle>{t('settings.account.title')}</CardTitle>
        </CardHeader>
        <CardContent className="p-0 divide-y">
            <SettingsItem icon={User} text={t('settings.profile.title')} href="/settings/profile" />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('settings.preferences.title')}</CardTitle>
        </CardHeader>
        <CardContent className="p-0 divide-y">
            <SettingsItem icon={Languages} text={t('settings.language.title')} href="/settings/language" />
            <SettingsItem icon={Bell} text={t('settings.notifications.title')} href="/settings/notifications" />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('settings.security.title')}</CardTitle>
        </CardHeader>
        <CardContent className="p-0 divide-y">
            <SettingsItem icon={Lock} text={t('settings.password.title')} href="/settings/password" />
        </CardContent>
      </Card>
      
      <Button variant="outline" onClick={handleLogout} className="w-full">
        <LogOut className="w-4 h-4 mr-2" />
        {t('logout')}
      </Button>
    </div>
  );
}
