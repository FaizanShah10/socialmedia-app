// app/profile/[username]/page.tsx

import { getCurrentUser } from "@/actions/user.action";
import { getProfileByUsername } from "@/actions/profile.action";
import ClientProfilePage from "./ClientProfilePage";

type PageProps = {
  params: { username: string };
};

const ProfilePage = async ({ params }: PageProps) => {
  const currentUser = await getCurrentUser();
  const profileUser = await getProfileByUsername(params.username);

  if (!profileUser) {
    return <div className="text-center mt-10">User not found</div>;
  }

  return (
    <ClientProfilePage currentUser={currentUser} profileUser={profileUser} />
  );
};

export default ProfilePage;
