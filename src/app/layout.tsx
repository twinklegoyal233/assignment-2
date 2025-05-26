
import { ReactNode } from "react";
import "./global.css"
import Sidebar from "./components/Sidebar";
import { Work_Sans } from 'next/font/google'; // Import Work Sans
import AddCategoryModal from './components/AddCategoryModal';
// Configure the Work Sans font
const workSans = Work_Sans({
  subsets: ['latin'],
  display: 'swap',
  // You don't necessarily need 'variable' if you apply it directly to <body>
  // but it's a good practice to keep it for more granular control if needed.
  variable: '--font-work-sans',
});

export const metadata = {
  title: "Product Dashboard",
  description: "Assignment UI",
};

export default function RootLayout({ children }: { children: ReactNode }) {
   return (
    <html lang="en" className={`${workSans.variable}`}>
      <body className="flex h-screen bg-white text-black">
        <Sidebar />
        <AddCategoryModal />
        <div className="flex-1 overflow-auto p-6 pt-20 md:pt-6">
          {children}
        </div>
      </body>
    </html>
  );
}