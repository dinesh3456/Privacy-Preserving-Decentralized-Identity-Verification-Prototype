// src/web/components/Alert.tsx
import React from "react";
import { Dialog, Transition } from "@headlessui/react";
import { Fragment } from "react";

interface AlertProps {
  children: React.ReactNode;
  className?: string;
}

interface AlertDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}

interface AlertDialogActionProps extends AlertProps {
  onClick?: () => void;
  disabled?: boolean;
}

// Basic Alert Components
export const Alert = ({ children, className = "" }: AlertProps) => {
  return (
    <div
      className={`p-4 rounded-md bg-yellow-50 border border-yellow-200 ${className}`}
    >
      {children}
    </div>
  );
};

export const AlertTitle = ({ children, className = "" }: AlertProps) => {
  return (
    <h4 className={`font-medium text-yellow-800 ${className}`}>{children}</h4>
  );
};

export const AlertDescription = ({ children, className = "" }: AlertProps) => {
  return (
    <p className={`mt-1 text-sm text-yellow-700 ${className}`}>{children}</p>
  );
};

// Alert Dialog Components
export const AlertDialog = ({
  open,
  onOpenChange,
  children,
}: AlertDialogProps) => {
  return (
    <Transition appear show={open} as={Fragment}>
      <Dialog
        as="div"
        className="relative z-50"
        onClose={() => onOpenChange?.(false)}
      >
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>
        {children}
      </Dialog>
    </Transition>
  );
};

export const AlertDialogContent = ({
  children,
  className = "",
}: AlertProps) => {
  return (
    <div className="fixed inset-0 overflow-y-auto">
      <div className="flex min-h-full items-center justify-center p-4 text-center">
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0 scale-95"
          enterTo="opacity-100 scale-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100 scale-100"
          leaveTo="opacity-0 scale-95"
        >
          <Dialog.Panel
            className={`w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all ${className}`}
          >
            {children}
          </Dialog.Panel>
        </Transition.Child>
      </div>
    </div>
  );
};

export const AlertDialogHeader = ({ children, className = "" }: AlertProps) => {
  return <div className={`mb-4 ${className}`}>{children}</div>;
};

export const AlertDialogTitle = ({ children, className = "" }: AlertProps) => {
  return (
    <Dialog.Title
      as="h3"
      className={`text-lg font-medium leading-6 text-gray-900 ${className}`}
    >
      {children}
    </Dialog.Title>
  );
};

export const AlertDialogDescription = ({
  children,
  className = "",
}: AlertProps) => {
  return (
    <p className={`mt-2 text-sm text-gray-500 ${className}`}>{children}</p>
  );
};

export const AlertDialogFooter = ({ children, className = "" }: AlertProps) => {
  return (
    <div className={`mt-4 flex justify-end space-x-2 ${className}`}>
      {children}
    </div>
  );
};

export const AlertDialogAction = ({
  children,
  onClick,
  className = "",
  disabled = false,
}: AlertDialogActionProps) => {
  return (
    <button
      type="button"
      className={`inline-flex justify-center rounded-md px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
};

export const AlertDialogCancel = ({
  children,
  onClick,
  className = "",
  disabled = false,
}: AlertDialogActionProps) => {
  return (
    <button
      type="button"
      className={`inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-500 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
};
