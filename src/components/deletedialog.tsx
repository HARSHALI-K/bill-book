"use client";

import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { ReactNode } from "react";

interface DeleteDialogProps {
  /** Trigger button or icon to open the dialog */
  trigger: ReactNode;
  /** Name of the item to show in confirmation text */
  itemName?: string;
  /** Function to run when user confirms delete */
  onConfirm: () => void | Promise<void>;
}

export function DeleteDialog({ trigger, itemName, onConfirm }: DeleteDialogProps) {
  return (
    <AlertDialog className="text-lg p-4">
      <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>
      <AlertDialogContent className="p-2">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-start text-xl">Confirmation</AlertDialogTitle>
          <AlertDialogDescription className="text-lg border-t pt-2 text-start p-2 text-foreground">
            This action cannot be undone. It will permanently delete{" "}
            {itemName && <span className="font-semibold">{itemName}</span>} from your list.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-row justify-end">
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className="bg-red-600 text-white hover:bg-red-700"
          >
            Yes, Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
