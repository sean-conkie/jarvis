"use client";

import { PropsWithChildren } from "react";
import { useTheme } from "./ThemeProvider";

const Theme = ({ children }: PropsWithChildren) => {
  const { theme } = useTheme();

  return (
    <main className="p-2 h-full bg-base-200" data-theme={theme}>
      {children}
    </main>
  );
};

export default Theme;
