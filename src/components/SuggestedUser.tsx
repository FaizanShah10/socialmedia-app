import { getRandomSuggestedUsers } from '@/actions/user.action'
import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import Link from 'next/link'
import { Avatar } from './ui/avatar'
import { AvatarImage } from './ui/avatar'
import FollowButton from './FollowButton'

const SuggestedUser = async () => {

  const users = await getRandomSuggestedUsers();

  if (users?.length === 0) return null;

  if (!users) return <div className="text-center text-muted-foreground">No suggested users found</div>;
  if (users.length === 0) return <div className="text-center text-muted-foreground">No users to follow</div>;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Who to Follow</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {users.map((user) => (
            <div key={user.id} className="flex gap-2 items-center justify-between ">
              <div className="flex items-center gap-1">
                <Link href={`/profile/${user.userName}`}>
                  <Avatar>
                    <AvatarImage src={user.image ?? "/avatar.png"} />
                  </Avatar>
                </Link>
                <div className="text-xs">
                  <Link href={`/profile/${user.userName}`} className="font-medium cursor-pointer">
                    {user.name}
                  </Link>
                  <p className="text-muted-foreground">@{user.userName}</p>
                  <p className="text-muted-foreground">{user._count.followers} followers</p>
                </div>
              </div>
              <FollowButton userId={user.id} />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export default SuggestedUser