

import { auth, currentUser } from "@clerk/nextjs/server";
import React from "react";
import DesktopNavbar from "./DesktopNavbar";
import MobileNavbar from "./MobileNavbar";
import Link from "next/link";
import prisma from "@/lib/prisma";
import {syncUser} from "@/actions/user.action";

const Navbar = async () => {


  const user = await currentUser();
  if (user) await syncUser();

  //2 tasks
  //1. Check if the user is already present in db
  //2. Create new user with clerk data in db

  


  return (
    <nav className="sticky top-0 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="text-xl poppin-semibold">
              SOCIALGRAM
            </Link>
          </div>

          <div className="md:flex hidden">
            <DesktopNavbar />
          </div>

          <div className="md:hidden flex">
            <MobileNavbar />
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
