import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        "rera-navy": {
          DEFAULT: "#0D2B45",
          50: "#E8EDF1",
          100: "#C7D4DE",
          200: "#9FB4C6",
          300: "#6F8DA8",
          400: "#456B8A",
          500: "#264E6E",
          600: "#1A3C57",
          700: "#0D2B45",
          800: "#091F33",
          900: "#061421",
          950: "#030A11",
        },
        "rera-lagoon": {
          DEFAULT: "#20B2C9",
          50: "#EAFAFC",
          100: "#CDF1F6",
          200: "#9BE3ED",
          300: "#69D5E4",
          400: "#3FC3D6",
          500: "#20B2C9",
          600: "#1A8FA3",
          700: "#156D7D",
          800: "#0F4C57",
          900: "#092D33",
        },
        "rera-emerald": {
          DEFAULT: "#4CC4A1",
          50: "#EBFBF6",
          100: "#CFF4E7",
          200: "#9FE9CF",
          300: "#70DDB8",
          400: "#4CC4A1",
          500: "#38A382",
          600: "#2B7E64",
          700: "#1F5C49",
          800: "#143B2F",
          900: "#0A1D17",
        },
        "rera-gold": {
          DEFAULT: "#F5CB6A",
          50: "#FEFBF2",
          100: "#FCF1D6",
          200: "#F9E3AD",
          300: "#F7D885",
          400: "#F5CB6A",
          500: "#EFB52F",
          600: "#CB9420",
          700: "#987019",
          800: "#654B10",
          900: "#332608",
        },
        "rera-mist": "#F2F6F8",
      },
      fontFamily: {
        heading: ["var(--font-poppins)", "system-ui", "sans-serif"],
        body: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      backgroundImage: {
        "rera-gradient": "linear-gradient(135deg, #0D2B45 0%, #156D7D 55%, #20B2C9 100%)",
        "rera-gold-gradient": "linear-gradient(135deg, #F5CB6A 0%, #EFB52F 100%)",
        "rera-aurora": "radial-gradient(60% 60% at 20% 20%, rgba(32,178,201,0.35) 0%, rgba(13,43,69,0) 60%), radial-gradient(50% 50% at 80% 30%, rgba(76,196,161,0.30) 0%, rgba(13,43,69,0) 60%), radial-gradient(60% 60% at 50% 90%, rgba(245,203,106,0.20) 0%, rgba(13,43,69,0) 60%)",
      },
      boxShadow: {
        premium: "0 20px 60px -15px rgba(13, 43, 69, 0.35)",
        "glow-gold": "0 0 40px -8px rgba(245, 203, 106, 0.55)",
        "glow-lagoon": "0 0 40px -8px rgba(32, 178, 201, 0.45)",
      },
      borderRadius: {
        xl2: "1.25rem",
      },
      animation: {
        "spin-slow": "spin 14s linear infinite",
        float: "float 6s ease-in-out infinite",
        "float-delayed": "float 7s ease-in-out 1.2s infinite",
        shimmer: "shimmer 2.5s linear infinite",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-14px)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
