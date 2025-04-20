
// Based on shadcn-ui: https://ui.shadcn.com/docs/components/toast
import * as React from "react";
import { useState, useEffect, createContext, useContext } from "react";

export type ToastProps = {
  id?: string;  // Made optional since we'll generate it if not provided
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactNode;
  variant?: "default" | "destructive";
  open?: boolean;
};

export type ToastActionElement = React.ReactElement<{
  className?: string;
  altText?: string;
  onClick?: () => void;
}>;

const TOAST_REMOVE_DELAY = 1000000;

type ToasterToast = ToastProps & {
  id: string;
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactNode;
};

const actionTypes = {
  ADD_TOAST: "ADD_TOAST",
  UPDATE_TOAST: "UPDATE_TOAST",
  DISMISS_TOAST: "DISMISS_TOAST",
  REMOVE_TOAST: "REMOVE_TOAST",
} as const;

let count = 0;

function genId() {
  count = (count + 1) % Number.MAX_SAFE_INTEGER;
  return count.toString();
}

type Action =
  | {
      type: typeof actionTypes.ADD_TOAST;
      toast: ToasterToast;
    }
  | {
      type: typeof actionTypes.UPDATE_TOAST;
      toast: Partial<ToasterToast>;
    }
  | {
      type: typeof actionTypes.DISMISS_TOAST;
      toastId?: string;
    }
  | {
      type: typeof actionTypes.REMOVE_TOAST;
      toastId?: string;
    };

interface State {
  toasts: ToasterToast[];
}

const toastTimeouts = new Map<string, ReturnType<typeof setTimeout>>();

const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case actionTypes.ADD_TOAST:
      return {
        ...state,
        toasts: [...state.toasts, action.toast],
      };

    case actionTypes.UPDATE_TOAST:
      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === action.toast.id ? { ...t, ...action.toast } : t
        ),
      };

    case actionTypes.DISMISS_TOAST: {
      const { toastId } = action;

      if (toastId) {
        toastTimeouts.set(
          toastId,
          setTimeout(() => {
            dispatch({
              type: actionTypes.REMOVE_TOAST,
              toastId,
            });
          }, TOAST_REMOVE_DELAY)
        );
      }

      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === toastId || toastId === undefined
            ? {
                ...t,
                open: false,
              }
            : t
        ),
      };
    }
    case actionTypes.REMOVE_TOAST:
      if (action.toastId) {
        toastTimeouts.delete(action.toastId);
      }
      return {
        ...state,
        toasts: state.toasts.filter((t) => t.id !== action.toastId),
      };
    default:
      return state;
  }
};

type ToastContextType = {
  toasts: ToasterToast[];
  toast: (props: ToastProps) => string;
  dismiss: (toastId: string) => void;
};

const ToastContext = createContext<ToastContextType>({
  toasts: [],
  toast: () => "",
  dismiss: () => {},
});

const useToast = () => {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};

let dispatch: React.Dispatch<Action>;

const ToastProvider: React.FC<{ children: React.ReactNode }> = (props) => {
  const [state, _dispatch] = React.useReducer(reducer, { toasts: [] });
  dispatch = _dispatch;

  React.useEffect(() => {
    return () => {
      toastTimeouts.forEach((timeout) => {
        clearTimeout(timeout);
      });
      toastTimeouts.clear();
    };
  }, []);

  const toast = React.useCallback((props: ToastProps): string => {
    const id = props.id || genId();
    
    dispatch({
      type: actionTypes.ADD_TOAST,
      toast: {
        ...props,
        id,
        open: true,
      },
    });
    
    return id;
  }, []);

  const dismiss = React.useCallback((toastId: string) => {
    dispatch({
      type: actionTypes.DISMISS_TOAST,
      toastId,
    });
  }, []);

  const contextValue: ToastContextType = {
    toasts: state.toasts,
    toast,
    dismiss,
  };

  return React.createElement(
    ToastContext.Provider,
    { value: contextValue },
    props.children
  );
};

const toast = (props: ToastProps): string => {
  if (dispatch) {
    const id = props.id || genId();
    dispatch({
      type: actionTypes.ADD_TOAST,
      toast: {
        ...props,
        id,
        open: true,
      },
    });
    return id;
  }
  
  return '';
};

export { toast, ToastProvider, useToast };
