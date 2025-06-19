import { NavItem } from "@/types/nav";
import Link from "next/link";

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