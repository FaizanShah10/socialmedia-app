// src/types/index.ts

import { Prisma } from "@prisma/client";

export type PostWithDetails = Prisma.PostsGetPayload<{
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

export type UserProfileWithCounts = Prisma.UserGetPayload<{
  select: {
    id: true;
    userName: true;
    name: true;
    bio: true;
    image: true;
    location: true;
    websiteUrl: true;
    createdAt: true;
    _count: {
      select: {
        followers: true;
        following: true;
        posts: true;
      };
    };
  };
}>;


// suggested user
export type SuggestedUser = Prisma.UserGetPayload<{
  select: {
    id: true;
    userName: true;
    name: true;
    image: true;
    _count: {
      select: {
        followers: true;
      };
    };
  };
}>;

// src/types/index.ts

export interface EditProfileUser {
  id: string;
  name: string;
  bio?: string | null;
  image?: string | null;
  location?: string | null;
  websiteUrl?: string | null;
}

export interface EditProfileProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  profileUser: EditProfileUser;
}

export interface PostCardProps {
  post: PostWithDetails;
  dbUserId?: string | null;
}


// Upload thing
export interface UploadThingResponse {
  name: string;
  size: number;
  key: string;
  url: string;
}

