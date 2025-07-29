import type { ReactElement } from "react";


export function SidebarItem({text,icon}:{
    text:string;
    icon:ReactElement;
}){
    return <div className="flex  text-purple-600 cursor-pointer hover:bg-slate-100 pl-4 ">
      <div className="p-2 items-center">{icon}</div>  
       <div className="p-2 items-center">{text}</div> 
    </div>
}