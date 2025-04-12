
import * as React from "react"
import { cva } from "class-variance-authority"

import { cn } from "@/lib/utils"

const sidebarVariants = cva(
  "fixed inset-y-0 left-0 z-50 w-64 bg-[#060B26] border-r border-gray-800 transition-transform duration-300 ease-in-out transform",
  {
    variants: {
      expanded: {
        true: "translate-x-0",
        false: "-translate-x-full md:translate-x-0 md:w-16",
      },
    },
    defaultVariants: {
      expanded: true,
    },
  }
)

const sidebarTriggerVariants = cva(
  "fixed z-50 flex items-center justify-center p-2 text-gray-300 bg-[#060B26] border border-gray-700 rounded-md shadow-sm hover:text-white transition-all duration-300 ease-in-out",
  {
    variants: {
      expanded: {
        true: "top-4 left-[248px] md:left-[248px]",
        false: "top-4 left-4 md:left-[52px]",
      },
    },
    defaultVariants: {
      expanded: true,
    },
  }
)

type SidebarContextValue = {
  expanded: boolean
  setExpanded: React.Dispatch<React.SetStateAction<boolean>>
  toggle: () => void
}

const SidebarContext = React.createContext<SidebarContextValue | undefined>(
  undefined
)

export function SidebarProvider({
  children,
  defaultExpanded = true,
}: {
  children: React.ReactNode
  defaultExpanded?: boolean
}) {
  const [expanded, setExpanded] = React.useState(defaultExpanded)

  const toggle = React.useCallback(() => {
    setExpanded((prev) => !prev)
  }, [])

  return (
    <SidebarContext.Provider value={{ expanded, setExpanded, toggle }}>
      {children}
    </SidebarContext.Provider>
  )
}

export function useSidebar() {
  const context = React.useContext(SidebarContext)
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider")
  }
  return context
}

export function SidebarTrigger() {
  const { expanded, toggle } = useSidebar()

  return (
    <button
      type="button"
      onClick={toggle}
      className={sidebarTriggerVariants({ expanded })}
    >
      {expanded ? (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="m15 18-6-6 6-6" />
        </svg>
      ) : (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="m9 18 6-6-6-6" />
        </svg>
      )}
    </button>
  )
}

export function Sidebar({
  className,
  children,
}: {
  className?: string
  children: React.ReactNode
}) {
  const { expanded } = useSidebar()

  return (
    <aside className={cn(sidebarVariants({ expanded }), className)}>
      <div className="h-full overflow-y-auto">{children}</div>
    </aside>
  )
}

export function SidebarHeader({
  className,
  children,
}: {
  className?: string
  children?: React.ReactNode
}) {
  const { expanded } = useSidebar()

  return (
    <div
      className={cn(
        "flex items-center p-4 h-16 border-b border-gray-800",
        expanded ? "justify-between" : "justify-center",
        className
      )}
    >
      {children}
    </div>
  )
}

export function SidebarContent({
  className,
  children,
}: {
  className?: string
  children: React.ReactNode
}) {
  return <div className={cn("py-4", className)}>{children}</div>
}

export function SidebarGroup({
  className,
  children,
}: {
  className?: string
  children: React.ReactNode
}) {
  return <div className={cn("mb-4", className)}>{children}</div>
}

export function SidebarGroupLabel({
  className,
  children,
}: {
  className?: string
  children: React.ReactNode
}) {
  const { expanded } = useSidebar()

  if (!expanded) return null

  return (
    <div
      className={cn(
        "px-4 mb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider",
        className
      )}
    >
      {children}
    </div>
  )
}

export function SidebarGroupContent({
  className,
  children,
}: {
  className?: string
  children: React.ReactNode
}) {
  return <div className={cn("", className)}>{children}</div>
}

export function SidebarMenu({
  className,
  children,
}: {
  className?: string
  children: React.ReactNode
}) {
  return <ul className={cn("space-y-1", className)}>{children}</ul>
}

export function SidebarMenuItem({
  className,
  children,
}: {
  className?: string
  children: React.ReactNode
}) {
  return <li className={cn("", className)}>{children}</li>
}

export function SidebarMenuButton({
  className,
  children,
  asChild,
  ...props
}: {
  className?: string
  children: React.ReactNode
  asChild?: boolean
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const { expanded } = useSidebar()
  const Comp = asChild ? React.Fragment : "button"
  const childProps = asChild ? {} : props

  return (
    <Comp
      {...childProps}
      className={cn(
        "flex items-center w-full text-gray-300 hover:text-white hover:bg-purple-800/40 rounded-md transition-colors",
        expanded ? "px-4 py-2.5 justify-start" : "justify-center p-3",
        className
      )}
    >
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          // Apply styling to icons
          if (child.type === "svg" || (typeof child.type === "function" && child.type.name?.includes("Icon"))) {
            return React.cloneElement(child, {
              ...child.props,
              className: cn("h-5 w-5", expanded && "mr-3", child.props.className),
            })
          }
          // Apply styling to text spans
          if (child.type === "span") {
            return expanded ? child : null
          }
        }
        return child
      })}
    </Comp>
  )
}

export function SidebarFooter({
  className,
  children,
}: {
  className?: string
  children?: React.ReactNode
}) {
  const { expanded } = useSidebar()

  return (
    <div
      className={cn(
        "border-t border-gray-800 p-4 mt-auto",
        expanded ? "flex items-center justify-between" : "flex flex-col items-center",
        className
      )}
    >
      {children}
    </div>
  )
}
