"use client";

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { createModule } from "@/services/courseService";

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
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
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

  makeVisible: z.boolean().optional(),
});

export function AddModuleModal({
  open,
  onOpenChange,
  courseId,
  nextOrder = 1,
  onCreated,
}) {
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

  const onSubmit = async (values) => {
    // Normalize title before submission
    const normalizedTitle = values.moduleTitle.trim().replace(/\s+/g, " ");

    try {
      const payload = {
        title: normalizedTitle,
        description: values.moduleDescription,
        courseId: courseId,
        order: nextOrder,
      };
      const res = await createModule(payload);
      if (res.success) {
        ToastHelper.success("Module created successfully");
        onOpenChange(false);
        form.reset();
        if (typeof onCreated === "function") onCreated();
      } else {
        ToastHelper.error("Failed to create module");
      }
    } catch (err) {
      const backendErrors = err.response?.data?.errors;
      ToastHelper.error("Failed to create module");
      if (Array.isArray(backendErrors)) {
        backendErrors.forEach((msg) => {
          const lowerMsg = msg.toLowerCase();

          if (lowerMsg.includes("title")) {
            form.setError("moduleTitle", {
              type: "server",
              message: msg,
            });
          }

          if (lowerMsg.includes("description")) {
            form.setError("moduleDescription", {
              type: "server",
              message: msg,
            });
          }
        });
      } else {
        ToastHelper.error("Create module failed:", err);
      }
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
            Define a new module for your course, including its title,
            description, and visibility settings.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-5 py-4"
          >
            {/* Module Title */}
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

            {/* Module Description */}
            <FormField
              control={form.control}
              name="moduleDescription"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="!text-gray-900">
                    Module Description<span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Provide a detailed overview of the module content and learning objectives."
                      className="min-h-[100px] resize-y"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Estimated Time
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
            /> */}

            {/* Visibility
            <div className="pt-2">
              <label className="flex items-center gap-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={form.watch("makeVisible")}
                  onChange={(e) =>
                    form.setValue("makeVisible", e.target.checked)
                  }
                  className="h-4 w-4 accent-indigo-600"
                />
                <span className="text-sm font-normal leading-snug">
                  Make module visible to students immediately upon saving.
                </span>
              </label>
            </div> */}

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
