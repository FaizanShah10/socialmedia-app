"use server";

import prisma from "@/lib/prisma";
import { getDbUserId } from "./user.action";
import { revalidatePath } from "next/cache";
import { Prisma, Posts, Comments } from "@prisma/client";

// Create a post
export async function createPost(
  postContent: string,
  postImageUrl: string
): Promise<{ success: boolean; post?: Posts; error?: string } | null> {
  const userId = await getDbUserId();
  if (!userId) return null;

  try {
    const post = await prisma.posts.create({
      data: {
        content: postContent,
        image: postImageUrl,
        authorId: userId,
      },
    });

    revalidatePath("/");
    return { success: true, post };
  } catch (error) {
    console.error("Failed To Create Post", (error as Error).message);
    return { success: false, error: "Failed to create post" };
  }
}

// Delete a post
export async function deletePost(
  postId: string
): Promise<{ success: boolean; error?: string } | null> {
  try {
    const userId = await getDbUserId();
    if (!userId) return null;

    const post = await prisma.posts.findUnique({
      where: { id: postId },
      select: { authorId: true },
    });

    if (!post || post.authorId !== userId) {
      return { success: false, error: "Post not found or unauthorized" };
    }

    await prisma.posts.delete({
      where: { id: postId },
    });

    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete post", (error as Error).message);
    return { success: false, error: "Failed to delete post" };
  }
}

// Get posts
type PostWithRelations = Prisma.PostsGetPayload<{
  include: {
    author: {
      select: {
        id: true;
        name: true;
        userName: true;
        image: true;
      };
    };
    likes: {
      select: {
        userId: true;
      };
    };
    comments: {
      include: {
        author: {
          select: {
            id: true;
            userName: true;
            image: true;
            name: true;
          };
        };
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

export async function getPosts(): Promise<{
  success: boolean;
  posts?: PostWithRelations[];
  error?: string;
}> {
  try {
    const posts = await prisma.posts.findMany({
      include: {
        author: {
          select: {
            id: true,
            name: true,
            userName: true,
            image: true,
          },
        },
        likes: {
          select: {
            userId: true,
          },
        },
        comments: {
          include: {
            author: {
              select: {
                id: true,
                userName: true,
                image: true,
                name: true,
              },
            },
          },
          orderBy: {
            createdAt: "asc",
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

    return { success: true, posts };
  } catch (error) {
    console.error("Failed to get posts", (error as Error).message);
    return { success: false, error: "Failed to get posts" };
  }
}

// Create comment and notify
export async function createComment(
  postId: string,
  content: string
): Promise<{ success: boolean; comment?: Comments; error?: string } | void> {
  try {
    const userId = await getDbUserId();
    if (!userId) return;
    if (!content) throw new Error("Content is required");

    const post = await prisma.posts.findUnique({
      where: { id: postId },
      select: { authorId: true },
    });

    if (!post) throw new Error("Post not found");

    const [comment] = await prisma.$transaction(async (tx) => {
      const newComment = await tx.comments.create({
        data: {
          content,
          authorId: userId,
          postId,
        },
      });

      if (post.authorId !== userId) {
        await tx.notifications.create({
          data: {
            type: "COMMENT",
            userId: post.authorId,
            creatorId: userId,
            postId,
            commentId: newComment.id,
          },
        });
      }

      return [newComment];
    });

    revalidatePath(`/`);
    return { success: true, comment };
  } catch (error) {
    console.error("Failed to create comment", (error as Error).message);
    return { success: false, error: "Failed to create comment" };
  }
}

// Delete comment
export async function deleteComment(
  commentId: string
): Promise<{ success: boolean; error?: string } | void> {
  try {
    await prisma.comments.delete({
      where: { id: commentId },
    });
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete comment", (error as Error).message);
    return { success: false, error: "Failed to delete comment" };
  }
}

// Like / unlike a post
export async function toggleLike(
  postId: string
): Promise<{ success: boolean; error?: string } | null> {
  try {
    const userId = await getDbUserId();
    if (!userId) return null;

    const existingLike = await prisma.likes.findUnique({
      where: {
        userId_postId: {
          userId,
          postId,
        },
      },
    });

    const post = await prisma.posts.findUnique({
      where: { id: postId },
      select: { authorId: true },
    });

    if (!post) throw new Error("Post not found");

    if (existingLike) {
      await prisma.likes.delete({
        where: {
          userId_postId: {
            userId,
            postId,
          },
        },
      });
    } else {
      await prisma.$transaction([
        prisma.likes.create({
          data: {
            userId,
            postId,
          },
        }),
        ...(post.authorId !== userId
          ? [
              prisma.notifications.create({
                data: {
                  type: "LIKE",
                  userId: post.authorId,
                  creatorId: userId,
                  postId,
                },
              }),
            ]
          : []),
      ]);
    }

    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Failed to toggle like", (error as Error).message);
    return { success: false, error: "Failed to toggle like" };
  }
}

