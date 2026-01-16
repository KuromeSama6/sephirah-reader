import {MangaInfo} from "@/app/manga/title/client";
import {SephirahAPI_GetMangaProviderStatus, SephirahAPI_GetProviderEntry} from "@/lib/api";

export default async function Page(props: {
    searchParams: Promise<{
        provider: string,
        title: string,
    }>,
}) {
    const params = await props.searchParams;
    const provider = await SephirahAPI_GetProviderEntry(params.provider);

    return (
        <MangaInfo provider={provider} titleId={params.title}/>
    )
}