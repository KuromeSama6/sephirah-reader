"use client";
import {Chapter, Title} from "@/lib/data/manga";
import { useWindowScroll } from "@uidotdev/usehooks";
import {Button} from "@/components/ui/button";
import {MdArrowBack, MdArrowForward, MdArrowLeft, MdBook, MdHome, MdMenu, MdOutlineArrowLeft} from "react-icons/md";
import {useEffect, useRef, useState} from "react";
import {NavbarDropdownMenu} from "@/components/common/navbar";
import {cn} from "@/lib/utils";
import {useRouter} from "next/navigation";

export function MangaReaderMenu(props: {
    providerId: string,
    title?: Title,
    chapter?: Chapter,
}) {
    const [visible, setVisible] = useState(true);
    const lastScrollY = useRef(0);
    const ticking = useRef(false);

    useEffect(() => {
        const onScroll = () => {
            if (ticking.current) return;

            ticking.current = true;

            requestAnimationFrame(() => {
                const currentY = window.scrollY;
                const viewportBottom = window.innerHeight + currentY;
                const pageHeight = document.documentElement.scrollHeight;

                const isAtBottom = viewportBottom >= pageHeight - 5;

                if (isAtBottom) {
                    setVisible(true);
                } else if (currentY > lastScrollY.current && currentY > 50) {
                    // scrolling down
                    setVisible(false);
                } else {
                    // scrolling up
                    setVisible(true);
                }

                lastScrollY.current = currentY;
                ticking.current = false;
            });
        };

        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    return (
        <>
            {props.title && props.chapter && <MangaReaderTopbar visible={visible} title={props.title} chapter={props.chapter}/>}
            <MangaReaderBottomBar visible={visible} chapter={props.chapter} providerId={props.providerId} title={props.title} />
        </>
    )
}

function MangaReaderTopbar(props: {
    visible: boolean,
    title: Title,
    chapter: Chapter,
}) {
    const [openMenu, setOpenMenu] = useState(false);

    return (
        <>
            <NavbarDropdownMenu open={openMenu} setOpen={setOpenMenu}/>
            <div className={cn("top-0 flex gap-2 w-full h-15 z-50 backdrop-blur-md backdrop-brightness-[0.2] px-5 fixed items-center transition-transform", props.visible ? "translate-y-0" : "-translate-y-full")}>
                <div className={"flex flex-col gap-1 justify-center"}>
                    <h1 className={"text-muted-foreground text-xs md:text-sm truncate" }>{props.title.metadata.name}</h1>
                    <h1 className={"font-bold"}>{props.chapter.name}</h1>
                </div>
                <div className={"ms-auto"}>
                    <Button size={"icon"} variant={"ghost"} onClick={() => setOpenMenu(true)}>
                        <MdMenu/>
                    </Button>
                </div>
            </div>
        </>
    )
}

function MangaReaderBottomBar(props: {
    visible: boolean,
    providerId?: string,
    title?: Title,
    chapter?: Chapter,
}) {
    const router = useRouter();
    function SwitchTo(chapterId: string) {
        if (!props.title) return;
        router.push(`/manga/read?chapter=${chapterId}&provider=${props.providerId}&title=${props.title.id}`);
        window.location.reload();
    }

    return (
        <div className={cn("bottom-[-1] md:bottom-0 flex gap-2 w-full h-15 z-50 backdrop-blur-md backdrop-brightness-[0.2] px-2 fixed items-center transition-transform", props.visible ? "translate-y-0" : "translate-y-full")}>
            <Button variant={"outline"} size={"icon-lg"} disabled={!(props.chapter && props.chapter.prevId)} onClick={() => SwitchTo(props.chapter!.prevId!)}>
                <MdArrowBack/>
            </Button>
            <Button variant={"outline"} size={"icon-lg"} className={"ms-auto"} disabled={!(props.chapter && props.chapter.nextId)} onClick={() => router.push(`/manga/title?provider=${props.providerId}&title=${props.title!.id}`)}>
                <MdBook/>
            </Button>
            <Button variant={"outline"} size={"icon-lg"} disabled={!(props.chapter && props.chapter.nextId)} onClick={() => router.push("/")}>
                <MdHome/>
            </Button>
            <Button variant={"outline"} size={"icon-lg"} className={"ms-auto"} disabled={!(props.chapter && props.chapter.nextId)} onClick={() => SwitchTo(props.chapter!.nextId!)}>
                <MdArrowForward/>
            </Button>
        </div>
    )
}