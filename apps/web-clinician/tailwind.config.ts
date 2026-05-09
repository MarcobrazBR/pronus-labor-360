import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}", "../../packages/ui/src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        pronus: {
          primary: "#457B9D",
          action: "#A8DADC",
          background: "#F1F4F8",
          text: "#1D3557",
        },
      },
    },
  },
  plugins: [],
};

export default config;
