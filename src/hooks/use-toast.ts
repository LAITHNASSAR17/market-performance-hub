
import { Toast, ToastActionElement, ToastProps } from "@/components/ui/toast";
import {
  useToast as useToastFromUI,
} from "@/components/ui/use-toast";

type ToastType = Omit<ToastProps, "id"> & {
  id?: string;
  action?: ToastActionElement;
};

export const useToast = useToastFromUI;

export const toast = ({ ...props }: ToastType) => {
  const { toast } = useToastFromUI();
  return toast({ ...props });
};
