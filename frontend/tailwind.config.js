/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        // --- Design system tokens (Apple-design-analysis) ---
        primary: {
          DEFAULT: "#0066cc",
          focus: "#0071e3",
          onDark: "#2997ff",
        },
        ink: {
          DEFAULT: "#1d1d1f",
          muted80: "#333333",
          muted48: "#7a7a7a",
        },
        divider: {
          soft: "#f0f0f0",
        },
        hairline: "#e0e0e0",
        canvas: {
          DEFAULT: "#ffffff",
          parchment: "#f5f5f7",
        },
        pearl: "#fafafc",
        tile: {
          1: "#272729",
          2: "#2a2a2c",
          3: "#252527",
        },
        void: "#000000",
        chip: "rgba(210, 210, 215, 0.64)",

        // --- Semantic status colors (not defined in the source design system;
        // added for HRMS states like attendance/leave status and form errors,
        // using Apple's own system-color palette to stay consistent) ---
        success: {
          DEFAULT: "#34c759",
          soft: "#e8f9ec",
        },
        danger: {
          DEFAULT: "#ff3b30",
          soft: "#ffefed",
        },
        warning: {
          DEFAULT: "#ff9500",
          soft: "#fff4e5",
        },
      },
      fontFamily: {
        display: ["'SF Pro Display'", "'Inter'", "system-ui", "-apple-system", "sans-serif"],
        text: ["'SF Pro Text'", "'Inter'", "system-ui", "-apple-system", "sans-serif"],
      },
      fontSize: {
        "hero-display": ["56px", { lineHeight: "1.07", letterSpacing: "-0.28px", fontWeight: "600" }],
        "display-lg": ["40px", { lineHeight: "1.10", letterSpacing: "0", fontWeight: "600" }],
        "display-md": ["34px", { lineHeight: "1.47", letterSpacing: "-0.374px", fontWeight: "600" }],
        lead: ["28px", { lineHeight: "1.14", letterSpacing: "0.196px", fontWeight: "400" }],
        "lead-airy": ["24px", { lineHeight: "1.5", letterSpacing: "0", fontWeight: "300" }],
        tagline: ["21px", { lineHeight: "1.19", letterSpacing: "0.231px", fontWeight: "600" }],
        "body-strong": ["17px", { lineHeight: "1.24", letterSpacing: "-0.374px", fontWeight: "600" }],
        body: ["17px", { lineHeight: "1.47", letterSpacing: "-0.374px", fontWeight: "400" }],
        "dense-link": ["17px", { lineHeight: "2.41", letterSpacing: "0", fontWeight: "400" }],
        caption: ["14px", { lineHeight: "1.43", letterSpacing: "-0.224px", fontWeight: "400" }],
        "caption-strong": ["14px", { lineHeight: "1.29", letterSpacing: "-0.224px", fontWeight: "600" }],
        "button-large": ["18px", { lineHeight: "1.0", letterSpacing: "0", fontWeight: "300" }],
        "button-utility": ["14px", { lineHeight: "1.29", letterSpacing: "-0.224px", fontWeight: "400" }],
        "fine-print": ["12px", { lineHeight: "1.0", letterSpacing: "-0.12px", fontWeight: "400" }],
        "micro-legal": ["10px", { lineHeight: "1.3", letterSpacing: "-0.08px", fontWeight: "400" }],
        "nav-link": ["12px", { lineHeight: "1.0", letterSpacing: "-0.12px", fontWeight: "400" }],
      },
      spacing: {
        xxs: "4px",
        xs: "8px",
        sm: "12px",
        md: "17px",
        lg: "24px",
        xl: "32px",
        xxl: "48px",
        section: "80px",
      },
      borderRadius: {
        none: "0px",
        xs: "5px",
        sm: "8px",
        md: "11px",
        lg: "18px",
        pill: "9999px",
      },
      boxShadow: {
        // The single system shadow, reserved for product-style imagery
        // (used sparingly in the app: e.g. an avatar/photo resting on a card).
        product: "3px 5px 30px 0 rgba(0, 0, 0, 0.22)",
      },
      transitionProperty: {
        press: "transform",
      },
    },
  },
  plugins: [],
};
