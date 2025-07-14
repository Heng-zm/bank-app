
"use client";

import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";

import { useAuth } from "@/hooks/use-auth";
import { useAccount } from "@/hooks/use-account";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "@/hooks/use-translation";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Loader2, User, Camera } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const profileFormSchema = z.object({
  holderName: z.string().min(2, "Name must be at least 2 characters."),
});

export default function ProfileSettingsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const { account, updateAccountDetails, isLoading: isAccountLoading } = useAccount(user?.uid);
  const { t } = useTranslation();
  const [isSaving, setIsSaving] = useState(false);
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(account?.photoURL || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<z.infer<typeof profileFormSchema>>({
    resolver: zodResolver(profileFormSchema),
    values: {
      holderName: account?.holderName || "",
    },
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfileImage(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };
  
  const onSubmit = async (values: z.infer<typeof profileFormSchema>) => {
    setIsSaving(true);
    try {
      await updateAccountDetails({ holderName: values.holderName }, profileImage || undefined);
      toast({
        title: t('success'),
        description: t('settings.profile.toastSuccess'),
      });
      router.back();
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: t('error'),
        description: error.message,
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('settings.profile.title')}</CardTitle>
        <CardDescription>{t('settings.profile.description')}</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="flex flex-col items-center space-y-4">
                <div className="relative">
                    <Avatar className="w-32 h-32 text-4xl">
                        <AvatarImage src={previewUrl || account.photoURL} alt={account.holderName} />
                        <AvatarFallback>
                            <User className="w-16 h-16 text-muted-foreground" />
                        </AvatarFallback>
                    </Avatar>
                    <Button 
                        type="button" 
                        size="icon" 
                        className="absolute bottom-1 right-1 rounded-full"
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <Camera className="w-5 h-5"/>
                        <span className="sr-only">Change profile picture</span>
                    </Button>
                    <input 
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        accept="image/png, image/jpeg"
                        onChange={handleImageChange}
                    />
                </div>
            </div>

            <FormField
              control={form.control}
              name="holderName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('settings.profile.form.nameLabel')}</FormLabel>
                  <FormControl>
                    <Input placeholder={t('settings.profile.form.namePlaceholder')} {...field} disabled={isAccountLoading} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={isSaving || isAccountLoading}>
              {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {t('settings.saveChanges')}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
