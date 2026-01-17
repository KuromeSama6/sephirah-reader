import {MangaReader} from "@/app/manga/read/client";

export default async function Page(props: {
    searchParams: Promise<{
        title: string,
        chapter: string,
        provider: string,
    }>,
}) {
    const params = await props.searchParams;

    return (
        <MangaReader title={params.title} chapter={params.chapter} providerId={params.provider}/>
    )
}