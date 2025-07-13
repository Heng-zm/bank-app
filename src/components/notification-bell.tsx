
"use client"

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { Bell, Info, AlertTriangle, DollarSign } from "lucide-react"
import type { Notification } from "@/lib/types"
import { formatDistanceToNow } from "date-fns"
import { cn } from "@/lib/utils"
import { useTranslation } from "@/hooks/use-translation"

interface NotificationBellProps {
  notifications: Notification[],
  onOpen: () => void,
}

const notificationIcons = {
  deposit: <DollarSign className="h-4 w-4 text-green-500" />,
  alert: <AlertTriangle className="h-4 w-4 text-yellow-500" />,
  info: <Info className="h-4 w-4 text-blue-500" />,
}

export function NotificationBell({ notifications, onOpen }: NotificationBellProps) {
  const unreadCount = notifications.filter(n => !n.isRead).length;
  const { t } = useTranslation();

  return (
    <Popover onOpenChange={(open) => {
        if (open) onOpen();
    }}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5"/>
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-xs text-white">
              {unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-screen max-w-[320px] sm:max-w-sm p-0">
        <div className="p-4 font-semibold border-b">
          {t('notifications.title')}
        </div>
        <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
                <p className="p-4 text-sm text-muted-foreground">{t('notifications.noNotifications')}</p>
            ) : (
                notifications.map(n => (
                    <div key={n.id} className={cn(
                        "flex items-start gap-4 p-4 border-b last:border-b-0",
                        !n.isRead && "bg-blue-50 dark:bg-blue-900/20"
                    )}>
                       <div className="mt-1">
                         {notificationIcons[n.type]}
                       </div>
                       <div className="flex-1 space-y-1">
                            <p className="text-sm">{n.message}</p>
                            <p className="text-xs text-muted-foreground">
                                {n.timestamp ? formatDistanceToNow(new Date(n.timestamp), { addSuffix: true }) : t('notifications.justNow')}
                            </p>
                       </div>
                    </div>
                ))
            )}
        </div>
      </PopoverContent>
    </Popover>
  )
}
