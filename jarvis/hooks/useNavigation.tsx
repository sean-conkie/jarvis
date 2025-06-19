import { NavItem } from "@/types/nav";
import { Bot, MessageCircle } from "lucide-react";
import { usePathname } from "next/navigation";
import { useMemo } from "react";

export const useNavigation = () => {
  const pathname = usePathname();
  const paths: NavItem[] = useMemo(() => {
    const paths: NavItem[] = [
      {
        name: "Chat",
        href: "/",
        icon: <MessageCircle className="text-icon" />,
        active: pathname !== "/agents",
      },
      {
        name: "Agents",
        href: "/agents",
        icon: <Bot className="text-icon" />,
        active: pathname.startsWith("/agents"),
      },
    ];

    return paths;
  }, [pathname]);

  return paths;
};
