"use client";
import { Dialog, Transition } from "@headlessui/react";
import { Fragment, useState } from "react";
import { useModalStore } from "../store/modalstore";
import { useProductStore } from "../../app/store/productStore";

export default function AddCategoryModal() {
  const isOpen = useModalStore((state) => state.isAddCategoryOpen);
  const setOpen = useModalStore((state) => state.closeAddCategory);

  const [name, setName] = useState("");
  const addCategory = useProductStore((state) => state.addCategory);

  const handleAdd = () => {
    if (name.trim()) {
      addCategory(name.trim());
      setName("");
      setOpen();
    }
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" onClose={setOpen} className="fixed inset-0 z-50">
        <div className="fixed inset-0 bg-black bg-opacity-60" />

        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="bg-white p-4 rounded-lg shadow-md w-full max-w-md">
            <Dialog.Title className="text-2xl font-semibold mb-4">Add category</Dialog.Title>
            <span className="text-sm font-normal">Category name *</span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="border p-1 w-full mt-0.5 rounded-md"
              placeholder="Category name"
            />
            <div className="mt-4 flex justify-end gap-2">
              <button className="bg-[#E1E7EB] px-8 py-2 rounded-md text-[#1F8CD0]" onClick={setOpen}>Cancel</button>
              <button className="bg-[#1F8CD0] text-white px-8 py-2 rounded-md" onClick={handleAdd}>
                Save
              </button>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>
    </Transition>
  );
}
