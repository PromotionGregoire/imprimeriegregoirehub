import { Users, FileText, Package, Tag, Building } from "lucide-react"
import { NavLink, useLocation } from "react-router-dom"
import { cn } from "@/lib/utils"

const navigationItems = [
  { title: "Clients", url: "/dashboard", icon: Users },
  { title: "Soumissions", url: "/dashboard/submissions", icon: FileText },
  { title: "Produits", url: "/dashboard/products", icon: Tag },
  { title: "Commandes", url: "/dashboard/orders", icon: Package },
  { title: "Épreuves", url: "/dashboard/proofs", icon: FileText },
]

export function BottomNavigation() {
  const location = useLocation()
  const currentPath = location.pathname

  const isActive = (path: string) => {
    if (path === "/dashboard") {
      return currentPath === "/dashboard" || currentPath.startsWith("/dashboard/clients/")
    }
    return currentPath.startsWith(path)
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-t border-border/50 pb-safe">
      <div className="flex items-center justify-around px-1 py-1">
        {navigationItems.map((item) => {
          const active = isActive(item.url)
          return (
            <NavLink
              key={item.title}
              to={item.url}
              className={cn(
                "flex flex-col items-center justify-center min-w-0 flex-1 px-2 py-3 rounded-xl transition-all duration-200 min-h-[60px] active:scale-95",
                active 
                  ? "text-primary bg-primary/8" 
                  : "text-muted-foreground/80 hover:text-foreground hover:bg-muted/50"
              )}
            >
              <item.icon className={cn(
                "h-6 w-6 mb-1.5 transition-all duration-200", 
                active ? "text-primary scale-110" : "text-muted-foreground/80"
              )} />
              <span className={cn(
                "text-[10px] font-medium leading-tight text-center max-w-full truncate transition-all duration-200",
                active ? "text-primary font-semibold" : "text-muted-foreground/80"
              )}>
                {item.title}
              </span>
            </NavLink>
          )
        })}
      </div>
    </nav>
  )
}