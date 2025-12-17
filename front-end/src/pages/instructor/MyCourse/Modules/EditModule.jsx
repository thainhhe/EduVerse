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
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { useEffect } from "react";
import { ToastHelper } from "@/helper/ToastHelper";

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
});

export function EditModuleModal({ open, onOpenChange, module_, onUpdate }) {
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      moduleTitle: "",
      moduleDescription: "",
    },
  });

  // Normalize module title: trim and collapse multiple spaces
  const normalizeModuleTitle = () => {
    const current = form.getValues("moduleTitle");
    const normalized = current.trim().replace(/\s+/g, " ");
    if (normalized !== current) {
      form.setValue("moduleTitle", normalized, { shouldValidate: true });
    }
  };

  // Normalize module description: trim and collapse multiple spaces
  const normalizeModuleDescription = () => {
    const current = form.getValues("moduleDescription");
    const normalized = current.trim().replace(/\s+/g, " ");
    if (normalized !== current) {
      form.setValue("moduleDescription", normalized, { shouldValidate: true });
    }
  };

  useEffect(() => {
    if (!open) return;
    form.reset({
      moduleTitle: module_?.title || "",
      moduleDescription: module_?.description || "",
    });
  }, [open, module_]);

  const onSubmit = async (values) => {
    // Normalize title and description before submission
    const normalizedTitle = values.moduleTitle.trim().replace(/\s+/g, " ");
    const normalizedDescription = values.moduleDescription
      .trim()
      .replace(/\s+/g, " ");

    try {
      const payload = {
        title: normalizedTitle,
        description: normalizedDescription,
        courseId: module_?.courseId,
      };

      const res = await updateModule(module_.id, payload);
      if (res.success) {
        ToastHelper.success("Update module successfully");
        form.reset();
        onOpenChange(false);
        if (typeof onUpdate === "function") onUpdate();
      } else {
        ToastHelper.error("Update module failed");
      }
    } catch (err) {
      console.error("Create module failed:", err.response?.data ?? err);
      ToastHelper.error("Create module failed");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            Add New Module
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Define a new module for your module_, including its title,
            description, and visibility settings.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-5 py-4"
          >
            <FormField
              control={form.control}
              name="moduleTitle"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="!text-gray-900">
                    Module Title<span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., Introduction to Marketing"
                      {...field}
                      onBlur={(e) => {
                        field.onBlur();
                        normalizeModuleTitle();
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="moduleDescription"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="!text-gray-900">
                    Module Description<span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <textarea
                      placeholder="Provide a detailed overview of the module content and learning objectives."
                      className="min-h-[170px] resize-y !w-full !block whitespace-pre-wrap break-all p-3 rounded-md border border-input bg-transparent text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                      value={field.value}
                      onChange={(e) => field.onChange(e.target.value)}
                      onBlur={(e) => {
                        field.onBlur();
                        normalizeModuleDescription();
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
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
              <Button
                type="submit"
                className="bg-indigo-600 hover:bg-indigo-700 text-white"
              >
                Save Module
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
