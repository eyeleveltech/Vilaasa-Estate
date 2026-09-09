import React from "react";
import { AlertTriangle } from "lucide-react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";

interface UnsavedChangesDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmDiscard: () => void;
  title?: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
}

export const UnsavedChangesDialog: React.FC<UnsavedChangesDialogProps> = ({
  isOpen,
  onClose,
  onConfirmDiscard,
  title = "Unsaved Changes Detected",
  description = "You have modified content on this form. If you leave now or cancel, your changes will be discarded.",
  confirmLabel = "Discard Changes",
  cancelLabel = "Keep Editing",
}) => {
  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <AlertDialogContent className="max-w-md border border-border/80 bg-card/95 backdrop-blur-xl p-6 shadow-2xl rounded-xl">
        <AlertDialogHeader className="space-y-3">
          <div className="mx-auto sm:mx-0 flex h-11 w-11 items-center justify-center rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div className="space-y-1">
            <AlertDialogTitle className="text-base font-semibold text-foreground tracking-tight">
              {title}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-muted-foreground leading-relaxed">
              {description}
            </AlertDialogDescription>
          </div>
        </AlertDialogHeader>

        <AlertDialogFooter className="mt-5 sm:space-x-2 gap-2">
          <AlertDialogCancel
            onClick={onClose}
            className="text-xs h-9 px-4 border-border text-foreground hover:bg-secondary transition-colors"
          >
            {cancelLabel}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirmDiscard}
            className="text-xs h-9 px-4 bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-colors"
          >
            {confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default UnsavedChangesDialog;
