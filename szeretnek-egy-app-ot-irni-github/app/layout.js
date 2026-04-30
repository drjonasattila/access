import "./globals.css";

export const metadata = {
  title: "Avicenna Clinical Engine",
  description: "Wellness protocol generator built from the Avicenna rule engine."
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
