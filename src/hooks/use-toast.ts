
import { Toast, ToastActionElement, ToastProps } from "@/components/ui/toast";
import {
  ToastActionElement as ToastPrimitivesActionElement,
} from "@radix-ui/react-toast";

import {
  useToast as useToastFromUI,
} from "@/components/ui/use-toast";

type ToastType = Omit<ToastProps, "id"> & {
  id?: string;
  action?: ToastActionElement;
  title?: string;
  description?: React.ReactNode;
};

export const useToast = useToastFromUI;

export const toast = ({ ...props }: ToastType) => {
  const { toast } = useToastFromUI();
  return toast({ ...props });
};
