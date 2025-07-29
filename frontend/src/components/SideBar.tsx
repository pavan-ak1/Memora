import { TwitterIcon } from "../icons/Twitter";
import { YoutubeIcon } from "../icons/YoutubeIcon";
import { SidebarItem } from "./SideBarItem";
import { LogoIcon } from "../icons/Logo";

export function SideBar() {
  return (
    <div className="h-screen bg-white border-r w-72 fixed left-0 top-0 ">
        <div className="flex text-2xl pl-0 items-center">
            <LogoIcon/>
            <div className="pt-2 text-purple-900 ">Memora</div>
        </div>
      <div className="pt-4">
        <SidebarItem text="Twitter" icon={<TwitterIcon/>}/>
        <SidebarItem text="Youtube" icon={<YoutubeIcon/>}/>
      </div>
    </div>
  );
}
