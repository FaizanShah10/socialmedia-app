"use client";

import { UploadButton } from "@/utils/uploadthing";
import { XIcon } from "lucide-react";
import { useUser } from "@clerk/nextjs";
import { useEffect } from "react";
import toast from "react-hot-toast";
import Image from "next/image";
import type { UploadThingResponse } from "@/types";

interface UploadImageProps {
  onChange: (url: string) => void;
  endPoints: "postImage"; // or extend if more endpoints are added
  value: string;
}

export default function UploadImage({
  onChange,
  endPoints,
  value,
}: UploadImageProps) {
  const { isSignedIn } = useUser();

  useEffect(() => {
    if (!isSignedIn) {
      toast.error("You need to sign in first.");
    }
  }, [isSignedIn]);

  if (!isSignedIn) {
    return (
      <div className="text-center text-red-500 font-medium p-4">
        You need to sign in first.
      </div>
    );
  }

  if (value) {
    return (
      <div className="relative w-full max-w-xs mx-auto">
        <Image
          src={value}
          alt="Upload"
          className="rounded-md w-40 h-40 object-cover"
          width={160}
          height={160}
        />
        <button
          onClick={() => onChange("")}
          className="absolute top-1 right-1 p-1 bg-red-500 rounded-full shadow-sm"
          type="button"
        >
          <XIcon className="h-4 w-4 text-white" />
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center px-4 py-6 w-full">
      <UploadButton
        endpoint={endPoints}
        onClientUploadComplete={(res: UploadThingResponse[] | undefined) => {
          if (res?.[0]?.url) {
            onChange(res[0].url);
          }
        }}
        onUploadError={(error: Error) => {
          toast.error(`Upload failed: ${error.message}`);
        }}
      />
    </div>
  );
}
