import "server-only";
import {Author, Chapter, LocaleGroup, QuickSearchResult, Title, TitleStatus} from "@/lib/data/manga";
import {GetChaptersOpt, MangaProvider} from "@/lib/provider/provider";
import {getTranslations} from "next-intl/server";

const API_BASE_URL = "https://api.2025copy.com/api/v3";
const API_HEADER_VERSION = "2025.11.21";

function GetAPIRequestHeaders() {
    const ret = new Headers();
    ret.append("Origin", "https://www.mangacopy.com");
    ret.append("Host", "api.2025copy.com");
    ret.append("DNT", "1");
    ret.append("User-Agent", "Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1")

    ret.append("platform", "1");
    ret.append("version", API_HEADER_VERSION);
    ret.append("region", "1");
    ret.append("webp", " 1");
    return ret;
}

function GetAPIRequestURL(path: string): URL {
    const url = new URL(API_BASE_URL + path);
    url.searchParams.append("platform", "1");
    url.searchParams.append("_update", "true");
    url.searchParams.append("update", "true");

    return url;
}

export const CopyMangaProvider: MangaProvider = {
    id: "copymanga",
    displayName: "拷贝漫画",

    async GetStatus(): Promise<void> {
        const url = GetAPIRequestURL("/system/config/2020/1");

        const res = await fetch(url.toString(), {
            method: "GET",
            headers: GetAPIRequestHeaders(),
            cache: "force-cache",
            next: {
                revalidate: 1200,
            }
        })
        if (!res.ok) {
            throw `API request failed with status ${res.status}`;
        }
    },

    async QuickSearch(keyword: string): Promise<QuickSearchResult[]> {
        const url = GetAPIRequestURL("/search/comic");
        url.searchParams.append("q", keyword);
        url.searchParams.append("limit", "20");
        url.searchParams.append("offset", "0");
        url.searchParams.append("q_type", "");

        const res = await fetch(url.toString(), {
            method: "GET",
            headers: GetAPIRequestHeaders(),
            cache: "force-cache",
            next: {
                revalidate: 3600,
            }
        })
        if (res.status !== 200) throw `API request failed with status ${res.status}`;

        const body = await res.json();

        const list = body.results.list;

        return list.map(c => ({
            id: c.path_word,
            name: c.name,
            coverUrl: c.cover,
            authorName: c.author.map(d => d.name).join(", "), ranking: c.popularity,
        }));
    },

    async GetTitleInfo(id: string): Promise<Title> {
        const headers = GetAPIRequestHeaders();

        const url = GetAPIRequestURL(`/comic2/${id}`);
        const res = await fetch(url.toString(), {
            method: "GET",
            headers,
            cache: "force-cache",
            next: {
                revalidate: 3600,
            }
        })
        if (res.status !== 200) throw `API request failed with status ${res.status}`;

        const body = await res.json();
        const data = body.results;
        const comicData = data.comic;

        return {
            id,
            metadata: {
                name: comicData.name,
                description: comicData.brief,
                coverUrl: comicData.cover,
                status: comicData.status.value === 1 ? TitleStatus.COMPLETED : TitleStatus.ONGOING,
                authors: comicData.author.map((a: any) => ({
                    id: a.path_word,
                    name: a.name,
                })) as Author[],
            },
        };
    },

    async GetChapters(id: string, options?: GetChaptersOpt): Promise<LocaleGroup[]> {
        const CHUNK = 500;
        let offset = 0;
        let max = CHUNK;

        const headers = GetAPIRequestHeaders();
        const t = await getTranslations();

        const ret: LocaleGroup = {
            id: "default",
            locale: "zh",
            localizer: {
                id: "default",
                name: t("generic.default"),
            },
            chapterGroups: [],
        }

        const i18n = await getTranslations();

        while (offset < max) {
            const url = GetAPIRequestURL(`/comic/${id}/group/default/chapters`);
            url.searchParams.append("limit", "500");
            url.searchParams.append("offset", offset.toString());

            const res = await fetch(url.toString(), {
                method: "GET",
                headers,
                cache: "force-cache",
                next: {
                    revalidate: 3600,
                }
            })
            if (res.status !== 200) throw `API request failed with status ${res.status}`;

            const body = await res.json();
            max = body.results.total;
            offset += CHUNK;

            const list = body.results.list;

            for (const c of list) {
                let group = ret.chapterGroups.find(g => g.id === c.group_path_word);
                if (!group) {
                    group = {
                        id: c.group_path_word,
                        name: c.group_path_word.toLowerCase() === "default" ? i18n("generic.default") : c.group_name,
                        chapters: []
                    };
                    ret.chapterGroups.push(group);
                }

                group.chapters.push({
                    id: c.uuid,
                    ord: c.ordered,
                    name: c.name,
                });
            }

            // sort chapters
            for (const g of ret.chapterGroups) {
                g.chapters.sort((a, b) => a.ord - b.ord);
            }
        }

        return [ret];
    },

    async GetChapterInfo(titleId: string, id: string): Promise<Chapter> {
        const headers = GetAPIRequestHeaders();

        const url = GetAPIRequestURL(`/comic/${titleId}/chapter2/${id}`);
        const res = await fetch(url.toString(), {
            method: "GET",
            headers,
            cache: "force-cache",
            next: {
                revalidate: 3600,
            }
        })
        if (res.status !== 200) throw `API request failed with status ${res.status}`;

        const body = await res.json();
        const data = body.results;

        return {
            id: data.chapter.uuid,
            name: data.chapter.name,
            ord: data.chapter.ordered,
        };
    },

    async GetImageUrls(chapterId: string): Promise<string[]> {

        return [];
    }
}