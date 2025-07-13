
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "@/hooks/use-translation";
import { Gift, Star, Ticket } from "lucide-react";
import Image from 'next/image';

const rewards = [
    { id: 1, title: 'Free Coffee', points: 500, icon: Gift, image: 'https://placehold.co/600x400.png', hint: 'coffee cup' },
    { id: 2, title: '10% Off Groceries', points: 1000, icon: Star, image: 'https://placehold.co/600x400.png', hint: 'grocery store' },
    { id: 3, title: 'Movie Ticket', points: 1500, icon: Ticket, image: 'https://placehold.co/600x400.png', hint: 'movie theater' },
    { id: 4, title: '$20 Cashback', points: 2500, icon: Gift, image: 'https://placehold.co/600x400.png', hint: 'cash money' },
]

export default function RewardsPage() {
    const { toast } = useToast();
    const { t } = useTranslation();
    const currentPoints = 12324;

    const handleRedeem = (reward: typeof rewards[0]) => {
        toast({
            title: t('rewards.redeem.toastSuccessTitle'),
            description: t('rewards.redeem.toastSuccessDescription', { title: reward.title, points: reward.points }),
        })
    }

    return (
        <div className="space-y-6">
            <Card className="text-center bg-purple-500/10 border-purple-500/20">
                <CardHeader>
                    <CardDescription>{t('rewards.currentPoints')}</CardDescription>
                    <CardTitle className="text-5xl font-bold">{currentPoints.toLocaleString()}</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground">{t('rewards.keepItUp')}</p>
                </CardContent>
            </Card>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {rewards.map((reward) => (
                    <Card key={reward.id}>
                        <CardHeader>
                            <div className="relative h-40 mb-4 rounded-lg overflow-hidden">
                                <Image src={reward.image} alt={reward.title} layout="fill" objectFit="cover" data-ai-hint={reward.hint} />
                            </div>
                            <CardTitle className="flex items-center gap-2">
                                <reward.icon className="h-5 w-5 text-purple-500"/>
                                {reward.title}
                            </CardTitle>
                            <CardDescription>{t('rewards.redeem.points', { points: reward.points.toLocaleString() })}</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Button className="w-full" onClick={() => handleRedeem(reward)} disabled={currentPoints < reward.points}>
                                {currentPoints >= reward.points ? t('rewards.redeem.button') : t('rewards.redeem.notEnoughPoints')}
                            </Button>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    )
}
