"use client";

import { useEffect, useState } from "react";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { SignInButton } from "@clerk/nextjs";
import { CalendarIcon, Edit, LinkIcon, MapPinIcon } from "lucide-react";
import { format } from "date-fns";
import EditProfile from "./EditProfile";
import toast from "react-hot-toast";
import { getUserPosts } from "@/actions/profile.action";
import PostCard from "@/components/PostCard";
import FollowButton from "@/components/FollowButton";

type Post = {
  id: string;
  author: {
    id: string;
    image: string | null;
    userName: string;
    name: string;
  };
  comments: Array<{
    id: string;
    createdAt: Date;
    authorId: string;
    content: string;
    postId: string;
    author: {
      id: string;
      image: string | null;
      userName: string;
      name: string;
    };
  }>;
  likes: Array<any>;
  _count: {
    [key: string]: number;
  };
  // Add any other fields returned by getUserPosts if necessary
};

const ClientProfilePage = ({ currentUser, profileUser }: any) => {
  const [open, setOpen] = useState(false);
  const [posts, setPosts] = useState<Post[]>([]);

  const isOwnProfile = currentUser?.id === profileUser?.id;
  const formattedDate = format(new Date(profileUser?.createdAt), "MMMM yyyy");

  useEffect(() => {
  const fetchPosts = async () => {
    try {
      const post = await getUserPosts(profileUser.id);
      setPosts(post);
    } catch {
      toast.error("Error Fetching Posts");
    }
  };

  if (profileUser?.id) {
    fetchPosts();
  }
}, [profileUser?.id]);


 

  return (
    <div className="w-full max-w-4xl mx-auto">
      <Card className="bg-card">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row sm:items-start sm:gap-12">
            {/* Left - Avatar */}
            <div className="flex justify-center sm:block">
              <Avatar className="w-36 h-36">
                <AvatarImage src={profileUser?.image ?? "/avatar.png"} />
              </Avatar>
            </div>

            {/* Right - Info */}
            <div className="flex-1 flex flex-col items-center sm:items-start mt-4 sm:mt-0">
              {/* Stats */}
              <div className="flex justify-center sm:justify-start items-center md:gap-12 gap-2 mb-4">
                {["followers", "following", "posts"].map((key, idx) => (
                  <div key={key} className="flex items-center">
                    <div className="text-center">
                      <div className="font-semibold">
                        {profileUser._count[key].toLocaleString()}
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
                  {profileUser?.name ?? profileUser?.userName}
                </h1>
                <p className="text-muted-foreground">
                  @{profileUser?.userName}
                </p>
                {profileUser?.bio && (
                  <p className="mt-1 text-sm">{profileUser.bio}</p>
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
                      profileUser={profileUser}
                    />
                  </>
                ) : (
                  <FollowButton userId={currentUser?.id}/>
                )}
              </div>

              {/* Details */}
              <div className="w-full mt-6 space-y-2 text-sm text-muted-foreground">
                {profileUser?.location && (
                  <div className="flex items-center">
                    <MapPinIcon className="size-4 mr-2" />
                    {profileUser.location}
                  </div>
                )}
                {profileUser?.websiteUrl && (
                  <div className="flex items-center">
                    <LinkIcon className="size-4 mr-2" />
                    <a
                      href={
                        profileUser.websiteUrl.startsWith("http")
                          ? profileUser.websiteUrl
                          : `https://${profileUser.websiteUrl}`
                      }
                      className="hover:underline"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {profileUser.websiteUrl}
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

          {/* Tabs Section */}
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
                        dbUserId={currentUser.id}
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
        </CardContent>
      </Card>
    </div>
  );
};

export default ClientProfilePage;
