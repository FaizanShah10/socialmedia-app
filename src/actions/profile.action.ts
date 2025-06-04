"use server";

import prisma from "@/lib/prisma";

export async function getProfileByUsername(username: string) {
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
    console.error("Error fetching profile:", error);
    throw new Error("Failed to fetch profile");
  }
}

export async function getUserPosts(userId: string) {
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
  } catch (error: any) {
    console.error("Error fetching posts:", error.message);
    throw new Error("Failed to fetch user posts");
  }
}


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
}) {
  try {
    await prisma.user.update({
      where: { id: userId },
      data: { bio, location, websiteUrl, image },
    });
  } catch (error: any) {
    console.error("Error updating profile:", error.message);
    throw new Error("Failed to update profile");
  }
}

