import { Users, FileText, Package, Menu, ShoppingBag, Tag, LogOut } from "lucide-react"
import { NavLink, useLocation, useNavigate } from "react-router-dom"
import { cn } from "@/lib/utils"
import { useState } from "react"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/hooks/useAuth"
import { Separator } from "@/components/ui/separator"

const navigationItems = [
  { title: "Clients", url: "/dashboard", icon: Users },
  { title: "Soumissions", url: "/dashboard/submissions", icon: FileText },
  { title: "Commandes", url: "/dashboard/orders", icon: Package },
  { title: "Épreuves", url: "/dashboard/proofs", icon: FileText },
]

const menuItems = [
  { title: "Produits", url: "/dashboard/products", icon: Tag },
  { title: "Fournisseurs", url: "/dashboard/suppliers", icon: ShoppingBag },
  { title: "Employés", url: "/dashboard/admin/employees", icon: Users },
]

export function BottomNavigation() {
  const location = useLocation()
  const navigate = useNavigate()
  const currentPath = location.pathname
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { signOut } = useAuth()

  const handleSignOut = async () => {
    await signOut()
    setIsMenuOpen(false)
  }

  const isActive = (path: string) => {
    if (path === "/dashboard") {
      return currentPath === "/dashboard" || currentPath.startsWith("/dashboard/clients/")
    }
    return currentPath.startsWith(path)
  }

  return (
    <>
      {/* Bottom Navigation - BaseWeb Layout Grid Pattern */}
      <nav className={cn(
        "fixed bottom-0 left-0 right-0 z-50",
        "bg-background border-t border-border",
        "shadow-lg",
        "pb-[env(safe-area-inset-bottom)]"
      )}>
        {/* BaseWeb Container with 16px mobile margins */}
        <div className="px-4 py-2 max-w-full overflow-hidden">
          {/* BaseWeb Layout Grid - 8px spacing system */}
          <div className={cn(
            "flex items-center justify-between w-full max-w-2xl mx-auto",
            "gap-2"
          )}>
            {navigationItems.map((item) => {
              const active = isActive(item.url)
              return (
                <NavLink
                  key={item.title}
                  to={item.url}
                  className={cn(
                    // BaseWeb touch target: 48px minimum
                    "flex flex-col items-center justify-center",
                    "min-w-[48px] min-h-[48px] sm:min-w-[56px] sm:min-h-[56px]",
                    "px-2 py-2 rounded-lg",
                    "transition-all duration-200",
                    // BaseWeb focus states
                    "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
                    // BaseWeb interactive states
                    "active:scale-95 hover:scale-105",
                    "flex-1 max-w-[80px]",
                    active 
                      ? "text-primary bg-primary/10" 
                      : "text-content-secondary hover:text-content-primary hover:bg-background-secondary"
                  )}
                >
                  <item.icon className={cn(
                    "h-5 w-5 mb-1 transition-all duration-200 flex-shrink-0", 
                    active ? "text-primary scale-110 stroke-[2.5]" : "text-content-secondary stroke-[2]"
                  )} />
                  <span className={cn(
                    // BaseWeb typography: 14px caption
                    "text-[14px] leading-[1.2] font-medium text-center",
                    "transition-all duration-200 block w-full truncate",
                    active ? "text-primary font-semibold" : "text-content-secondary"
                  )}>
                    {item.title}
                  </span>
                </NavLink>
              )
            })}
            
            {/* Menu Button - BaseWeb Pattern */}
            <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
              <SheetTrigger asChild>
                <div className={cn(
                  // BaseWeb touch target: 48px minimum
                  "flex flex-col items-center justify-center",
                  "min-w-[48px] min-h-[48px] sm:min-w-[56px] sm:min-h-[56px]",
                  "px-2 py-2 rounded-lg",
                  "transition-all duration-200 cursor-pointer",
                  // BaseWeb focus states
                  "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
                  // BaseWeb interactive states
                  "active:scale-95 hover:scale-105",
                  "flex-1 max-w-[80px]",
                  "text-content-secondary hover:text-content-primary hover:bg-background-secondary"
                )}>
                  <Menu className="h-5 w-5 mb-1 stroke-[2] flex-shrink-0" />
                  <span className={cn(
                    // BaseWeb typography: 14px caption
                    "text-[14px] leading-[1.2] font-medium text-center",
                    "block w-full truncate"
                  )}>
                    Plus
                  </span>
                </div>
              </SheetTrigger>
              
              {/* BaseWeb Modal/Sheet Pattern */}
              <SheetContent 
                side="bottom" 
                className={cn(
                  "h-[50vh] z-50 bg-background border-t border-border",
                  "shadow-2xl"
                )}
              >
                <SheetHeader className="pb-4">
                  <SheetTitle className="text-[24px] leading-[1.2] font-semibold text-content-primary">
                    Menu
                  </SheetTitle>
                </SheetHeader>
                
                {/* BaseWeb List Pattern with 8px spacing */}
                <div className="space-y-2 py-4 overflow-y-auto max-h-full">
                  {menuItems.map((item) => (
                    <Button
                      key={item.title}
                      variant="ghost"
                      className={cn(
                        // BaseWeb touch target: 48px minimum
                        "justify-start min-h-[48px] w-full",
                        // BaseWeb typography: 16px body
                        "text-[16px] leading-[1.5] px-4 py-3",
                        "hover:bg-background-secondary",
                        // BaseWeb focus states
                        "focus:ring-2 focus:ring-primary focus:ring-offset-2"
                      )}
                      onClick={() => {
                        navigate(item.url)
                        setIsMenuOpen(false)
                      }}
                    >
                      <item.icon className="h-5 w-5 mr-3 flex-shrink-0" />
                      <span className="truncate">{item.title}</span>
                    </Button>
                  ))}
                  
                  {/* BaseWeb Separator */}
                  <Separator className="my-4" />
                  
                  <Button
                    variant="ghost"
                    className={cn(
                      // BaseWeb touch target: 48px minimum
                      "justify-start min-h-[48px] w-full",
                      // BaseWeb typography: 16px body
                      "text-[16px] leading-[1.5] px-4 py-3",
                      "text-negative hover:text-negative hover:bg-negative/10",
                      // BaseWeb focus states
                      "focus:ring-2 focus:ring-negative focus:ring-offset-2"
                    )}
                    onClick={handleSignOut}
                  >
                    <LogOut className="h-5 w-5 mr-3 flex-shrink-0" />
                    <span className="truncate">Déconnexion</span>
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </nav>
    </>
  )
}