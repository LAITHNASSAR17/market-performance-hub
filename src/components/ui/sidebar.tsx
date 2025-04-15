
"use client"

import * as React from "react"
import { createContext, forwardRef, useContext, useEffect, useState } from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

/* -----------------------------------------------------------------------------
 * Context
 * -----------------------------------------------------------------------------*/

interface SidebarContextValue {
  expanded: boolean
  setExpanded: (expanded: boolean) => void
  toggleExpanded: () => void
  minimized: boolean
  setMinimized: (minimized: boolean) => void
  toggleMinimized: () => void
  isMobile: boolean
}

const SidebarContext = createContext<SidebarContextValue | undefined>(undefined)

const useSidebar = () => {
  const context = useContext(SidebarContext)
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider")
  }
  return context
}

/* -----------------------------------------------------------------------------
 * Provider
 * -----------------------------------------------------------------------------*/

interface SidebarProviderProps {
  children: React.ReactNode
  defaultExpanded?: boolean
  defaultMinimized?: boolean
}

const SidebarProvider = ({
  children,
  defaultExpanded = true,
  defaultMinimized = false,
}: SidebarProviderProps) => {
  const [expanded, _setExpanded] = useState(defaultExpanded)
  const [minimized, _setMinimized] = useState(defaultMinimized)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768)
    }

    handleResize()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  useEffect(() => {
    if (isMobile) {
      _setExpanded(false)
    } else {
      _setExpanded(true)
    }
  }, [isMobile])

  const setExpanded = (expanded: boolean) => {
    if (isMobile && expanded) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
    _setExpanded(expanded)
  }

  const toggleExpanded = () => {
    setExpanded(!expanded)
  }

  const setMinimized = (minimized: boolean) => {
    _setMinimized(minimized)
  }

  const toggleMinimized = () => {
    setMinimized(!minimized)
  }

  return (
    <SidebarContext.Provider
      value={{
        expanded,
        setExpanded,
        toggleExpanded,
        minimized,
        setMinimized,
        toggleMinimized,
        isMobile,
      }}
    >
      {children}
    </SidebarContext.Provider>
  )
}

/* -----------------------------------------------------------------------------
 * Sidebar
 * -----------------------------------------------------------------------------*/

const sidebarVariants = cva(
  [
    "fixed inset-y-0 left-0 z-20 flex w-full flex-col border-r bg-sidebar p-2",
    "data-[expanded=true]:translate-x-0",
    "data-[expanded=false]:-translate-x-full md:data-[expanded=false]:-translate-x-[--sidebar-width]",
    "transition-all duration-300 ease-in-out",
  ],
  {
    variants: {
      size: {
        default: "md:w-[var(--sidebar-width)] [--sidebar-width:240px]",
        sm: "md:w-[var(--sidebar-width)] [--sidebar-width:200px]",
        lg: "md:w-[var(--sidebar-width)] [--sidebar-width:280px]",
        minimized:
          "md:w-[var(--sidebar-width)] [--sidebar-width:56px] p-1.5 md:p-2",
      },
    },
    defaultVariants: {
      size: "default",
    },
  }
)

interface SidebarProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof sidebarVariants> {}

const Sidebar = forwardRef<HTMLDivElement, SidebarProps>(
  ({ className, size, ...props }, ref) => {
    const { expanded, minimized } = useSidebar()

    return (
      <>
        <div
          ref={ref}
          data-expanded={expanded}
          className={cn(
            sidebarVariants({
              size: minimized ? "minimized" : size,
            }),
            className
          )}
          {...props}
        />
        {expanded && <SidebarBackdrop />}
      </>
    )
  }
)
Sidebar.displayName = "Sidebar"

/* -----------------------------------------------------------------------------
 * SidebarBackdrop
 * -----------------------------------------------------------------------------*/

const SidebarBackdrop = () => {
  const { setExpanded, isMobile } = useSidebar()

  if (!isMobile) return null

  return (
    <div
      className="fixed inset-0 z-10 bg-background/80 backdrop-blur-sm"
      onClick={() => setExpanded(false)}
    />
  )
}

/* -----------------------------------------------------------------------------
 * SidebarHeader
 * -----------------------------------------------------------------------------*/

const sidebarHeaderVariants = cva([
  "flex items-center gap-2 px-2 h-10",
  "data-[minimized=true]:justify-center",
])

interface SidebarHeaderProps
  extends React.ButtonHTMLAttributes<HTMLDivElement>,
    VariantProps<typeof sidebarHeaderVariants> {}

const SidebarHeader = forwardRef<HTMLDivElement, SidebarHeaderProps>(
  ({ className, ...props }, ref) => {
    const { minimized } = useSidebar()

    return (
      <div
        ref={ref}
        data-minimized={minimized}
        className={cn(sidebarHeaderVariants(), className)}
        {...props}
      />
    )
  }
)
SidebarHeader.displayName = "SidebarHeader"

/* -----------------------------------------------------------------------------
 * SidebarHeaderTitle
 * -----------------------------------------------------------------------------*/

interface SidebarHeaderTitleProps extends React.HTMLAttributes<HTMLDivElement> {}

const SidebarHeaderTitle = forwardRef<HTMLDivElement, SidebarHeaderTitleProps>(
  ({ className, ...props }, ref) => {
    const { minimized } = useSidebar()

    if (minimized) return null

    return (
      <div
        ref={ref}
        className={cn("text-lg font-semibold", className)}
        {...props}
      />
    )
  }
)
SidebarHeaderTitle.displayName = "SidebarHeaderTitle"

/* -----------------------------------------------------------------------------
 * SidebarTrigger
 * -----------------------------------------------------------------------------*/

const sidebarTriggerVariants = cva([
  "flex h-8 w-8 items-center justify-center rounded-md text-sidebar-foreground transition-colors",
  "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
  "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
])

interface SidebarTriggerProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof sidebarTriggerVariants> {}

const SidebarTrigger = forwardRef<HTMLButtonElement, SidebarTriggerProps>(
  ({ className, ...props }, ref) => {
    const { toggleExpanded, isMobile } = useSidebar()

    return (
      <button
        ref={ref}
        onClick={toggleExpanded}
        className={cn(sidebarTriggerVariants(), className)}
        {...props}
      >
        <Menu className="h-4 w-4" />
        <span className="sr-only">Toggle Sidebar</span>
      </button>
    )
  }
)
SidebarTrigger.displayName = "SidebarTrigger"

/* -----------------------------------------------------------------------------
 * SidebarTriggerMobile
 * -----------------------------------------------------------------------------*/

interface SidebarTriggerMobileProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

const SidebarTriggerMobile = forwardRef<
  HTMLButtonElement,
  SidebarTriggerMobileProps
>(({ className, ...props }, ref) => {
  const { toggleExpanded, isMobile } = useSidebar()

  if (!isMobile) return null

  return (
    <button
      ref={ref}
      onClick={toggleExpanded}
      className={cn(
        "fixed right-4 top-3 z-30 rounded-md bg-primary p-1.5 text-primary-foreground shadow-md",
        className
      )}
      {...props}
    >
      <Menu className="h-5 w-5" />
      <span className="sr-only">Toggle Sidebar</span>
    </button>
  )
})
SidebarTriggerMobile.displayName = "SidebarTriggerMobile"

/* -----------------------------------------------------------------------------
 * SidebarContent
 * -----------------------------------------------------------------------------*/

interface SidebarContentProps extends React.HTMLAttributes<HTMLDivElement> {}

const SidebarContent = forwardRef<HTMLDivElement, SidebarContentProps>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("flex flex-1 flex-col gap-1 overflow-hidden", className)}
        {...props}
      />
    )
  }
)
SidebarContent.displayName = "SidebarContent"

/* -----------------------------------------------------------------------------
 * SidebarGroup
 * -----------------------------------------------------------------------------*/

interface SidebarGroupProps extends React.HTMLAttributes<HTMLDivElement> {}

const SidebarGroup = forwardRef<HTMLDivElement, SidebarGroupProps>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("flex flex-col gap-1", className)}
        {...props}
      />
    )
  }
)
SidebarGroup.displayName = "SidebarGroup"

/* -----------------------------------------------------------------------------
 * SidebarGroupLabel
 * -----------------------------------------------------------------------------*/

const sidebarGroupLabelVariants = cva([
  "flex select-none items-center gap-2 px-3 py-1.5 text-xs font-medium uppercase tracking-wider text-sidebar-foreground/50",
  "data-[minimized=true]:justify-center",
])

interface SidebarGroupLabelProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof sidebarGroupLabelVariants> {}

const SidebarGroupLabel = forwardRef<HTMLDivElement, SidebarGroupLabelProps>(
  ({ className, ...props }, ref) => {
    const { minimized } = useSidebar()

    return (
      <div
        ref={ref}
        data-minimized={minimized}
        className={cn(sidebarGroupLabelVariants(), className)}
        {...props}
      />
    )
  }
)
SidebarGroupLabel.displayName = "SidebarGroupLabel"

/* -----------------------------------------------------------------------------
 * SidebarGroupContent
 * -----------------------------------------------------------------------------*/

interface SidebarGroupContentProps
  extends React.HTMLAttributes<HTMLDivElement> {}

const SidebarGroupContent = forwardRef<
  HTMLDivElement,
  SidebarGroupContentProps
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn("flex flex-col gap-1", className)}
      {...props}
    />
  )
})
SidebarGroupContent.displayName = "SidebarGroupContent"

/* -----------------------------------------------------------------------------
 * SidebarMenu
 * -----------------------------------------------------------------------------*/

interface SidebarMenuProps extends React.HTMLAttributes<HTMLDivElement> {}

const SidebarMenu = forwardRef<HTMLDivElement, SidebarMenuProps>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("flex flex-col gap-1", className)}
        {...props}
      />
    )
  }
)
SidebarMenu.displayName = "SidebarMenu"

/* -----------------------------------------------------------------------------
 * SidebarMenuItem
 * -----------------------------------------------------------------------------*/

interface SidebarMenuItemProps extends React.HTMLAttributes<HTMLLIElement> {}

const SidebarMenuItem = forwardRef<HTMLLIElement, SidebarMenuItemProps>(
  ({ className, ...props }, ref) => {
    return (
      <li
        ref={ref}
        className={cn("list-none", className)}
        {...props}
      />
    )
  }
)
SidebarMenuItem.displayName = "SidebarMenuItem"

/* -----------------------------------------------------------------------------
 * SidebarMenuButton
 * -----------------------------------------------------------------------------*/

const sidebarMenuButtonVariants = cva([
  "group flex w-full select-none items-center gap-2 rounded-md px-3 py-2",
  "text-sidebar-foreground/70 transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground",
  "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-sidebar-ring",
  "data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-accent-foreground",
  "data-[minimized=true]:justify-center data-[minimized=true]:px-0",
])

interface SidebarMenuButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof sidebarMenuButtonVariants> {
  active?: boolean
  asChild?: boolean
}

const SidebarMenuButton = forwardRef<HTMLButtonElement, SidebarMenuButtonProps>(
  ({ className, active = false, asChild = false, ...props }, ref) => {
    const { minimized } = useSidebar()
    const Comp = asChild ? Slot : "button"

    return (
      <Comp
        ref={ref}
        data-active={active}
        data-minimized={minimized}
        className={cn(sidebarMenuButtonVariants(), className)}
        {...props}
      />
    )
  }
)
SidebarMenuButton.displayName = "SidebarMenuButton"

/* -----------------------------------------------------------------------------
 * SidebarFooter
 * -----------------------------------------------------------------------------*/

interface SidebarFooterProps extends React.HTMLAttributes<HTMLDivElement> {}

const SidebarFooter = forwardRef<HTMLDivElement, SidebarFooterProps>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("mt-auto flex flex-col gap-2", className)}
        {...props}
      />
    )
  }
)
SidebarFooter.displayName = "SidebarFooter"

/* -----------------------------------------------------------------------------
 * Icons
 * -----------------------------------------------------------------------------*/

function Menu(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <line x1="4" x2="20" y1="12" y2="12" />
      <line x1="4" x2="20" y1="6" y2="6" />
      <line x1="4" x2="20" y1="18" y2="18" />
    </svg>
  )
}

function Slot(props: any) {
  return <>{props.children}</>
}

export {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarHeaderTitle,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  SidebarTriggerMobile,
  useSidebar,
}
