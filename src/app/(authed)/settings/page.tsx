
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { updatePassword, signOut } from "firebase/auth";
import { useRouter } from "next/navigation";

import { useAuth } from "@/hooks/use-auth";
import { useAccount } from "@/hooks/use-account";
import { useToast } from "@/hooks/use-toast";
import { auth } from "@/lib/firebase";
import { useTranslation } from "@/hooks/use-translation";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Loader2, User, Bell, Lock, LogOut, ChevronRight, Languages, Edit } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// Schemas can be used later for dialogs/modals
const profileFormSchema = z.object({
  holderName: z.string().min(2, "Name must be at least 2 characters."),
});

const passwordFormSchema = z.object({
  newPassword: z.string().min(6, "Password must be at least 6 characters."),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

const notificationsFormSchema = z.object({
  deposits: z.boolean(),
  alerts: z.boolean(),
  info: z.boolean(),
});

const SettingsItem = ({ icon: Icon, text, onClick }: {icon: React.ElementType, text: string, onClick?: () => void}) => (
    <button onClick={onClick} className="flex items-center w-full p-4 text-left transition-colors rounded-lg hover:bg-muted/50">
        <Icon className="w-5 h-5 mr-4 text-muted-foreground" />
        <span className="flex-1 text-card-foreground">{text}</span>
        <ChevronRight className="w-5 h-5 text-muted-foreground" />
    </button>
)

export default function SettingsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const { account, updateAccountDetails } = useAccount(user?.uid);
  const { t, setLanguage, language } = useTranslation();

  const handleLogout = async () => {
    await signOut(auth);
    router.push('/login');
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  }

  return (
    <div className="space-y-8">
        {/* Profile Card */}
        <div className="flex flex-col items-center text-center">
            <Avatar className="w-24 h-24 mb-4 text-3xl">
                <AvatarImage src={`https://placehold.co/100x100.png`} alt={account.holderName} />
                <AvatarFallback>{getInitials(account.holderName)}</AvatarFallback>
            </Avatar>
            <h1 className="text-2xl font-bold">{account.holderName}</h1>
            <p className="text-muted-foreground">{user?.email}</p>
            <Button variant="ghost" size="sm" className="mt-2">
                <Edit className="w-4 h-4 mr-2" />
                {t('settings.profile.editButton')}
            </Button>
        </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('settings.preferences.title')}</CardTitle>
        </CardHeader>
        <CardContent className="p-2">
            <SettingsItem icon={Languages} text={t('settings.language.title')} />
            <SettingsItem icon={Bell} text={t('settings.notifications.title')} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('settings.security.title')}</CardTitle>
        </CardHeader>
        <CardContent className="p-2">
            <SettingsItem icon={Lock} text={t('settings.password.title')} />
        </CardContent>
      </Card>
      
      <Button variant="outline" onClick={handleLogout} className="w-full">
        <LogOut className="w-4 h-4 mr-2" />
        {t('logout')}
      </Button>
    </div>
  );
}
