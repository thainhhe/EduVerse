import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useEffect } from "react"

const announcementSchema = z.object({
    date: z.string().min(1, "Please select a date"),
    title: z.string().min(1, "Title is required"),
    message: z.string().min(1, "Message is required"),
})

export const AnnouncementDialog = ({
    open,
    onOpenChange,
    mode,
    initialData,
    onSubmit,
}) => {
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(announcementSchema),
        defaultValues: initialData || {
            date: "",
            title: "",
            message: "",
        },
    })

    // reset form khi mở lại dialog (vd khi edit)
    useEffect(() => {
        if (initialData) reset(initialData)
        else reset({ date: "", title: "", message: "" })
    }, [initialData, open, reset])

    const handleFormSubmit = (data) => {
        onSubmit(data)
        onOpenChange(false)
        console.log("initialData", initialData)
    }

    console.log("initialData", initialData

    )
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-lg p-8">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-semibold text-center">
                        {mode === "add" ? "Add New Announcement" : "Edit Announcement"}
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="date">Announcement Date</Label>
                        <Input type="date" id="date" {...register("date")} />
                        {errors.date && (
                            <p className="text-red-500 text-sm">{errors.date.message}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="title">Title</Label>
                        <Input
                            id="title"
                            placeholder="Enter announcement title"
                            {...register("title")}
                        />
                        {errors.title && (
                            <p className="text-red-500 text-sm">{errors.title.message}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="message">Message Summary</Label>
                        <Textarea
                            id="message"
                            placeholder="Type your announcement message here."
                            className="h-28"
                            {...register("message")}
                        />
                        {errors.message && (
                            <p className="text-red-500 text-sm">{errors.message.message}</p>
                        )}
                    </div>

                    <DialogFooter className="flex justify-end gap-3 pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700">
                            {mode === "add" ? "Save Announcement" : "Update Announcement"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
