import { MenuProvider } from "@/hooks/useMenu";
import MenuItems from "./MenuItem";

export default function Menu() {
  return <MenuProvider>
    <MenuItems />
  </MenuProvider>
}