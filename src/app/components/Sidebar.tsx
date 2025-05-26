
"use client"; 

import Image from "next/image";
import { useState } from "react";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import { usePathname } from "next/navigation"; 

const menu = [
  "Home",
  "Stores",
  "Products",
  "Catalogue",
  "Promotions",
  "Reports",
  "Docs",
  "Settings",
];

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname(); 

  const toggleSidebar = () => setIsOpen(!isOpen);

  return (
    <>
      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 flex items-center justify-between p-4 bg-white shadow">
        <Image src="/Logo.png" alt="Logo" width={100} height={40} />
        <button onClick={toggleSidebar}>
          {isOpen ? (
            <XMarkIcon className="h-6 w-6" />
          ) : (
            <Bars3Icon className="h-6 w-6" />
          )}
        </button>
      </div>

      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full  bg-white z-40 transform transition-transform duration-200 md:static md:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } flex flex-col justify-between border-r p-6`}
      >
        <div>
          {/* Desktop logo */}
          <div className="hidden md:block mb-6 pb-3">
            <Image src="/Logo.png" alt="Logo" width={116} height={48} />
          </div>

          <ul className="space-y-2 border-t pt-4">
            {menu.map((item, index) => {
           
              const isActive =
                item === "Products" && pathname === "/products";

              return (
                <li key={index}>
                  {item === "Products" ? (
                    <Link href="/products">
                      <span
                        className={`block py-2 px-3 rounded-lg hover:bg-[#ECF7FF] text-[#1F8CD0] text-[14px] font-medium ${
                          isActive ? "bg-[#ECF7FF] font-bold" : ""
                        }`}
                      >
                        <div className="flex gap-3">
                          <Image  src="/rect.png" alt="rectangle" width={20} height={20}/>
                          
                        {item}
                        </div>
              
                      </span>
                    </Link>
                  ) : (
                    <span className="block p-2 rounded-lg hover:bg-[#ECF7FF] cursor-default text-black">
                      <div className="flex gap-3">
                          <Image  src="/rect.svg" alt="rectangle" width={20} height={20}/>
                        {item}
                        </div>
                    </span>
                  )}
                </li>
              );
            })}
          </ul>
        </div>

        <div className="flex items-center gap-2 py-4 px-0 border-t">
          <Image
            src="/andy.svg"
            alt="Andy Samberg"
            width={48}
            height={48}
            className="w-10 h-10 rounded-full"
          />
          <div className="flex gap-4">
            <div >
            <p className="text-sm">Andy Samberg</p>
            <p className="text-sm text-[#8C8C8C]">andy.samberg@gmail.com</p>        
            </div>
            <Image src="Chevron-right.svg" alt="right" width={20} height={20}/>
          </div>

        </div>
      </div>

      {isOpen && (
        <div
          className="fixed inset-0 bg-black opacity-25 z-30 md:hidden"
          onClick={toggleSidebar}
        />
      )}
    </>
  );
}