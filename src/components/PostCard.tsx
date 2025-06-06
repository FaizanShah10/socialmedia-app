"use client";

import { Card, CardContent } from "@/components/ui/card";
import {
  DotIcon,
  HeartIcon,
  LogInIcon,
  MessageCircleIcon,
  SendIcon,
  Trash2,
  TrashIcon,
} from "lucide-react";
import Image from "next/image";
import { Button } from "./ui/button";
import { SignInButton, useUser } from "@clerk/nextjs";
import { useState } from "react";
import toast from "react-hot-toast";
import {
  createComment,
  deleteComment,
  deletePost,
  toggleLike,
} from "@/actions/post.action";
import { formatDistanceToNow } from "date-fns/formatDistanceToNow";
// import Picker from "@emoji-mart/react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Avatar, AvatarImage } from "./ui/avatar";
import { Textarea } from "./ui/textarea";
import Link from "next/link";
import { PostCardPost } from "@/types";

export default function PostCard({
  post,
  dbUserId,
}: {
  post: PostCardPost;
  dbUserId?: string | null;
}) {
  const { user } = useUser();

  const [newComment, setNewComment] = useState("");
  const [showComments, setShowComments] = useState(false);
  const [isCommenting, setisCommenting] = useState(false);
  const [hasLiked, sethasLiked] = useState(
    post.likes.some((like) => like.userId === dbUserId)
  );
  const [isLiking, setisLiking] = useState(false);
  const [optimisticLikes, setOptimisticLikes] = useState(post._count.likes);
  // const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  // if(!user) return null

  // const addEmoji = (emoji: any) => {
  //   setNewComment((prev) => prev + emoji.native);
  // };

  const handleLike = async () => {
    if (isLiking) return;
    try {
      setisLiking(true);
      sethasLiked((prev: boolean) => !prev);
      setOptimisticLikes((prev: number) => (hasLiked ? prev - 1 : prev + 1));
      await toggleLike(post.id);
    } catch (error) {
      sethasLiked((prev: boolean) => !prev);
      setOptimisticLikes((prev: number) => (hasLiked ? prev + 1 : prev - 1));
      toast.error("An error occurred while liking the post.");
      console.error("Error liking post:", error);
    } finally {
      setisLiking(false);
    }
  };

  const handleAddComment = async (postId: string, content: string) => {
    try {
      const newComment = await createComment(postId, content);
      if (newComment?.success) {
        setisCommenting(true);
        setNewComment("");
        toast.success("Comment added successfully");
        setShowComments(true);
      } else {
        toast.error(newComment?.error || "Failed to add comment");
      }
    } catch (error) {
      toast.error("Failed to add comment");
      console.error("Error adding comment:", error);
    } finally {
      setisCommenting(false);
    }

    console.log("New comment added:", newComment);
  };

  const handleDeletePost = async () => {
    try {
      await deletePost(post.id);
      toast.success("Post deleted successfully");
    } catch (error) {
      toast.error("Failed to delete post");
      console.error("Error deleting post:", error);
    }
  };

  return (
    <Card className="max-w-xl md:mx-auto mx-0 mt-10 bg-[#0F0F0F] border border-[#1F1F1F] shadow-xl">
      <CardContent className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Image
              src={post.author.image || "/avatar.png"}
              alt="User Avatar"
              width={40}
              height={40}
              className="rounded-full"
            />
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <Link href={`/profile/${post.author.userName}`}>
                  <h3 className="neue-medium md:block hidden text-white cursor-pointer">
                    {post.author.name}
                  </h3>
                </Link>
                <Link href={`/profile/${post.author.userName}`}>
                  <p className="text-sm neue-roman text-gray-400 cursor-pointer">
                    @{post.author.userName}
                  </p>
                </Link>
              </div>
              <p className="text-sm neue-roman text-gray-400 flex items-center gap-1">
                <DotIcon className="md:block hidden" />
                {formatDistanceToNow(new Date(post.createdAt))} ago
              </p>
            </div>
          </div>
          {dbUserId === post.author.id && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Trash2
                  size={16}
                  className="text-gray-400 hover:text-red-500 cursor-pointer"
                />
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete
                    your post.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDeletePost}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>

        {/* Post Caption */}
        <p className="text-white mt-6 mb-5 neue-roman">{post.content}</p>

        {/* Post Image */}
        {post.image && (
          <div className="rounded-lg overflow-hidden">
            <Image
              src={post.image}
              alt="Post content"
              width={600} // or any width you want
              height={400}
              className="w-full rounded-lg object-cover"
            />
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center pt-4 space-x-4">
          {user ? (
            <Button
              variant="ghost"
              size="sm"
              className="text-red-400"
              onClick={handleLike}
            >
              <HeartIcon className="size-5" />
              <span>{optimisticLikes}</span>
            </Button>
          ) : (
            <SignInButton mode="modal">
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground gap-2"
              >
                <HeartIcon className="size-5" />
                <span>{optimisticLikes}</span>
              </Button>
            </SignInButton>
          )}

          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground gap-2 hover:text-blue-500"
            onClick={() => setShowComments((prev) => !prev)}
          >
            <MessageCircleIcon
              className={`${showComments ? "fill-blue-500 text-blue-500" : ""}`}
            />
            <span>{post.comments.length}</span>
          </Button>
        </div>

        {/* Comment Section */}
        {showComments && (
          <div className="space-y-4 pt-4 border-t">
            <div className="space-y-4">
              {/* DISPLAY COMMENTS */}
              {post.comments.map((comment) => (
                <div key={comment.id} className="flex space-x-3">
                  <Avatar className="size-8 flex-shrink-0">
                    <AvatarImage src={comment.author.image ?? "/avatar.png"} />
                  </Avatar>
                  <div className="min-w-0 w-full">
                    <div className="flex items-center justify-between flex-wrap gap-y-1 gap-x-6">
                      {/* Left side: Author name and timestamp */}
                      <div className="flex items-center flex-wrap gap-x-2 text-sm">
                        <span className="font-medium">
                          {comment.author.name}
                        </span>
                        <span className="text-muted-foreground">
                          <DotIcon />
                        </span>
                        <span className="text-muted-foreground">
                          {formatDistanceToNow(new Date(comment.createdAt))} ago
                        </span>
                      </div>

                      {/* Right side: Trash icon shown only to the comment's author */}
                      {comment.author.id === dbUserId && (
                        <TrashIcon
                          size={15}
                          className="text-gray-400 hover:text-red-500 cursor-pointer"
                          onClick={() => deleteComment(comment.id)}
                        />
                      )}
                    </div>

                    {/* Comment text */}
                    <p className="text-sm break-words mt-1">
                      {comment.content}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {user ? (
              <>
                <div className="flex space-x-3 relative">
                  <Avatar className="size-8 flex-shrink-0">
                    <AvatarImage src={user?.imageUrl || "/avatar.png"} />
                  </Avatar>

                  <div className="relative w-full">
                    <Textarea
                      placeholder="Write a comment..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      className="min-h-[80px] pr-10 resize-none"
                    />

                    {/* Emoji Button inside Textarea */}
                    {/* <button
                      type="button"
                      onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                      className="absolute bottom-2 right-3 text-gray-500 hover:text-white"
                    >
                      😊
                    </button> */}

                    {/* Emoji Picker Dropdown */}
                    {/* {showEmojiPicker && (
                      <div className="absolute bottom-14 right-0 z-50">
                        <Picker
                          data={data}
                          onEmojiSelect={addEmoji}
                          theme="dark"
                        />
                      </div>
                    )} */}
                  </div>

                  {/* Comment Button BELOW the Textarea */}
                </div>
                <div className="flex justify-end">
                  <Button
                    size="sm"
                    onClick={() => handleAddComment(post.id, newComment)}
                    disabled={!newComment.trim() || isCommenting}
                    className="flex items-center gap-2"
                  >
                    {isCommenting ? (
                      "Posting..."
                    ) : (
                      <>
                        <SendIcon className="size-4" />
                        Comment
                      </>
                    )}
                  </Button>
                </div>
              </>
            ) : (
              <div className="flex justify-center p-4 border rounded-lg bg-muted/50">
                <SignInButton mode="modal">
                  <Button variant="outline" className="gap-2">
                    <LogInIcon className="size-4" />
                    Sign in to comment
                  </Button>
                </SignInButton>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
