import { Users, FileText, Package, Menu } from "lucide-react"
import { NavLink, useLocation, useNavigate } from "react-router-dom"
import { cn } from "@/lib/utils"
import { useState } from "react"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"

const navigationItems = [
  { title: "Clients", url: "/dashboard", icon: Users },
  { title: "Soumissions", url: "/dashboard/submissions", icon: FileText },
  { title: "Commandes", url: "/dashboard/orders", icon: Package },
  { title: "Épreuves", url: "/dashboard/proofs", icon: FileText },
]

const menuItems = [
  { title: "Produits", url: "/dashboard/products", icon: Package },
  { title: "Fournisseurs", url: "/dashboard/suppliers", icon: Users },
  { title: "Employés", url: "/dashboard/admin/employees", icon: Users },
]

export function BottomNavigation() {
  const location = useLocation()
  const navigate = useNavigate()
  const currentPath = location.pathname
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const isActive = (path: string) => {
    if (path === "/dashboard") {
      return currentPath === "/dashboard" || currentPath.startsWith("/dashboard/clients/")
    }
    return currentPath.startsWith(path)
  }

  return (
    <>
      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-background/95 backdrop-blur-lg border-t border-border/20 safe-area-inset-bottom">
        <div className="flex items-center justify-around px-2 py-2">
          {navigationItems.map((item) => {
            const active = isActive(item.url)
            return (
              <NavLink
                key={item.title}
                to={item.url}
                className={cn(
                  "flex flex-col items-center justify-center min-w-0 flex-1 px-3 py-2 rounded-2xl transition-all duration-300 min-h-[64px] active:scale-95",
                  active 
                    ? "text-primary bg-primary/10" 
                    : "text-muted-foreground/70 hover:text-foreground hover:bg-muted/40"
                )}
              >
                <item.icon className={cn(
                  "h-5 w-5 mb-1 transition-all duration-300", 
                  active ? "text-primary scale-110 stroke-[2.5]" : "text-muted-foreground/70 stroke-[2]"
                )} />
                <span className={cn(
                  "text-[10px] font-medium leading-tight text-center max-w-full transition-all duration-300",
                  active ? "text-primary font-semibold" : "text-muted-foreground/70"
                )}>
                  {item.title}
                </span>
              </NavLink>
            )
          })}
          
          {/* Menu Button */}
          <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
            <SheetTrigger asChild>
              <div className="flex flex-col items-center justify-center min-w-0 flex-1 px-3 py-2 rounded-2xl transition-all duration-300 min-h-[64px] active:scale-95 cursor-pointer text-muted-foreground/70 hover:text-foreground hover:bg-muted/40">
                <Menu className="h-5 w-5 mb-1 stroke-[2]" />
                <span className="text-[10px] font-medium leading-tight text-center">Plus</span>
              </div>
            </SheetTrigger>
            <SheetContent side="bottom" className="h-[50vh]">
              <SheetHeader>
                <SheetTitle>Menu</SheetTitle>
              </SheetHeader>
              <div className="grid gap-4 py-6">
                {menuItems.map((item) => (
                  <Button
                    key={item.title}
                    variant="ghost"
                    className="justify-start h-14 text-base"
                    onClick={() => {
                      navigate(item.url)
                      setIsMenuOpen(false)
                    }}
                  >
                    <item.icon className="h-5 w-5 mr-3" />
                    {item.title}
                  </Button>
                ))}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </nav>
    </>
  )
}