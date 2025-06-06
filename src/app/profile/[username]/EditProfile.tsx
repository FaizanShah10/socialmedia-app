"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { updateUserProfile } from "@/actions/profile.action";
import toast from "react-hot-toast";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useRouter } from "next/navigation";
import UploadImage from "@/components/UploadImage";
import type { EditProfileProps } from "@/types";

const EditProfile = ({ open, setOpen, profileUser }: EditProfileProps) => {
  const [bio, setBio] = useState(profileUser?.bio || "");
  const [location, setLocation] = useState(profileUser?.location || "");
  const [websiteUrl, setWebsiteUrl] = useState(profileUser?.websiteUrl || "");
  const [image, setImage] = useState(profileUser?.image || "");
  const [isSaving, setIsSaving] = useState(false);

  const router = useRouter();

  const [editForm, setEditForm] = useState({
    name: profileUser.name || "",
    bio: profileUser.bio || "",
    location: profileUser.location || "",
    website: profileUser.websiteUrl || "",
  });

  const handleSave = async () => {
  try {
    setIsSaving(true);

    const formData = new FormData();
    formData.append("name", profileUser.name);
    formData.append("bio", bio);
    formData.append("location", location);
    formData.append("website", websiteUrl);

    await updateUserProfile(formData);

    toast.success("Profile updated successfully");
    setOpen(false);
    router.refresh();
  } catch {
    toast.error("Something went wrong");
  } finally {
    setIsSaving(false);
  }
};


  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[500px] overflow-y-auto max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Profile Picture</Label>
            <UploadImage endPoints="postImage" value={image} onChange={setImage} />
          </div>
          <div className="space-y-2">
            <Label>Name</Label>
            <Input
              name="name"
              value={editForm.name}
              onChange={(e) =>
                setEditForm({ ...editForm, name: e.target.value })
              }
              placeholder="Your name"
            />
          </div>
          <div className="space-y-2">
            <Label>Bio</Label>
            <Textarea
              placeholder="Bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Location</Label>
            <Input
              placeholder="Location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Website</Label>
            <Input
              placeholder="Website URL"
              value={websiteUrl}
              onChange={(e) => setWebsiteUrl(e.target.value)}
            />
          </div>
        </div>
        <div className="flex justify-end gap-3">
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button onClick={handleSave}>
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditProfile;
