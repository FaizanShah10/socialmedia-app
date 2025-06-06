import {
  getProfileByUsername,
  getUserPosts,
  isFollowing,
} from "@/actions/profile.action";
import { notFound } from "next/navigation";
import ClientProfilePage from "./ClientProfilePage";


export async function generateMetadata({ params }: { params: { username: string } }) {
  const user = await getProfileByUsername(params.username);
  if (!user) return;

  return {
    title: `${user.name ?? user.userName}`,
    description: user.bio || `Check out ${user.userName}'s profile.`,
  };
}

async function ProfilePageServer({ params }: { params: { username: string } }) {
  const user = await getProfileByUsername(params.username);

  if (!user) notFound();

  const [posts, isCurrentUserFollowing] = await Promise.all([
    getUserPosts(user.id),
    isFollowing(user.id),
  ]);

  return (
    <ClientProfilePage
      user={user}
      posts={posts}
      isFollowing={isCurrentUserFollowing}
    />
  );
}
export default ProfilePageServer;