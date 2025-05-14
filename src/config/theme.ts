import type { ThemeConfig } from "antd";

export const miaTheme: ThemeConfig = {
  token: {
    colorPrimary: "#2F54EB",
    borderRadius: 6,
    fontFamily: "var(--font-inter)",
  },
  components: {
    Typography: {
      fontFamily: "var(--font-poppins)",
    },
  },
};