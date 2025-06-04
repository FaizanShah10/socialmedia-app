"use server"

import prisma from "@/lib/prisma";
import { auth, currentUser } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { use } from "react";

//syncing user with Clerk and database
export async function syncUser() {
    const user = await currentUser();
    const { userId } = await auth();

    if (!userId) {
        throw new Error("No userId found from Clerk authentication.");
    }

    const email = user?.emailAddresses?.[0]?.emailAddress;
    if (!email) {
        throw new Error("No email found for user.");
    }

    try {
        const existingUser = await prisma.user.findUnique({
            where: {
                clerkId: userId
            }
        });

        if (existingUser) return existingUser;

        const newUser = await prisma.user.create({
            data: {
                clerkId: userId,
                name: `${user?.firstName || ""}  ${user?.lastName || ""}`,
                userName: user?.username ?? email.split("@")[0],
                email: email,
                image: user?.imageUrl
            }
        });

        return newUser;
    } catch (error:any) {
        console.log("Error creating new user in database", error.message);
    }
}


export async function getUserByClerkId(clerkId: string) {
  return prisma.user.findUnique({
    where: {
      clerkId,
    },
    include: {
      _count: {
        select: {
          followers: true,
          following: true,
          posts: true,
        },
      },
    },
  });
}

//getting current loggedIn user from database by userId
export async function getDbUserId() {
  const { userId: clerkId } = await auth();
  if (!clerkId) return null;

  const user = await getUserByClerkId(clerkId);

  if (!user) throw new Error("User not found");

  return user.id;
}

//getting user from db using the dbUserId
export async function getCurrentUser(){
  try {
    const userId = await getDbUserId()
    if(!userId) return null
    const user = await prisma.user.findUnique({
      where: {
        id: userId
      },
      select: {
        id: true,
        userName: true,
        name: true,
        bio: true,
        image: true,
        location: true,
        websiteUrl: true,
        createdAt: true,
        _count: {
          select: {
            followers: true,
            following: true,
            posts: true
          }
        }
      }
    })

    return user
  } catch (error: any) {
    console.log("Error Getting User", error.message)
  }
}


//getting random suggested users
export async function getRandomSuggestedUsers() {

    const userId = await getDbUserId() //current user Id

    if(!userId) return null

    try {
        const users = await prisma.user.findMany({
            where: {
                AND: [
                    {NOT:{id: userId}}, //excluding ourselves
                    {NOT: {
                        followers: {
                            some: {
                                followerId: userId //excuding the followers already in our following list
                            }
                        }
                    }}
                ]
            },
            select: {
                id: true,
                userName: true,
                name: true,
                image: true,
                _count: {
                    select: {
                        followers: true
                    }
                }
            },
            take: 5
        });

        return users;
    } catch (error: any) {
        console.log("Error Getting random suggested users", error.message);
    }
}

export async function toggleFollow(targetUserId: string) {
  try {
    const userId = await getDbUserId();

    if (!userId) return;

    if (userId === targetUserId) throw new Error("You cannot follow yourself");

    const existingFollow = await prisma.follows.findUnique({
      where: {
        followerId_followingId: {
          followerId: userId,
          followingId: targetUserId,
        },
      },
    });

    if (existingFollow) {
      // unfollow
      await prisma.follows.delete({
        where: {
          followerId_followingId: {
            followerId: userId,
            followingId: targetUserId,
          },
        },
      });
    } else {
      // follow
      await prisma.$transaction([
        prisma.follows.create({
          data: {
            followerId: userId,
            followingId: targetUserId,
          },
        }),

        prisma.notifications.create({
          data: {
            type: "FOLLOW",
            userId: targetUserId, // user being followed
            creatorId: userId, // user following
          },
        }),
      ]);
    }

    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.log("Error in toggleFollow", error);
    return { success: false, error: "Error toggling follow" };
  }
}