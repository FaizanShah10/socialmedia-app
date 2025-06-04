import { currentUser } from "@clerk/nextjs/server";
import React from "react";
import DesktopNavbar from "./DesktopNavbar";
import MobileNavbar from "./MobileNavbar";
import Link from "next/link";
import { syncUser, getUserByClerkId } from "@/actions/user.action";

const Navbar = async () => {
  const user = await currentUser();

  let dbUser = null;
  if (user) {
    // Sync user to DB if needed
    await syncUser();

    // Get PostgreSQL user details (with userName)
    dbUser = await getUserByClerkId(user.id);
  }

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
            {/* Pass dbUser as prop to MobileNavbar */}
            <MobileNavbar dbUser={dbUser} />
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
