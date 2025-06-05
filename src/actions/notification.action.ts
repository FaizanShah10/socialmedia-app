// notification will also include --> post, specific post including (postid, image, content)
// comment
// like

"use server"

import prisma from "@/lib/prisma"
import { getDbUserId } from "./user.action"
import { Prisma } from "@prisma/client"

// Define the returned type from the notification query
type NotificationWithDetails = Prisma.NotificationsGetPayload<{
  include: {
    creator: {
      select: {
        id: true;
        name: true;
        userName: true;
        image: true;
      };
    };
    comment: {
      select: {
        id: true;
        content: true;
        createdAt: true;
      };
    };
    post: {
      select: {
        id: true;
        content: true;
        image: true;
      };
    };
  };
}>

export async function getNotifications(): Promise<NotificationWithDetails[]> {
  try {
    const userId = await getDbUserId()

    if (!userId) return []

    const notifications = await prisma.notifications.findMany({
      where: { userId },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            userName: true,
            image: true,
          },
        },
        comment: {
          select: {
            id: true,
            content: true,
            createdAt: true,
          },
        },
        post: {
          select: {
            id: true,
            content: true,
            image: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    return notifications
  } catch (error) {
    console.error("Error Getting Notifications", (error as Error).message)
    throw new Error("Error Getting Notifications")
  }
}

export async function markNotificationAsRead(
  notificationIds: string[]
): Promise<{ success: boolean } | void> {
  try {
    await prisma.notifications.updateMany({
      where: {
        id: {
          in: notificationIds,
        },
      },
      data: {
        read: true,
      },
    })
    return { success: true }
  } catch (error) {
    console.error("Error Marking As Read Notifications", (error as Error).message)
  }
}
