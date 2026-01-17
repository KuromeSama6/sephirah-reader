import {MangaInfo} from "@/app/manga/title/client";
import {API_GetMangaProviderStatus, API_GetProviderEntry} from "@/lib/api";

export default async function Page(props: {
    searchParams: Promise<{
        provider: string,
        title: string,
    }>,
}) {
    const params = await props.searchParams;
    const provider = await API_GetProviderEntry(params.provider);

    return (
        <MangaInfo provider={provider} titleId={params.title}/>
    )
}