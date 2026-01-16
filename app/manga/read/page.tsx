import {SephirahAPI_GetChapterInfo, SephirahAPI_GetTitleInfo} from "@/lib/api";
import {CommonErrorBox} from "@/lib/util/client";
import {MangaReader} from "@/app/manga/read/client";

export default async function Page(props: {
    searchParams: Promise<{
        title: string,
        chapter: string,
        provider: string,
    }>,
}) {
    const params = await props.searchParams;

    // load title data server side since it's probably cached
    const title = await SephirahAPI_GetTitleInfo(params.provider, params.title);
    if (!title.ok || !title.value) {
        return <CommonErrorBox error={title.ok ? new Error("Title not found") : title.value} />;
    }

    const chapterInfo = await SephirahAPI_GetChapterInfo(params.provider, params.title, params.chapter);
    if (!chapterInfo.ok || !chapterInfo.value) {
        return <CommonErrorBox error={chapterInfo.ok ? new Error("Chapter not found") : chapterInfo.value} />;
    }

    return (
        <MangaReader title={title.value} chapter={chapterInfo.value}/>
    )
}