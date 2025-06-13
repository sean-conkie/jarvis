"use client";
import { BaseTool } from "@/utils/toolUtils";
import React, { createContext, useContext, useState } from "react";

interface ThemeContextValue {
  theme: string;
  themeTool: BaseTool<ThemeArgs, ThemeResult>;
}

export interface ThemeArgs {
  theme: string;
}
export class ThemeResult {}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  // manage the theme state
  const [theme, setTheme] = useState<string>("light");

  // memoize theme value to prevent unnecessary re-renders
  const themeValue = React.useMemo(() => ({ theme }), [theme]);

  // theme tool
  class ThemeTool extends BaseTool<ThemeArgs, ThemeResult> {
    name = "setTheme";
    description =
      "Set the theme for the application. Available themes: light, dark, cupcake.";
    parameters = {
      type: "object" as const,
      properties: {
        theme: {
          type: "string" as const,
          description: "The theme to set for the application",
          enum: ["light", "dark", "cupcake"],
        },
      },
      required: ["theme"] as const,
    };

    async invoke({ theme }: ThemeArgs): Promise<ThemeResult> {
      setTheme(theme);
      return {"theme": theme} as ThemeResult;
    }
  }

  const themeTool = new ThemeTool();

  return (
    <ThemeContext.Provider value={{ ...themeValue, themeTool }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextValue => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
