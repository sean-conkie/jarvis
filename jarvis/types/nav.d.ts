import { JSX } from "react";


export type NavItem = {
  name: string;
  href: string;
  icon: JSX.Element;
  active: boolean;
}