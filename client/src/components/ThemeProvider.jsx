// Theme provider wrapper enabling dark/light mode using next-themes.

import { ThemeProvider as NextThemesProvider } from "next-themes";

/**
 * Provides theme state to the app.
 * @param {{children: import("react").ReactNode}} props
 */
const ThemeProvider = ({ children }) => {
  return (
    <NextThemesProvider attribute="class" defaultTheme="system" enableSystem>
      {children}
    </NextThemesProvider>
  );
};

export default ThemeProvider;
