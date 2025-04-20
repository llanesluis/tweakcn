"use client";

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
import { useRef } from "react";
import { Loader2 } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const formSchema = z.object({
  themeName: z.string().min(1, "Theme name cannot be empty."),
});

interface ThemeSaveDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (themeName: string) => Promise<void>;
  isSaving: boolean;
}

export function ThemeSaveDialog({
  open,
  onOpenChange,
  onSave,
  isSaving,
}: ThemeSaveDialogProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      themeName: "",
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    onSave(values.themeName);
  };

  // Reset form when dialog closes or opens with different state
  // This avoids showing old validation errors or values
  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      form.reset();
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <DialogHeader>
              <DialogTitle>Save Theme</DialogTitle>
              <DialogDescription>
                Enter a name for your theme so you can find it later.
              </DialogDescription>
            </DialogHeader>
            <FormField
              control={form.control}
              name="themeName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="My Awesome Theme" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button
                type="submit"
                disabled={
                  isSaving ||
                  !form.formState.isValid ||
                  form.formState.isSubmitting
                }
              >
                {isSaving || form.formState.isSubmitting ? (
                  <>
                    <Loader2 className="mr-1 size-4 animate-spin" />
                    Saving
                  </>
                ) : (
                  "Save Theme"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
