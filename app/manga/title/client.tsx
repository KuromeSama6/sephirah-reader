"use client";

import {ImageEx} from "@/components/util/client";
import {Badge} from "@/components/ui/badge";
import {MdBedtime, MdCancel, MdCheckCircle, MdUpdate} from "react-icons/md";
import {Alert, AlertDescription, AlertTitle} from "@/components/ui/alert";
import {CommonErrorBox, useDefaultLoadingBar} from "@/lib/util/client";
import {useEffect, useState} from "react";
import {SephirahAPI_GetChapters, SephirahAPI_GetTitleInfo} from "@/lib/api";
import {LocaleGroup, ProviderEntry, Title, TitleStatus} from "@/lib/data/manga";
import {Skeleton} from "@/components/ui/skeleton";
import {toast} from "sonner";

export function MangaInfo(props: {
    provider: ProviderEntry,
    titleId: string,
}) {
    const [loading, setLoading] = useState<boolean>(true);
    const [title, setTitle] = useState<Title | null>();
    const [chapters, setChapters] = useState<LocaleGroup[]>();
    const [err, setErr] = useState<Error>();

    const loadingBar = useDefaultLoadingBar();

    useEffect(() => {
        if (loading) {
            async function LoadTitle() {
                setLoading(true);
                setTitle(undefined);
                loadingBar.start();

                const title = await SephirahAPI_GetTitleInfo(props.provider.id, props.titleId);

                setTitle(title.ok ? title.value : null);
                if (!title.ok) {
                    setErr(title.value);

                    toast.error("Can't load this title", {
                        description: "Check if you have entered the correct URL, or if this provider is working properly.",
                        position: "bottom-center",
                    })
                    return;
                }

                // get chapters
                const chapters = await SephirahAPI_GetChapters(props.provider.id, props.titleId);
                setChapters(chapters.ok ? chapters.value : []);
            }

            LoadTitle()
                .then(() => {
                    loadingBar.complete();
                });
        }

        return () => {
            if (loading) loadingBar.complete();
        }
    }, []);

    return (
        <>
            {loading && <MangaInfoSkeleton/>}
            {!loading && (
                <div className={"flex px-2 w-full justify-center mt-2 md:mt-4"}>
                    <div className={"flex flex-col gap-2 w-full md:max-w-[80vh]"}>
                        {err && <CommonErrorBox error={err}/>}
                        {title && (
                            <>
                                <div className={"w-full flex gap-2"}>
                                    <ImageEx className={"rounded-md w-32 min-w-32"} src={title.metadata.coverUrl} alt={"cover"} width={128} height={128}/>
                                    <div className={"flex flex-col gap-1 w-auto"}>
                                        <Badge variant={"outline"}>{props.provider.name}</Badge>
                                        <h1 className={"text-xl md:text-2xl font-bold"}>{title.metadata.name}</h1>
                                        <p className={"text-muted-foreground text-sm"}>{title.metadata.authors[0].name}</p>
                                        <div className={"flex gap-2"}>
                                            <MangaStatusBadge status={title.metadata.status}/>
                                        </div>
                                    </div>
                                </div>
                                <div className={"flex gap-2"}>
                                    <p className={"text-muted-foreground text-sm md:text-base"}>{title.metadata.description}</p>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}
        </>
    )
}

function MangaInfoSkeleton() {
    return (
        <div className={"flex px-2 w-full justify-center mt-2 md:mt-4"}>
            <div className={"flex flex-col gap-2 w-full md:max-w-[80vh]"}>
                <div className={"w-full flex gap-2"}>
                    <Skeleton className={"w-32 h-48"}/>
                    <div className={"flex flex-col gap-1 w-auto"}>
                        <Skeleton className={"w-16 h-6"}/>
                        <Skeleton className={"w-64 h-10"}/>
                        <Skeleton className={"w-16 h-6"}/>
                    </div>
                </div>
                <div className={"flex flex-col gap-2"}>
                    <Skeleton className={"w-full h-4"}/>
                    <Skeleton className={"w-full h-4"}/>
                    <Skeleton className={"w-full h-4"}/>
                    <Skeleton className={"w-full h-4"}/>
                    <Skeleton className={"w-full h-4"}/>
                    <Skeleton className={"w-full h-4"}/>
                </div>
            </div>
        </div>
    )
}

function MangaStatusBadge(props: {
    status: TitleStatus,
}) {
    switch (props.status) {
        case TitleStatus.ONGOING: return (
            <Badge variant={"default"} className={"bg-blue-600 text-white"}>
                <MdUpdate/>
                Ongoing
            </Badge>
        )
        case TitleStatus.COMPLETED: return (
            <Badge>
                <MdCheckCircle/>
                Completed
            </Badge>
        )
        case TitleStatus.HIATUS: return (
            <Badge variant={"secondary"}>
                <MdBedtime/>
                Hiatus
            </Badge>
        )
        case TitleStatus.CANCELLED: return (
            <Badge variant={"destructive"}>
                <MdCancel/>
                Cancelled
            </Badge>
        )
        default: return (
            <Badge variant={"default"} className={"bg-blue-600 text-white"}>
                <MdUpdate/>
                Updating
            </Badge>
        )
    }
}