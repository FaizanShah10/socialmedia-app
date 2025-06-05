"use server";

import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";

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
export async function updateUserProfile({
  userId,
  bio,
  location,
  websiteUrl,
  image,
}: {
  userId: string;
  bio?: string;
  location?: string;
  websiteUrl?: string;
  image?: string;
}): Promise<void> {
  try {
    await prisma.user.update({
      where: { id: userId },
      data: { bio, location, websiteUrl, image },
    });
  } catch (error) {
    console.error("Error updating profile:", (error as Error).message);
    throw new Error("Failed to update profile");
  }
}
