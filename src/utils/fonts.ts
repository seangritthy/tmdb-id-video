import { Poppins as FontPoppins, Saira as FontSaira, Battambang as FontBattambang } from "next/font/google";

export const Poppins = FontPoppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-poppins",
});

export const Battambang = FontBattambang({
  subsets: ["khmer"],
  weight: ["400", "700"],
  variable: "--font-battambang",
});

export const Saira = FontSaira({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-saira",
});
