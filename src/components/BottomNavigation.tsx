import { Users, FileText, Package, Menu, ShoppingBag, Tag, LogOut } from "lucide-react"
import { NavLink, useLocation, useNavigate } from "react-router-dom"
import { cn } from "@/lib/utils"
import { useState } from "react"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/hooks/useAuth"
import { Separator } from "@/components/ui/separator"

// BaseWeb navigation items following Base Design System patterns
const navigationItems = [
  { title: "Clients", url: "/dashboard", icon: Users },
  { title: "Soumissions", url: "/dashboard/submissions", icon: FileText },
  { title: "Commandes", url: "/dashboard/orders", icon: Package },
  { title: "Épreuves", url: "/dashboard/proofs", icon: FileText },
]

// BaseWeb menu items for secondary navigation
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
      {/* BaseWeb Bottom Navigation - Following Base Design System standards */}
      <nav 
        className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border"
        style={{
          paddingBottom: 'env(safe-area-inset-bottom)',
          boxShadow: '0 -2px 8px rgba(0, 0, 0, 0.1)' // Base elevation-1
        }}
      >
        {/* Base Design System: 16px mobile, 24px tablet, 32px desktop margins */}
        <div className="mx-auto max-w-sm px-4 md:max-w-2xl md:px-6 lg:max-w-4xl lg:px-8">
          {/* BaseWeb Layout Grid with 8px spacing system */}
          <div className="grid grid-cols-5 gap-2 py-2">
            {navigationItems.map((item) => {
              const active = isActive(item.url)
              return (
                <NavLink
                  key={item.title}
                  to={item.url}
                  className={cn(
                    // BaseWeb Button pattern: 48px minimum touch target
                    "flex flex-col items-center justify-center",
                    "min-h-12 px-2 py-2", // 48px min-height + 8px padding (BaseWeb spacing-2)
                    "rounded-lg transition-all duration-200 ease-out",
                    // BaseWeb focus states
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
                    // BaseWeb color tokens
                    active 
                      ? "text-primary bg-primary/10" 
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  )}
                  aria-current={active ? "page" : undefined}
                >
                  <item.icon 
                    className={cn(
                      "h-5 w-5 transition-transform duration-200",
                      "mb-1", // 4px spacing (BaseWeb spacing-1) 
                      active ? "scale-110" : "scale-100"
                    )} 
                    strokeWidth={active ? 2.5 : 2}
                  />
                  <span className={cn(
                    // Base typography: 14px caption with 1.2 line-height
                    "text-xs font-medium leading-tight text-center",
                    "max-w-full truncate",
                    active ? "font-semibold" : "font-medium"
                  )}>
                    {item.title}
                  </span>
                </NavLink>
              )
            })}
            
            {/* BaseWeb Menu Button following Button component pattern */}
            <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
              <SheetTrigger asChild>
                <button 
                  className={cn(
                    "flex flex-col items-center justify-center",
                    "min-h-12 px-2 py-2 rounded-lg",
                    "transition-all duration-200 ease-out",
                    "text-muted-foreground hover:text-foreground hover:bg-muted/50",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                  )}
                  aria-label="Menu supplémentaire"
                >
                  <Menu className="h-5 w-5 mb-1" strokeWidth={2} />
                  <span className="text-xs font-medium leading-tight">Plus</span>
                </button>
              </SheetTrigger>
              
              {/* BaseWeb Drawer pattern with proper elevation */}
              <SheetContent 
                side="bottom" 
                className="h-[60vh] bg-background border-t border-border"
                style={{
                  boxShadow: '0 -8px 32px rgba(0, 0, 0, 0.12)' // Base elevation-3
                }}
              >
                <SheetHeader className="pb-6">
                  {/* Base typography: 24px h3 with 1.2 line-height */}
                  <SheetTitle className="text-xl font-semibold leading-tight">
                    Menu
                  </SheetTitle>
                </SheetHeader>
                
                {/* BaseWeb List pattern with 8px grid spacing */}
                <div className="grid gap-2">
                  {menuItems.map((item) => (
                    <Button
                      key={item.title}
                      variant="ghost"
                      size="lg"
                      className={cn(
                        "justify-start h-14 text-left", // 56px height (BaseWeb touch target)
                        "px-4 py-3", // 16px horizontal, 12px vertical (8px grid)
                        // Base typography: 16px body with 1.5 line-height
                        "text-base font-medium leading-6"
                      )}
                      onClick={() => {
                        navigate(item.url)
                        setIsMenuOpen(false)
                      }}
                    >
                      <item.icon className="h-5 w-5 mr-3 flex-shrink-0" />
                      {item.title}
                    </Button>
                  ))}
                  
                  {/* BaseWeb Separator with proper spacing */}
                  <Separator className="my-4" />
                  
                  {/* BaseWeb destructive action pattern */}
                  <Button
                    variant="ghost"
                    size="lg"
                    className={cn(
                      "justify-start h-14 text-left px-4 py-3",
                      "text-base font-medium leading-6",
                      "text-destructive hover:text-destructive hover:bg-destructive/10"
                    )}
                    onClick={handleSignOut}
                  >
                    <LogOut className="h-5 w-5 mr-3 flex-shrink-0" />
                    Déconnexion
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