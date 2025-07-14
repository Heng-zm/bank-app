
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { generateUniqueAccountNumber } from "@/hooks/use-account";
import { useTranslation } from "@/hooks/use-translation";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2, UserPlus, AlertCircle } from "lucide-react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";


const formSchema = z.object({
  firstName: z.string().min(1, { message: "First name is required." }),
  lastName: z.string().min(1, { message: "Last name is required." }),
  email: z.string().email({ message: "Please enter a valid email." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
  initialBalance: z.coerce.number().min(0, { message: "Initial balance cannot be negative." }),
});

export default function SignupPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { t } = useTranslation();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      initialBalance: 1000,
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    setError(null);

    if (!auth || !db) {
        setError(t('firebase.notConfigured'));
        setIsLoading(false);
        return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, values.email, values.password);
      const user = userCredential.user;
      
      // Create the account document in Firestore
      const newAccountNumber = await generateUniqueAccountNumber(db);
      const accountData = {
        id: user.uid,
        holderName: `${values.firstName} ${values.lastName}`,
        accountNumber: newAccountNumber,
        balance: values.initialBalance,
        notificationPreferences: { deposits: true, alerts: true, info: true }
      };
      await setDoc(doc(db, "accounts", user.uid), accountData);

      toast({
        title: t('signup.toastSuccessTitle'),
        description: t('signup.toastSuccessDescription'),
      });
      router.push("/login");
    } catch (error: any) {
      let errorMessage = error.message;
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = t('signup.emailInUseError');
      }
      setError(errorMessage);
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <Card className="w-full max-w-md mx-4">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus />
            {t('signup.title')}
          </CardTitle>
          <CardDescription>{t('signup.description')}</CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>{t('signup.failTitle')}</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-4">
                  <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormLabel>{t('signup.firstNameLabel')}</FormLabel>
                        <FormControl>
                          <Input placeholder={t('signup.firstNamePlaceholder')} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormLabel>{t('signup.lastNameLabel')}</FormLabel>
                        <FormControl>
                          <Input placeholder={t('signup.lastNamePlaceholder')} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
              </div>
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('email')}</FormLabel>
                    <FormControl>
                      <Input placeholder="you@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('password')}</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••••" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name="initialBalance"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('signup.initialBalanceLabel')}</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="1000.00" {...field} step="0.01" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading && <Loader2 className="animate-spin" />}
                {t('signup.createAccountButton')}
              </Button>
            </form>
          </Form>
          <div className="mt-4 text-center text-sm">
            {t('signup.alreadyHaveAccount')}{" "}
            <Link href="/login" className="underline">
              {t('signup.loginLink')}
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
