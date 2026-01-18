"use client"

import React, {useState} from "react";
import {Button} from "@/components/ui/button";
import {
    MdAccountCircle,
    MdAdd,
    MdFlag,
    MdGroup,
    MdGroups,
    MdHome, MdLanguage,
    MdLeaderboard,
    MdLogin,
    MdMenu, MdOutlineSource, MdSettings
} from "react-icons/md";
import {usePathname, useRouter} from "next/navigation";
import Link from "next/link";
import {Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle} from "@/components/ui/sheet";
import {cn} from "@/lib/utils";
import {useTranslations} from "use-intl";
import {FaGithub} from "react-icons/fa";
import {LocaleType} from "@/i18n/locale";
import {getCookie} from "cookies-next/client";
import {API_SetLocale} from "@/lib/api";
import {Dialog, DialogContent, DialogFooter, DialogTitle} from "@/components/ui/dialog";
import {RadioGroup, RadioGroupItem} from "@/components/ui/radio-group";

interface Option {
    path: string;
    i18nKey: string;
    icon: React.ReactNode;
    className?: string[];
    variant?: "link" | "default" | "destructive" | "outline" | "secondary" | "ghost" | null | undefined;
    color?: string;
}

const options: Option[] = [
    {
        path: "/",
        i18nKey: "home",
        icon: <MdHome/>
    },
    {
        path: "/providers",
        i18nKey: "providers",
        icon: <MdOutlineSource/>
    },
    {
        path: "/options",
        i18nKey: "options",
        icon: <MdSettings/>
    },
    {
        path: "/accounts",
        i18nKey: "accounts",
        icon: <MdAccountCircle/>,
        className: ["ms-auto"]
    }
]

export function Navbar() {
    const pathName = usePathname();
    const t = useTranslations();

    const [showMenuDropdown, setShowMenuDropdown] = useState(false);
    const [showLanguageSelector, setShowLanguageSelector] = useState(false);

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
                                        <span className={"font-bold"}>{t("common.navbar.options." + c.i18nKey)}</span>
                                    </Button>
                                </Link>
                            )
                        })
                    }
                    <Button size={"lg"} variant={"ghost"} onClick={() => setShowLanguageSelector(true)}>
                        <MdLanguage/>
                        {t("global.label_language")}
                    </Button>
                    <LanguageSelector open={showLanguageSelector} onOpenChange={setShowLanguageSelector}/>
                    <Link href={"https://github.com/KuromeSama6/sephirah-reader"} target={"_blank"}>
                        <Button size={"lg"} variant={"ghost"}>
                            <FaGithub/>
                        </Button>
                    </Link>
                </div>
                <div className={"block md:hidden ms-auto"}>
                    <Button size={"lg"} variant={"ghost"} onClick={() => setShowLanguageSelector(true)}>
                        <MdLanguage/>
                        {t("global.label_language")}
                    </Button>
                    <Link href={"https://github.com/KuromeSama6/sephirah-reader"} target={"_blank"}>
                        <Button size={"lg"} variant={"ghost"}>
                            <FaGithub/>
                        </Button>
                    </Link>
                    <Button size={"icon"} variant={"ghost"} onClick={() => setShowMenuDropdown(true)}>
                        <MdMenu/>
                    </Button>
                    <NavbarDropdownMenu open={showMenuDropdown} setOpen={setShowMenuDropdown}/>
                </div>
            </div>
        </header>
    )
}

export function NavbarDropdownMenu(props: {
    open: boolean,
    setOpen: (open: boolean) => void,
}) {
    const pathName = usePathname();
    const t = useTranslations();

    return (
        <Sheet open={props.open} onOpenChange={props.setOpen}>
            <SheetContent side={"top"}>
                <SheetHeader>
                    <SheetTitle>{t("global.title")}</SheetTitle>
                    <SheetDescription>{t("home_page.subtitle")}</SheetDescription>
                </SheetHeader>
                <div className={"mx-2 mb-2 w-full flex flex-col gap-4"}>
                    {
                        options.map(c => {
                            return (
                                <Link href={c.path} key={c.path} className={cn("w-full", c.className)} onClick={() => props.setOpen(false)}>
                                    <div className={cn("flex gap-2 items-center", pathName === c.path ? "" : "text-muted-foreground")}>
                                        {c.icon}
                                        <span className={pathName === c.path ? "font-bold" : ""}>{t("common.navbar.options." + c.i18nKey)}</span>
                                    </div>
                                </Link>
                            )
                        })
                    }
                </div>
            </SheetContent>
        </Sheet>
    )
}

function LanguageSelector(props: {
    open: boolean,
    onOpenChange: (open: boolean) => void,
}) {
    const current = getCookie("locale") as LocaleType || "en";
    const t = useTranslations();

    interface Locale {
        value: LocaleType;
        label: string;
    }

    const locales: Locale[] = [
        {
            value: "en",
            label: "English"
        },
        {
            value: "zh",
            label: "中文"
        }
    ]

    const [selected, setSelected] = useState<LocaleType>(current);

    async function Submit() {
        props.onOpenChange(false);

        if (selected == current) return;
        await API_SetLocale(selected);
        window.location.reload();
    }

    return (
        <Dialog open={props.open} onOpenChange={props.onOpenChange}>
            <DialogContent>
                <DialogTitle>{t("global.language_selector.title")}</DialogTitle>
                <RadioGroup value={selected} onValueChange={v => setSelected(v as LocaleType)} className={"gap-2"}>
                    {
                        locales.map((c, i) => (
                            <div className={"flex gap-2 items-center"} key={i}>
                                <RadioGroupItem value={c.value} id={c.value}/>
                                <label htmlFor={c.value}>{c.label}</label>
                            </div>
                        ))
                    }
                </RadioGroup>
                <DialogFooter>
                    <Button onClick={Submit}>{t("generic.confirm")}</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}