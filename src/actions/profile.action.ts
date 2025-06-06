"use server";

import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { getDbUserId } from "./user.action";

// Profile type with follower/following/post counts
type UserProfile = Omit<
  Prisma.UserGetPayload<{
    select: {
      id: true;
      name: true;
      userName: true;
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

// Get user profile by username
export async function getProfileByUsername(
  username: string
): Promise<UserProfile | null> {
  try {
    const user = await prisma.user.findUnique({
      where: { userName: username },
      select: {
        id: true,
        name: true,
        userName: true,
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
    console.error("Error fetching profile:", (error as Error).message);
    throw new Error("Failed to fetch profile");
  }
}

// Post with author, comments, likes, and count
type PostWithDetails = Prisma.PostsGetPayload<{
  select: {
    id: true;
    content: true;
    image: true;
    createdAt: true;
    author: {
      select: {
        id: true;
        name: true;
        userName: true;
        image: true;
      };
    };
    comments: {
      select: {
        id: true;
        content: true;
        createdAt: true;
        authorId: true;
        postId: true;
        author: {
          select: {
            id: true;
            name: true;
            userName: true;
            image: true;
          };
        };
      };
      orderBy: {
        createdAt: "asc";
      };
    };
    likes: {
      select: {
        userId: true;
      };
    };
    _count: {
      select: {
        likes: true;
        comments: true;
      };
    };
  };
}>;

// Get posts for a given user
export async function getUserPosts(
  userId: string
): Promise<PostWithDetails[]> {
  try {
    const posts = await prisma.posts.findMany({
      where: { authorId: userId },
      select: {
        id: true,
        content: true,
        image: true,
        createdAt: true,
        author: {
          select: {
            id: true,
            name: true,
            userName: true,
            image: true,
          },
        },
        comments: {
          select: {
            id: true,
            content: true,
            createdAt: true,
            authorId: true,
            postId: true,
            author: {
              select: {
                id: true,
                name: true,
                userName: true,
                image: true,
              },
            },
          },
          orderBy: {
            createdAt: "asc",
          },
        },
        likes: {
          select: {
            userId: true,
          },
        },
        _count: {
          select: {
            likes: true,
            comments: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return posts;
  } catch (error) {
    console.error("Error fetching posts:", (error as Error).message);
    throw new Error("Failed to fetch user posts");
  }
}

// Update user profile
export async function updateUserProfile(formData: FormData) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) throw new Error("Unauthorized");

    const name = formData.get("name") as string;
    const bio = formData.get("bio") as string;
    const location = formData.get("location") as string;
    const websiteUrl = formData.get("website") as string;

    const user = await prisma.user.update({
      where: { clerkId },
      data: {
        name,
        bio,
        location,
        websiteUrl,
      },
    });

    revalidatePath("/profile");
    return { success: true, user };
  } catch (error) {
    console.error("Error updating profile:", error);
    return { success: false, error: "Failed to update profile" };
  }
}

// is Following
export async function isFollowing(userId: string) {
  try {
    const currentUserId = await getDbUserId();
    if (!currentUserId) return false;

    const follow = await prisma.follows.findUnique({
      where: {
        followerId_followingId: {
          followerId: currentUserId,
          followingId: userId,
        },
      },
    });

    return !!follow;
  } catch (error) {
    console.error("Error checking follow status:", error);
    return false;
  }
}

