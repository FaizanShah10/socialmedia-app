"use server";

import prisma from "@/lib/prisma";
import { auth, currentUser } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { Prisma, User } from "@prisma/client";
import { SuggestedUser } from "@/types";

// 1. Sync user from Clerk to DB
export async function syncUser(): Promise<User | undefined> {
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
      where: { clerkId: userId },
    });

    if (existingUser) return existingUser;

    const newUser = await prisma.user.create({
      data: {
        clerkId: userId,
        name: `${user?.firstName || ""} ${user?.lastName || ""}`,
        userName: user?.username ?? email.split("@")[0],
        email: email,
        image: user?.imageUrl,
      },
    });

    return newUser;
  } catch (error) {
    console.error("Error creating new user in database:", (error as Error).message);
  }
}

// 2. Get user by Clerk ID
export async function getUserByClerkId(
  clerkId: string
): Promise<(User & { _count: { followers: number; following: number; posts: number } }) | null> {
  return prisma.user.findUnique({
    where: { clerkId },
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

// 3. Get DB user ID from Clerk
export async function getDbUserId(): Promise<string | null> {
  const { userId: clerkId } = await auth();
  if (!clerkId) return null;

  const user = await getUserByClerkId(clerkId);
  if (!user) throw new Error("User not found");

  return user.id;
}

// 4. Get currently authenticated DB user
type CurrentUserProfile = Omit<
  Prisma.UserGetPayload<{
    select: {
      id: true;
      userName: true;
      name: true;
      bio: true;
      image: true;
      location: true;
      websiteUrl: true;
      createdAt: true;
      _count: {
        select: {
          followers: true;
          following: true;
          posts: true;
        };
      };
    };
  }>,
  never
>;

export async function getCurrentUser(): Promise<CurrentUserProfile | null> {
  try {
    const userId = await getDbUserId();
    if (!userId) return null;

    const user = await prisma.user.findUnique({
      where: { id: userId },
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
            posts: true,
          },
        },
      },
    });

    return user;
  } catch (error) {
    console.error("Error Getting User", (error as Error).message);
    return null;
  }
}

// 5. Get random suggested user
export async function getRandomSuggestedUsers(): Promise<SuggestedUser[] | null> {
  const userId = await getDbUserId();
  if (!userId) return null;

  try {
    const users = await prisma.user.findMany({
      where: {
        AND: [
          { NOT: { id: userId } },
          {
            NOT: {
              followers: {
                some: { followerId: userId },
              },
            },
          },
        ],
      },
      select: {
        id: true,
        userName: true,
        name: true,
        image: true,
        _count: {
          select: {
            followers: true,
          },
        },
      },
      take: 5,
    });

    return users;
  } catch (error) {
    console.error("Error Getting random suggested users", (error as Error).message);
    return null;
  }
}

// 6. Toggle follow/unfollow
export async function toggleFollow(
  targetUserId: string
): Promise<{ success: boolean; error?: string } | void> {
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
            userId: targetUserId, // recipient
            creatorId: userId,    // sender
          },
        }),
      ]);
    }

    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Error in toggleFollow:", (error as Error).message);
    return { success: false, error: "Error toggling follow" };
  }
}
