"use client"

import React, {useState} from "react";
import {Button} from "@/components/ui/button";
import {
    MdAccountCircle,
    MdAdd,
    MdFlag,
    MdGroup,
    MdGroups,
    MdHome,
    MdLeaderboard,
    MdLogin,
    MdMenu, MdOutlineSource, MdSettings
} from "react-icons/md";
import {usePathname, useRouter} from "next/navigation";
import Link from "next/link";
import {Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle} from "@/components/ui/sheet";
import {cn} from "@/lib/utils";

interface Option {
    path: string;
    name: string;
    icon: React.ReactNode;
    className?: string[];
    variant?: "link" | "default" | "destructive" | "outline" | "secondary" | "ghost" | null | undefined;
    color?: string;
}

const options: Option[] = [
    {
        path: "/",
        name: "Home",
        icon: <MdHome/>
    },
    {
        path: "/providers",
        name: "Providers",
        icon: <MdOutlineSource/>
    },
    {
        path: "/options",
        name: "Options",
        icon: <MdSettings/>
    },
    {
        path: "/accounts",
        name: "Accounts",
        icon: <MdAccountCircle/>,
        className: ["ms-auto"]
    }
]

export function Navbar() {
    const pathName = usePathname();

    const [showMenuDropdown, setShowMenuDropdown] = useState(false);

    return (
        <header className="flex sticky top-0 z-40 w-full bg-background border-b cursor-default">
            <div className={"flex items-center mx-2 md:mx-8 my-2 w-full gap-2"}>
                <Link href={"/"}>
                    <h1 className={"text-lg font-bold pr-2"}>Sephirah</h1>
                </Link>
                <div className={"hidden md:flex w-full"}>
                    {
                        options.map(c => {
                            return (
                                <Link href={c.path} key={c.path} className={(c.className ?? []).join(" ")}>
                                    <Button size={"lg"} color={c.color ?? "default"} variant={"ghost"}>
                                        {c.icon}
                                        <span className={"font-bold"}>{c.name}</span>
                                    </Button>
                                </Link>
                            )
                        })
                    }
                </div>
                <div className={"block md:hidden ms-auto"}>
                    <Button size={"icon"} variant={"ghost"} onClick={() => setShowMenuDropdown(true)}>
                        <MdMenu/>
                    </Button>

                    <Sheet open={showMenuDropdown} onOpenChange={setShowMenuDropdown}>
                        <SheetContent side={"top"}>
                            <SheetHeader>
                                <SheetTitle>Sephirah Reader</SheetTitle>
                                <SheetDescription>Sephirah Reader is an open source, web-based manga reader supporting multiple sources.</SheetDescription>
                            </SheetHeader>
                            <div className={"mx-2 mb-2 w-full flex flex-col gap-4"}>
                                {
                                    options.map(c => {
                                        return (
                                            <Link href={c.path} key={c.path} className={cn("w-full", c.className)} onClick={() => setShowMenuDropdown(false)}>
                                                <div className={cn("flex gap-2 items-center", pathName === c.path ? "" : "text-muted-foreground")}>
                                                    {c.icon}
                                                    <span className={pathName === c.path ? "font-bold" : ""}>{c.name}</span>
                                                </div>
                                            </Link>
                                        )
                                    })
                                }
                            </div>
                        </SheetContent>
                    </Sheet>
                </div>
            </div>
        </header>
    )
}