// app/profile/[username]/page.tsx

import { getProfileByUsername, getUserPosts } from "@/actions/profile.action";
import { notFound } from "next/navigation";
import ClientProfiePage from "./ClientProfilePage";
import type { Metadata } from "next";

type PageProps = {
  params: {
    username: string;
  };
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const user = await getProfileByUsername(params.username);
  if (!user) return {};

  return {
    title: `${user.name ?? user.userName}`,
    description: user.bio || `Check out ${user.userName}'s profile.`,
  };
}

export default async function ProfilePage({ params }: PageProps) {
  const user = await getProfileByUsername(params.username);
  if (!user) notFound();

  const posts = await getUserPosts(user.id);

  return <ClientProfiePage user={user} posts={posts} />;
}