module.exports = {
    content: ["./src/**/*.{js,jsx,ts,tsx}"],
    theme: {
        extend: {
            colors: {
                primary: "#007bff", // Match Figma's primary color
                secondary: "#6c757d", // Match secondary color
                accent: "#ffcc00", // Example accent color
                background: "#f8f9fa" // Page background
            },
            fontFamily: {
                lato: ["Lato", "sans-serif"]
            },
            spacing: {
                128: "32rem"
            },
            boxShadow: {
                button: "0px 4px 4px rgba(5, 69, 83, 0.24)" // Shadow for buttons
            },
            borderRadius: {
                button: "8px" // Default button radius
            }
        }
    },
    plugins: []
};
