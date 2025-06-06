"use client";

import { getProfileByUsername, getUserPosts, updateUserProfile } from "@/actions/profile.action";
import { toggleFollow } from "@/actions/user.action";
import PostCard from "@/components/PostCard";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { SignInButton, useUser } from "@clerk/nextjs";
import { format } from "date-fns";
import {
  CalendarIcon,
  Edit,
  LinkIcon,
  MapPinIcon,
} from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import EditProfile from "./EditProfile";
import FollowButton from "@/components/FollowButton";

type User = Awaited<ReturnType<typeof getProfileByUsername>>;
type Posts = Awaited<ReturnType<typeof getUserPosts>>;

interface ProfilePageClientProps {
  user: NonNullable<User>;
  posts: Posts;
  isFollowing: boolean;
}

function ProfilePageClient({
  isFollowing: initialIsFollowing,
  posts,
  user,
}: ProfilePageClientProps) {
  const { user: currentUser } = useUser();
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const [open, setOpen] = useState(false);
  const [isUpdatingFollow, setIsUpdatingFollow] = useState(false);

  const [editForm, setEditForm] = useState({
    name: user.name || "",
    bio: user.bio || "",
    location: user.location || "",
    website: user.websiteUrl || "",
  });

  const handleEditSubmit = async () => {
    const formData = new FormData();
    Object.entries(editForm).forEach(([key, value]) => {
      formData.append(key, value);
    });

    const result = await updateUserProfile(formData);
    if (result.success) {
      setShowEditDialog(false);
      toast.success("Profile updated successfully");
    }
  };



  const handleFollow = async () => {
    if (!currentUser) return;

    try {
      setIsUpdatingFollow(true);
      await toggleFollow(user.id);
      setIsFollowing(!isFollowing);
    } catch {
      toast.error("Failed to update follow status");
    } finally {
      setIsUpdatingFollow(false);
    }
  };

  const isOwnProfile =
    currentUser?.username === user.userName ||
    currentUser?.emailAddresses[0].emailAddress.split("@")[0] === user.userName;

  const formattedDate = format(new Date(user.createdAt), "MMMM yyyy");

  return (
    <div className="max-w-3xl mx-auto">
      <div className="grid grid-cols-1 gap-6">
        <div className="w-full max-w-lg mx-auto">
          <Card className="bg-card">
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row sm:items-start sm:gap-12">
            {/* Left - Avatar */}
            <div className="flex justify-center sm:block">
              <Avatar className="w-36 h-36">
                <AvatarImage src={user?.image ?? "/avatar.png"} />
              </Avatar>
            </div>

            {/* Right - Info */}
            <div className="flex-1 flex flex-col items-center sm:items-start mt-4 sm:mt-0">
              {/* Stats */}
              <div className="flex justify-center sm:justify-start items-center md:gap-12 gap-2 mb-4">
                {(["followers", "following", "posts"] as const).map((key, idx) => (
                  <div key={key} className="flex items-center">
                    <div className="text-center">
                      <div className="font-semibold">
                        {user._count[key].toLocaleString()}
                      </div>
                      <div className="text-sm text-muted-foreground capitalize">
                        {key}
                      </div>
                    </div>
                    {idx < 2 && (
                      <Separator
                        orientation="vertical"
                        className="md:mx-10 mx-6 h-6"
                      />
                    )}
                  </div>
                ))}
              </div>

              {/* Name & Username & Bio */}
              <div className="text-center sm:text-left">
                <h1 className="text-xl font-bold">
                  {user?.name ?? user?.userName}
                </h1>
                <p className="text-muted-foreground">
                  @{user?.userName}
                </p>
                {user?.bio && (
                  <p className="mt-1 text-sm">{user.bio}</p>
                )}
              </div>

              {/* Button */}
              <div className="w-full sm:w-auto mt-4">
                {!currentUser ? (
                  <SignInButton mode="modal">
                    <Button className="w-full">Sign In to Follow</Button>
                  </SignInButton>
                ) : isOwnProfile ? (
                  <>
                    <Button
                      onClick={() => setOpen(true)}
                      className="w-full sm:w-auto"
                    >
                      <Edit size={16} className="mr-2" /> Edit Profile
                    </Button>
                    <EditProfile
                      open={open}
                      setOpen={setOpen}
                      profileUser={user}
                    />
                  </>
                ) : (
                  <FollowButton userId={currentUser?.id}/>
                )}
              </div>

              {/* Details */}
              <div className="w-full mt-6 space-y-2 text-sm text-muted-foreground">
                {user?.location && (
                  <div className="flex items-center">
                    <MapPinIcon className="size-4 mr-2" />
                    {user.location}
                  </div>
                )}
                {user?.websiteUrl && (
                  <div className="flex items-center">
                    <LinkIcon className="size-4 mr-2" />
                    <a
                      href={
                        user.websiteUrl.startsWith("http")
                          ? user.websiteUrl
                          : `https://${user.websiteUrl}`
                      }
                      className="hover:underline"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {user.websiteUrl}
                    </a>
                  </div>
                )}
                <div className="flex items-center">
                  <CalendarIcon className="size-4 mr-2" />
                  Joined {formattedDate}
                </div>
              </div>
            </div>
          </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-6">
            <Tabs defaultValue="posts" className="w-full">
              <TabsList className="w-full justify-around">
                <TabsTrigger value="posts" className="w-full text-center">
                  Posts
                </TabsTrigger>
                <TabsTrigger value="saved" className="w-full text-center">
                  Saved
                </TabsTrigger>
              </TabsList>
              <Separator className="mt-2" />
              <TabsContent value="posts" className="">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4">
                  {posts.length > 0 ? (
                    posts.map((post) => (
                      <PostCard
                        key={post.id}
                        post={post}
                        dbUserId={currentUser?.id}
                         // Optional: if you're on the profile page
                      />
                    ))
                  ) : (
                    <div className="col-span-full text-center py-8 text-muted-foreground">
                      No posts yet
                    </div>
                  )}
                </div>
              </TabsContent>
              <TabsContent value="saved" className="mt-4 text-center">
                Saved posts will be shown here.
              </TabsContent>
            </Tabs>
          </div>

        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Edit Profile</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Name</Label>
                <Input
                  name="name"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  placeholder="Your name"
                />
              </div>
              <div className="space-y-2">
                <Label>Bio</Label>
                <Textarea
                  name="bio"
                  value={editForm.bio}
                  onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                  className="min-h-[100px]"
                  placeholder="Tell us about yourself"
                />
              </div>
              <div className="space-y-2">
                <Label>Location</Label>
                <Input
                  name="location"
                  value={editForm.location}
                  onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                  placeholder="Where are you based?"
                />
              </div>
              <div className="space-y-2">
                <Label>Website</Label>
                <Input
                  name="website"
                  value={editForm.website}
                  onChange={(e) => setEditForm({ ...editForm, website: e.target.value })}
                  placeholder="Your personal website"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
              <Button onClick={handleEditSubmit}>Save Changes</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
export default ProfilePageClient;