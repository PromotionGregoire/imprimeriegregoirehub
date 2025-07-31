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
      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-background/95 backdrop-blur-lg border-t border-border/20 safe-area-inset-bottom">
        <div className="flex items-center justify-center px-3 py-2 sm:px-4 sm:py-3 max-w-screen-sm mx-auto">
          <div className="flex items-center justify-around w-full max-w-md gap-1 sm:gap-2">{/* Constrained width and proper spacing */}
          {navigationItems.map((item) => {
            const active = isActive(item.url)
            return (
              <NavLink
                key={item.title}
                to={item.url}
                className={cn(
                  "flex flex-col items-center justify-center min-w-0 flex-1 px-1 py-2 sm:px-2 sm:py-3 rounded-xl sm:rounded-2xl transition-all ease-uber min-h-[60px] sm:min-h-[68px] active:scale-95 max-w-[72px] sm:max-w-none",
                  active 
                    ? "text-[#5a7a51] bg-[#5a7a51]/10" 
                    : "text-muted-foreground/70 hover:text-foreground hover:bg-muted/40"
                )}
              >
                <item.icon className={cn(
                  "h-4 w-4 sm:h-5 sm:w-5 mb-1 sm:mb-1.5 transition-all ease-uber", 
                  active ? "text-[#5a7a51] scale-110 stroke-[2.5]" : "text-muted-foreground/70 stroke-[2]"
                )} />
                <span className={cn(
                  "text-[10px] sm:text-[11px] font-medium leading-tight text-center max-w-full transition-all ease-uber whitespace-nowrap overflow-hidden text-ellipsis",
                  active ? "text-[#5a7a51] font-semibold" : "text-muted-foreground/70"
                )}>
                  {item.title}
                </span>
              </NavLink>
            )
          })}
          
          {/* Menu Button */}
          <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
            <SheetTrigger asChild>
              <div className="flex flex-col items-center justify-center min-w-0 flex-1 px-1 py-2 sm:px-2 sm:py-3 rounded-xl sm:rounded-2xl transition-all ease-uber min-h-[60px] sm:min-h-[68px] active:scale-95 cursor-pointer text-muted-foreground/70 hover:text-foreground hover:bg-muted/40 max-w-[72px] sm:max-w-none">
                <Menu className="h-4 w-4 sm:h-5 sm:w-5 mb-1 sm:mb-1.5 stroke-[2]" />
                <span className="text-[10px] sm:text-[11px] font-medium leading-tight text-center whitespace-nowrap">Plus</span>
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
                <Separator className="my-2" />
                <Button
                  variant="ghost"
                  className="justify-start h-14 text-base text-destructive hover:text-destructive"
                  onClick={handleSignOut}
                >
                  <LogOut className="h-5 w-5 mr-3" />
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