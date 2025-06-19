"use client";

import { useNavigation } from "@/hooks/useNavigation";
import { PropsWithChildren } from "react";
import NavLink from "./NavLink";

/**
 * NavBar component renders a navigation drawer with a list of navigation paths and their icons.
 *
 * @param children - The content to be displayed inside the main drawer area.
 *
 * The navigation paths are retrieved using the `useNavigation` hook, and each path is rendered as a list item
 * with its associated icon. The currently active path is highlighted.
 */
const NavBar = ({ children }: PropsWithChildren) => {
  const paths = useNavigation();
  return (
    <div className="grid grid-cols-1 md:grid-cols-[auto_1fr] h-full w-full gap-2">
      <div className="p-2 bg-base-300 rounded-md">
        <ul className="menu min-h-full gap-2 text-3xl">
          {paths.map((path, index) => (
            <NavLink key={index} {...path} />
          ))}
        </ul>
      </div>
      {children}
    </div>
  );
};

export default NavBar;
