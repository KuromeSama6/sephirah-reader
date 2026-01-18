"use client";

import {ImageEx} from "@/components/util/client";
import {Badge} from "@/components/ui/badge";
import {MdBedtime, MdCancel, MdCheckCircle, MdGridView, MdQuestionMark, MdTableRows, MdUpdate} from "react-icons/md";
import {CommonErrorBox, useDefaultLoadingBar} from "@/lib/util/client";
import {useEffect, useState} from "react";
import {API_GetChapters, API_GetTitleInfo} from "@/lib/api";
import {Chapter, ChapterGroup, LocaleGroup, ProviderEntry, Title, TitleStatus} from "@/lib/data/manga";
import {Skeleton} from "@/components/ui/skeleton";
import {toast} from "sonner";
import {useTranslations} from "use-intl";
import {Toggle} from "@/components/ui/toggle";
import {Button} from "@/components/ui/button";
import {cn} from "@/lib/utils";
import Link from "next/link";

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

                const title = await API_GetTitleInfo(props.provider.id, props.titleId);
                setLoading(false);

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
                const chaptersRes = await API_GetChapters(props.provider.id, props.titleId, {
                    title: title.value!,
                });
                setChapters(chaptersRes.ok ? chaptersRes.value : []);

                if (!chaptersRes.ok) {
                    toast.error("Can't load chapters for this title", {
                        description: "Chapters may not be available for this title at the moment.",
                        position: "bottom-center",
                    })
                    return;
                }
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
                                {chapters && <MangaChapters chapters={chapters} provider={props.provider} title={title!}/>}
                            </>
                        )}
                    </div>
                </div>
            )}
        </>
    )
}

function MangaChapters(props: {
    provider: ProviderEntry,
    title: Title,
    chapters: LocaleGroup[],
}) {
    const t = useTranslations();
    const [selectedLocale, setSelectedLocale] = useState<LocaleGroup>(props.chapters[0]);
    const [selectedGroup, setSelectedGroup] = useState<ChapterGroup>(props.chapters[0].chapterGroups[0]);

    return (
        <div className={"flex flex-col gap-2 w-full mb-2"}>
            <div className={"flex gap-2 w-full items-center"}>
                <h1 className={"font-bold whitespace-nowrap"}>{t("manga_info_page.label_locales")}</h1>
                <hr className={"w-full"}/>
            </div>
            <div className={"flex gap-2 w-full"}>
                {
                    props.chapters?.map((c, i) => (
                        <Toggle key={i} variant={"outline"} size={"sm"} data-state={selectedLocale.id == c.id ? "on" : "off"} onToggle={() => setSelectedLocale(c)}>
                            {c.localizer ? `${c.localizer.name} (${c.locale.toUpperCase()})` : c.locale.toUpperCase()}
                        </Toggle>
                    ))
                }
            </div>
            <div className={"flex gap-2 w-full items-center"}>
                <h1 className={"font-bold whitespace-nowrap"}>{t("manga_info_page.label_chapter_groups")}</h1>
                <hr className={"w-full"}/>
            </div>
            <div className={"flex gap-2 w-full"}>
                { selectedLocale && selectedGroup &&
                    selectedLocale.chapterGroups.map((c, i) => (
                        <Toggle key={i} variant={"outline"} size={"sm"} data-state={selectedGroup.id == c.id ? "on" : "off"} onToggle={() => setSelectedGroup(c)}>
                            {`${c.name} (${c.chapters.length})`}
                        </Toggle>
                    ))
                }
            </div>
            <div className={"flex gap-2 w-full items-center"}>
                <h1 className={"font-bold whitespace-nowrap"}>{t("manga_info_page.label_chapters")}</h1>
                <hr className={"w-full"}/>
            </div>
            <div className={cn("grid gap-1 grid-cols-4 lg:grid-cols-8")}>
                { selectedLocale && selectedGroup &&
                    selectedGroup.chapters.map((c, i) => (
                        <ChapterButton key={i} chapter={c} provider={props.provider} title={props.title}/>
                    ))
                }
            </div>
        </div>
    )
}

function ChapterButton(props: {
    provider: ProviderEntry,
    title: Title,
    chapter: Chapter,
}) {
    return (
        <Link href={`/manga/read?chapter=${props.chapter.id}&provider=${props.provider.id}&title=${props.title.id}`} prefetch={false}>
            <Button size={"sm"} variant={"outline"} className={"w-full"}>
                <span className={"truncate"}>{props.chapter.name}</span>
            </Button>
        </Link>
    );
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
    const t = useTranslations();

    switch (props.status) {
        case TitleStatus.ONGOING: return (
            <Badge variant={"default"} className={"bg-blue-600 text-white"}>
                <MdUpdate/>
                {t("manga_info_page.status_badge.ongoing")}
            </Badge>
        )
        case TitleStatus.COMPLETED: return (
            <Badge>
                <MdCheckCircle/>
                {t("manga_info_page.status_badge.completed")}
            </Badge>
        )
        case TitleStatus.HIATUS: return (
            <Badge variant={"secondary"}>
                <MdBedtime/>
                {t("manga_info_page.status_badge.hiatus")}
            </Badge>
        )
        case TitleStatus.CANCELLED: return (
            <Badge variant={"destructive"}>
                <MdCancel/>
                {t("manga_info_page.status_badge.cancelled")}
            </Badge>
        )
        default: return (
            <Badge variant={"secondary"}>
                <MdQuestionMark/>
                {t("manga_info_page.status_badge.unknown")}
            </Badge>
        )
    }
}