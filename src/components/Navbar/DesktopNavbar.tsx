import React from 'react'
import { Button } from "../ui/button";
import {
  BellIcon,
  HomeIcon,
  UserIcon,
} from "lucide-react";
import {
  SignInButton,
  UserButton,
} from "@clerk/nextjs";
import Link from "next/link";
import { currentUser } from "@clerk/nextjs/server";
import ModeToggle from "../ModeToggle";
import { getUserByClerkId } from '@/actions/user.action';



const DesktopNavbar = async () => {
    const authUser = await currentUser();

    
      if (!authUser) {
        return null;
      }
      const user = await getUserByClerkId(authUser.id);
    // console.log(user)
  return (
    <div>
        <div className="flex items-center gap-3 poppin-regular">
          <ModeToggle/>
          {user ? (
            <>
              <Button className='hover:bg-[#7AE2CF] hover:text-black' variant={"outline"}>
                <Link className="flex items-center gap-2 " href="/">
                  <HomeIcon className="w-4 h-4" />
                  <span className="hidden lg:inline">Home</span>
                </Link>
              </Button>
              <Button className='hover:bg-[#7AE2CF] hover:text-black' variant={"outline"}>
                <Link className="flex items-center gap-2" href="/notifications">
                  <BellIcon className="w-4 h-4" />
                  <span className="hidden lg:inline">Notifications</span>
                </Link>
              </Button>
              <Button className='hover:bg-[#7AE2CF] hover:text-black'   variant={"outline"}>
                <Link className="flex items-center gap-2" href={`/profile/${user?.userName}`}>
                  <UserIcon className="w-4 h-4" />
                  <span className="hidden lg:inline">Profile</span>
                </Link>
              </Button>
              <UserButton/>
            </>
          ) : (
            <SignInButton mode="modal">
              <Button variant="default">Sign In</Button>
            </SignInButton>
          )}
        </div>
    </div>
  )
}

export default DesktopNavbar