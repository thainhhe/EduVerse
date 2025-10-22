"use client";

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Form,
    FormField,
    FormItem,
    FormLabel,
    FormControl,
    FormMessage,
} from "@/components/ui/form";

const formSchema = z.object({
    moduleTitle: z.string().min(1, "Title is required"),
    moduleDescription: z.string().min(1, "Description is required"),
    estimatedTime: z
        .string()
        .min(1, "Time is required")
        .refine((val) => Number(val) > 0, "Time must be greater than 0"),
    makeVisible: z.boolean().optional(),
});

export function AddModuleModal({ open, onOpenChange }) {
    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            moduleTitle: "",
            moduleDescription: "",
            estimatedTime: "",
            makeVisible: false,
        },
    });

    const onSubmit = (values) => {
        console.log("Form Data:", values);
        onOpenChange(false);
        form.reset();
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle className="text-xl font-semibold">Add New Module</DialogTitle>
                    <DialogDescription className="text-sm text-muted-foreground">
                        Define a new module for your course, including its title, description, and visibility settings.
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
                        <FormField
                            control={form.control}
                            name="moduleDescription"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Module Description</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Provide a detailed overview of the module content and learning objectives."
                                            className="min-h-[100px] resize-none"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Estimated Time */}
                        <FormField
                            control={form.control}
                            name="estimatedTime"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Estimated Completion Time (hours)</FormLabel>
                                    <FormControl>
                                        <Input type="number" min="0" placeholder="0" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Visibility */}
                        <div className="pt-2">
                            <label className="flex items-center gap-3 cursor-pointer select-none">
                                <input
                                    type="checkbox"
                                    checked={form.watch("makeVisible")}
                                    onChange={(e) => form.setValue("makeVisible", e.target.checked)}
                                    className="h-4 w-4 accent-indigo-600"
                                />
                                <span className="text-sm font-normal leading-snug">
                                    Make module visible to students immediately upon saving.
                                </span>
                            </label>
                        </div>


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
