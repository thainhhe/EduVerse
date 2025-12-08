import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import React from "react";

export const ConfirmationHelper = ({
    trigger,
    title = "Confirm action",
    description = "Are you sure you want to perform this action?",
    confirmText = "Confirm",
    cancelText = "Cancel",
    confirmBgColor = "bg-red-500 hover:bg-red-600 text-white",
    cancelBgColor = "bg-gray-500 hover:bg-gray-600 text-white",
    onConfirm,
}) => {
    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>
                {React.cloneElement(trigger, {
                    onClick: (e) => {
                        e.stopPropagation();
                        trigger.props.onClick?.(e);
                    },
                })}
            </AlertDialogTrigger>

            <AlertDialogContent className="max-w-md" onClick={(e) => e.stopPropagation()}>
                <AlertDialogHeader>
                    <AlertDialogTitle className="text-lg font-semibold">{title}</AlertDialogTitle>
                    <AlertDialogDescription className="text-gray-600">{description}</AlertDialogDescription>
                </AlertDialogHeader>

                <AlertDialogFooter>
                    <AlertDialogCancel className={cancelBgColor} onClick={(e) => e.stopPropagation()}>
                        {cancelText}
                    </AlertDialogCancel>

                    <AlertDialogAction
                        className={confirmBgColor}
                        onClick={(e) => {
                            e.stopPropagation();
                            onConfirm && onConfirm(e);
                        }}
                    >
                        {confirmText}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
};
