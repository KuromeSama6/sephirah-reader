"use client";

import {Chapter, ProviderEntry, Title} from "@/lib/data/manga";
import {useDefaultLoadingBar} from "@/lib/util/client";
import {useEffect, useRef, useState} from "react";
import {ImageEx} from "@/components/util/client";
import {SephirahAPI_GetChapterInfo, SephirahAPI_GetImageURLs, SephirahAPI_GetTitleInfo} from "@/lib/api";
import {useTranslations} from "use-intl";
import {cn} from "@/lib/utils";
import {Skeleton} from "@/components/ui/skeleton";
import {MangaReaderMenu} from "@/app/manga/read/menu";

export function MangaReader(props: {
    providerId: string,
    title: string,
    chapter: string,
}) {
    const loadingBar = useDefaultLoadingBar();
    const [loading, setLoading] = useState(true);

    const [title, setTitle] = useState<Title>();
    const [chapter, setChapter] = useState<Chapter>();
    const [urls, setUrls] = useState<string[]>();

    useEffect(() => {
        async function Load() {
            loadingBar.start();

            const title = await SephirahAPI_GetTitleInfo(props.providerId, props.title);
            if (!title.ok || !title.value) {
                console.error("Failed to load title/chapter", title.value);
                return;
            }
            setTitle(title.value);

            const chapter = await SephirahAPI_GetChapterInfo(props.providerId, props.title, props.chapter);
            if (!chapter.ok || !chapter.value) {
                console.error("Failed to load title/chapter", chapter.value);
                return;
            }
            setChapter(chapter.value);

            const urls = await SephirahAPI_GetImageURLs(props.providerId, props.title, props.chapter);
            if (!urls.ok || !urls.value || urls.value.length === 0) {
                console.error("Failed to load image URLs", urls.ok ? "No URLs found" : urls.value);
                return;
            }

            setUrls(urls.value);
        }

        Load().then(() => {
            loadingBar.complete();
            setLoading(false);
        });

        return () => {
            loadingBar.complete();
        }
    }, []);

    return (
        <div>
            {loading && (title && chapter ? <ReaderPreview title={title} chapter={chapter}/> : <ReaderSkeleton/>)}
            {!loading &&
                <>
                    {urls && <VerticalScrollReader urls={urls}/>}
                    <MangaReaderMenu title={title} chapter={chapter} providerId={props.providerId}/>
                </>
            }
        </div>
    )
}

function ReaderSkeleton() {
    return (
        <div className={"mt-32 w-full flex flex-col items-center gap-2 px-6"}>
            <Skeleton className={"h-50 w-[50%] rounded-md"}/>
            <Skeleton className={"h-10 w-50"}/>
            <Skeleton className={"h-6 w-30"}/>
        </div>
    )
}

function ReaderPreview(props: {
    title: Title,
    chapter: Chapter,
}) {
    return (
        <div className={"mt-32 w-full flex flex-col items-center gap-2 px-6"}>
            <ImageEx src={props.title.metadata.coverUrl} alt={"cover"} width={1024} height={2048} className={"w-[50%] rounded-md"}/>
            <h1 className={"text-xl font-bold"}>{props.title.metadata.name}</h1>
            <p className={"text-sm text-muted-foreground"}>{props.chapter.name}</p>
        </div>
    )
}

function VerticalScrollReader(props: {
    urls: string[],
}) {
    return (
        <div className={"flex flex-col w-full"}>
            {
                props.urls.map((c, i) => (
                    <ReaderPage url={c} key={i} index={i + 1} observeScroll={false}/>
                ))
            }
        </div>
    )
}

function ReaderPage(props: {
    url: string,
    postProcessor?: (ctx: CanvasRenderingContext2D) => void,
    index: number,
    observeScroll: boolean,
}) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    const src = `/api/proxy/image?url=${encodeURIComponent(props.url)}`;
    const postProcessor = props.postProcessor;
    const t = useTranslations();

    const [visible, setVisible] = useState(false);
    const [loaded, setLoaded] = useState(false);
    const [error, setError] = useState(false);

    useEffect(() => {
        const el = containerRef.current;
        if (!el) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setVisible(true);
                    observer.disconnect();
                }
            },
            {
                rootMargin: "400px",
            }
        );

        observer.observe(el);
        return () => {
            observer.disconnect();
        }
    }, []);

    useEffect(() => {
        if (!visible || loaded) return;

        const canvas = canvasRef.current;
        if (!canvas) {
            console.warn("Canvas not found");
            return;
        }
        const ctx = canvas.getContext("2d");
        if (!ctx) {
            console.warn("Canvas context not found");
            return;
        }

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const image = new Image();
        image.onload = () => {
            // set canvas size
            canvas.width = image.width;
            canvas.height = image.height;

            // draw image
            ctx.drawImage(image, 0, 0);

            if (postProcessor) {
                postProcessor(ctx);
            }

            setLoaded(true);
        }

        image.onerror = (e) => {
            console.error(e);
            setLoaded(true);
            setError(true);
        }

        image.src = src;
        image.crossOrigin = "anonymous";

    }, [src, postProcessor, visible]);

    return (
        <div className={"w-full md:max-w-[50vw] mx-auto min-h-50"} ref={containerRef}>
            <canvas ref={canvasRef} className={cn("w-full", !loaded || error ? "hidden" : "")}/>
            {(!loaded || error) &&
                <div className={"w-full flex flex-col h-128 items-center justify-center gap-2"}>
                    <h1 className={"text-muted-foreground font-bold text-[150px]"}>{props.index}</h1>
                    {error && <p className={"text-destructive"}>{t("reader.image_load_error")}</p>}
                </div>
            }
        </div>
    )
}