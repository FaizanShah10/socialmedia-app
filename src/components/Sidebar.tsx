import { Avatar, AvatarImage } from "@radix-ui/react-avatar";
import { LinkIcon, LocationEdit, MapPin } from "lucide-react";
import React from "react";
import { AvatarFallback } from "./ui/avatar";
import { auth, currentUser } from "@clerk/nextjs/server";
import { getUserByClerkId } from "@/actions/user.action";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { SignInButton, SignUpButton } from "@clerk/nextjs";
import { Button } from "./ui/button";
import Link from "next/link";

const Sidebar = async () => {
  const authUser = await currentUser();

  if(!authUser) return <UnAuthenticatedSidebar />

  if (!authUser) {
    return null;
  }
  const user = await getUserByClerkId(authUser.id);
  // console.log("Current user from clerk: ", user)

  return (
    <div className="border-[1px] border-white rounded-xl px-4 py-6">
      <Link href={`/profile/${user?.userName}`}>
        <div className="flex flex-col items-center justify-center gap-4">
        <div className="w-12 h-12 bg-white rounded-full overflow-hidden">
          <Avatar>
            <AvatarImage src={user?.image ?? undefined} alt="Image" />
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>
        </div>
        <h3 className="neue-medium">{user?.name}</h3>
        <p className="neue-light text-sm">{user?.userName}</p>
        <p className="text-zinc-400 neue-roman">{user?.bio || "No Bio To Show"}</p>
      </div>
      </Link>
      <hr className="mt-6" />
      <div className="flex flex-row items-center justify-between mt-4 px-8">
        <div className="flex flex-col items-center ">
          <p>{user?._count.following}</p>
          <p className="text-sm neue-light">Following</p>
        </div>
        <div className="flex flex-col items-center ">
          <p>{user?._count.followers}</p>
          <p className="text-sm neue-light">Followers</p>
        </div>
      </div>
      <hr className="mt-6" />
      <div className="mt-4 flex flex-col gap-2 px-3">
        <div className="flex items-center justify-start gap-4">
          <MapPin className="w-4 h-4" />
          <p className="text-sm neue-light">{user?.location || "Location Not Found"}</p>
        </div>
        <div className="flex items-center justify-start gap-4">
          <LinkIcon className="w-4 h-4" />
          <p className="text-sm neue-light">{user?.websiteUrl || "No Website Added"}</p>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;

const UnAuthenticatedSidebar = () => (
  <div className="sticky top-20">
    <Card>
      <CardHeader>
        <CardTitle className="text-center text-xl neue-medium">Welcome Back!</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-center text-muted-foreground mb-4 text-sm neue-light">
          Sign in to view your profile and connect with the community.
        </p>
        <SignInButton mode="modal">
          <Button className="w-full" variant="outline">
            Login
          </Button>
        </SignInButton>
        <SignUpButton mode="modal">
          <Button className="w-full mt-2" variant="default">
            Sign Up
          </Button>
        </SignUpButton>
      </CardContent>
    </Card>
  </div>
);