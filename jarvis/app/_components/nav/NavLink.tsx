import { NavItem } from "@/types/nav";
import Link from "next/link";

/**
 * Renders a navigation link with an optional active state and icon.
 *
 * @param active - Indicates whether the navigation link is currently active.
 * @param href - The URL to navigate to when the link is clicked.
 * @param icon - The icon element to display inside the navigation link.
 * @returns A styled navigation link component.
 */
const NavLink = ({ active, href, icon }: NavItem) => {
  return (
    <Link
      href={href}
      className={"nav-item nav-link" + (active ? " nav-link-active" : "")}
    >
      <div className="flex-section">
        {icon}
      </div>
    </Link>
  );
};

export default NavLink;