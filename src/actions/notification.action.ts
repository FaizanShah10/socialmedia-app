// notification will also include --> post, specific post including (postid, image, content)
// comment
// like

"use server"

import prisma from "@/lib/prisma"
import { getDbUserId } from "./user.action"


export async function getNotifications(){
    try {
        const userId = await getDbUserId()

        if(!userId) return []

        const notifications = await prisma.notifications.findMany({
            where: {
                userId,
            },
            include: {
                creator: {
                    select: {
                        id: true,
                        name: true,
                        userName: true,
                        image: true
                    }
                },
                comment: {
                    select: {
                        id: true,
                        content: true,
                        createdAt: true
                    }
                },
                post: {
                    select: {
                        id: true,
                        content: true,
                        image: true
                    }
                },
            },
            orderBy: {
                createdAt: "desc"
            }
        })

        return notifications
    } catch (error: any) {
        console.log("Error Getting Notifications", error.message)
        throw new Error ("Error Getting Notifications")
    }
}


export async function markNotificationAsRead(notificationIds: string[]){
    try {
        await prisma.notifications.updateMany({
            where: {
                id: {
                    in: notificationIds,
                }
            },
            data: {
                read: true
            }
        })
        return {success: true}
    } catch (error: any) {
        console.log("Error Marking As Read Notifications", error.message)
    }
}


