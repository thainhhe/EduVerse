import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { createModule, updateModule } from "@/services/courseService";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { useEffect } from "react";

const formSchema = z.object({
    moduleTitle: z
        .string()
        .trim() // loại bỏ space đầu cuối nhưng vẫn giữ được z.string()
        .min(3, { message: "Title must be at least 3 characters" })
        .max(100, { message: "Title must not exceed 100 characters" })
        .refine((val) => val.trim().length > 0, {
            message: "Title cannot be empty or spaces only",
        }),

    moduleDescription: z
        .string()
        .trim()
        .min(10, { message: "Description must be at least 10 characters" })
        .max(500, { message: "Description must not exceed 500 characters" })
        .refine((val) => val.trim().length > 0, {
            message: "Description cannot be empty or spaces only",
        }),

    makeVisible: z.boolean().optional(),
});

export function EditModuleModal({ open, onOpenChange, module_, onUpdate }) {
    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            moduleTitle: "",
            moduleDescription: "",
            makeVisible: false,
        },
    });

    useEffect(() => {
        if (!open) return;
        form.reset({
            moduleTitle: module_?.title || "",
            moduleDescription: module_?.description || "",
            makeVisible: !!module_?.makeVisible,
        });
    }, [open, module_]);

    const onSubmit = async (values) => {
        try {
            const payload = {
                title: values.moduleTitle,
                description: values.moduleDescription,
                courseId: module_?.courseId,
                makeVisible: values.makeVisible,
            };

            console.log("moduleUpdate:", module_);
            await updateModule(module_.id, payload);
            form.reset();
            onOpenChange(false);

            if (typeof onUpdate === "function") onUpdate();
        } catch (err) {
            console.error("Create module failed:", err.response?.data ?? err);
            alert("Create module failed. Check console/server logs.");
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle className="text-xl font-semibold">Add New Module</DialogTitle>
                    <DialogDescription className="text-sm text-muted-foreground">
                        Define a new module for your module_, including its title, description, and visibility
                        settings.
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5 py-4">
                        {/* Module Title */}
                        <FormField
                            control={form.control}
                            name="moduleTitle"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Module Title</FormLabel>
                                    <FormControl>
                                        <Input placeholder="e.g., Introduction to Marketing" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Module Description */}
                        {/* Module Description */}
                        <FormField
                            control={form.control}
                            name="moduleDescription"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Module Description</FormLabel>
                                    <FormControl>
                                        <textarea
                                            placeholder="Provide a detailed overview of the module content and learning objectives."
                                            className="min-h-[170px] resize-y !w-full !block whitespace-pre-wrap break-all p-3 rounded-md border border-input bg-transparent text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                                            value={field.value}
                                            onChange={(e) => field.onChange(e.target.value)}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Visibility */}
                        <FormField
                            control={form.control}
                            name="makeVisible"
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-3">
                                    <FormControl>
                                        <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                                    </FormControl>
                                    <div className="space-y-1 leading-none">
                                        <FormLabel>
                                            Make module visible to students immediately upon saving.
                                        </FormLabel>
                                    </div>
                                </FormItem>
                            )}
                        />

                        {/* Buttons */}
                        <DialogFooter className="gap-2 pt-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => {
                                    form.reset();
                                    onOpenChange(false);
                                }}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white">
                                Save Module
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
