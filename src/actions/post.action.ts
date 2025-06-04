"use server";

import prisma from "@/lib/prisma";
import { getDbUserId } from "./user.action";
import { revalidatePath } from "next/cache";

export async function createPost(postContent: string, postImageUrl: string) {
  //getting current user from database --> GetDbUserId
  const userId = await getDbUserId();

  if (!userId) return null;

  try {
    const post = prisma.posts.create({
      data: {
        content: postContent,
        image: postImageUrl,
        authorId: userId,
      },
    });

    revalidatePath("/");
    return { success: true, post };
  } catch (error: any) {
    console.log("Failed To Create Post", error.message);
    return { success: false, error: "Failed To create Post" };
  }
}

export async function deletePost(postId: string) {
  try {
    const userId = await getDbUserId();
    if (!userId) return null;

    // Check if the post exists and belongs to the user
    const post = await prisma.posts.findUnique({
      where: { id: postId },
      select: { authorId: true },
    });

    if (!post || post.authorId !== userId) {
      return { success: false, error: "Post not found or unauthorized" };
    }

    // Delete the post
    await prisma.posts.delete({
      where: { id: postId },
    });

    revalidatePath("/");
    return { success: true };
  } catch (error: any) {
    console.log("Failed to delete post", error.message);
    return { success: false, error: "Failed to delete post" };
  }
}

export async function getPosts() {
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
      }
    });

    return { success: true, posts };
  } catch (error: any) {
    console.log("Failed to get posts", error.message);
    return { success: false, error: "Failed to get posts" };
  }
}

export async function createComment(postId: string, content: string) {
  try {
    const userId = await getDbUserId(); //current user from database

    if (!userId) return;
    if (!content) throw new Error("Content is required");

    const post = await prisma.posts.findUnique({
      where: { id: postId },
      select: { authorId: true },
    });

    if (!post) throw new Error("Post not found");

    // Create comment and notification in a transaction
    const [comment] = await prisma.$transaction(async (tx) => {
      // Create comment first
      const newComment = await tx.comments.create({
        data: {
          content,
          authorId: userId,
          postId,
          
        },
      });

      // Create notification if commenting on someone else's post
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
    console.error("Failed to create comment:", error);
    return { success: false, error: "Failed to create comment" };
  }
}

export async function deleteComment(commentId: string){
  try {
    await prisma.comments.delete({
      where: {
        id: commentId
      }
    })
    revalidatePath("/")
  } catch (error: any) {
      console.log("Failed to Delete Comment", error.message);
      return { success: false, error: "Failed to Delete Comment" };
  }
}

export async function toggleLike(postId: string){
  try {
    const userId = await getDbUserId();
    if (!userId) return null;

    // Check if the post already has a like from the user
    const existingLike = await prisma.likes.findUnique({
      where: {
        userId_postId: {
          userId,
          postId,
        },
      },
    })

     const post = await prisma.posts.findUnique({
      where: { id: postId },
      select: { authorId: true },
    });

     if (!post) throw new Error("Post not found");


    if (existingLike) {
      // If the like exists, delete it
      await prisma.likes.delete({
        where: {
          userId_postId: {
            userId,
            postId,
          },
        },
      });
    } else {
      // If the like does not exist, create the like and a notification only when the post is liked of someone else
      await prisma.$transaction([
        prisma.likes.create({
          data: {
            userId, 
            postId
          }
        }),
        ...(post.authorId !== userId
          ? [
              prisma.notifications.create({
                data: {
                  type: "LIKE",
                  userId: post.authorId, // recipient (post author)
                  creatorId: userId, // person who liked the post
                  postId,
                },
              }),
            ]
          : []),
      ])
      
    }

    // Revalidate the path to update the UI
    revalidatePath("/");
    return { success: true };
  } catch (error: any) {
    console.log("Failed to toggle like", error.message);
    return { success: false, error: "Failed to toggle like" };
  }
}

export async function getCommentsBypostId(postId: string){
  try {
    
  } catch (error: any) {
    console.log("Failed to Get Comments", error.message);
    return { success: false, error: "Failed to Get Comments" };
  }
}


