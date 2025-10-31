import React, { useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog"
import {
    Form,
    FormField,
    FormItem,
    FormLabel,
    FormControl,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

const formSchema = z.object({
    name: z.string().min(1, "Category name is required"),
    weight: z
        .string()
        .min(1, "Weight is required")
        .refine((val) => !isNaN(Number(val)) && Number(val) >= 0, "Must be a number ≥ 0"),
})

const AddNewGradeCategory = ({ open, onOpenChange, mode, initialData, onSubmit }) => {
    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: initialData || { name: "", weight: "" },
    })

    console.log("initialValues", initialData)
    console.log("Form initialized with values:", form.getValues())
    const handleSubmit = (data) => {
        onSubmit(data)
        form.reset()
        onOpenChange(false)
    }
    useEffect(() => {
        if (open) {
            if (mode === "edit" && initialData) {
                // Khi edit → reset với dữ liệu
                form.reset({
                    ...initialData,
                    weight: String(initialData.weight ?? ""),
                })
            } else if (mode === "add") {
                // Khi add → reset form về rỗng
                form.reset({ name: "", weight: "" })
            }
        }
    }, [open, mode, initialData, form])



    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md p-0 overflow-hidden">
                <DialogHeader className="border-b px-6 py-4 bg-gray-50">
                    <DialogTitle className="text-base font-semibold text-gray-900">
                        {mode === "edit" ? "Edit Grade Category" : "Add New Grade Category"}
                    </DialogTitle>
                </DialogHeader>

                <Card className="shadow-none border-0">
                    <CardContent className="p-6">
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-5">
                                {/* Category Name */}
                                <FormField
                                    control={form.control}
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-sm font-medium text-gray-700">
                                                Letter Grade
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="e.g., Quizzes, Homework, Exams"
                                                    className="mt-1 text-sm focus-visible:ring-indigo-500"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage className="text-xs text-red-500 mt-1" />
                                        </FormItem>
                                    )}
                                />

                                {/* Weight Percentage */}
                                <FormField
                                    control={form.control}
                                    name="weight"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-sm font-medium text-gray-700">
                                                Weight Percentage (%)
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="e.g., 20, 50, 100"
                                                    className="mt-1 text-sm focus-visible:ring-indigo-500"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage className="text-xs text-red-500 mt-1" />
                                        </FormItem>
                                    )}
                                />

                                <DialogFooter className="flex justify-end gap-3 pt-3 border-t mt-6">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="text-sm font-medium text-gray-700 border-gray-300 hover:bg-gray-100"
                                        onClick={() => {
                                            form.reset()
                                            onOpenChange(false)
                                        }}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        type="submit"
                                        className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium"
                                    >
                                        {mode === "edit" ? "Save Changes" : "Save Category"}
                                    </Button>
                                </DialogFooter>
                            </form>
                        </Form>
                    </CardContent>
                </Card>
            </DialogContent>
        </Dialog>
    )
}

export default AddNewGradeCategory
