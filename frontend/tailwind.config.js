/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        clinical: {
          primary: "#0f766e",     // Teal 700 - sobrio e confiavel
          primaryHover: "#0d9488",// Teal 600
          surface: "#f8fafc",     // Slate 50
          card: "#ffffff",
          border: "#e2e8f0",      // Slate 200
          textPrimary: "#0f172a", // Slate 900
          textMuted: "#64748b",   // Slate 500
        },
        odontogram: {
          higido: "#ffffff",
          higidoBorder: "#cbd5e1",
          carie: "#ef4444",       // Vermelho clinico
          carieLight: "#fee2e2",
          restaurado: "#3b82f6",  // Azul medico
          restauradoLight: "#dbeafe",
          canal: "#f59e0b",       // Ambar/Dourado (Endodontia)
          canalLight: "#fef3c7",
          ausente: "#64748b",     // Slate (Extraido/Ausente)
          implante: "#10b981",    // Verde Esmeralda
          implanteLight: "#d1fae5",
          protese: "#8b5cf6",     // Violeta
          selado: "#06b6d4",      // Ciano
          fratura: "#f97316",     // Laranja
        },
      },
    },
  },
  plugins: [],
};
