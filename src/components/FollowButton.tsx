"use client";

import { useState } from "react";
import { Button } from "./ui/button";
import { Loader2Icon } from "lucide-react";
import toast from "react-hot-toast";
import { toggleFollow } from "@/actions/user.action";

function FollowButton({ userId }: { userId: string }) {
  const [isLoading, setIsLoading] = useState(false);
  const [isFollowing, setisFollowing] = useState(false)

  const handleFollow = async () => {
    setIsLoading(true);
    setisFollowing(!isFollowing);

    try {
      await toggleFollow(userId);
      toast.success("Following user");
    } catch {
      toast.error("Error following user");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      size={"sm"}
      variant={"secondary"}
      onClick={handleFollow}
      disabled={isLoading}
      className="w-20"
    >
      {isLoading ? (
        <Loader2Icon className="animate-spin" />
      ) : isFollowing ? (
        "Following"
      ) : (
        "Follow"
      )}
     
    </Button>
  );
}
export default FollowButton;