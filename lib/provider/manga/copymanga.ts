import {Author, MangaProvider, QuickSearchResult, Title} from "@/lib/data/manga";
import {Err, ErrStr, Ok, Result} from "@/lib/util/result";

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

export const CopyMangaProvider: MangaProvider = {
    id: "copymanga",
    displayName: "拷贝漫画",

    async GetStatus(): Promise<Result<void>> {
        const url = new URL(API_BASE_URL + "/system/config/2020/1");
        try {
            const res = await fetch(url.toString(), {
                method: "GET",
                headers: GetAPIRequestHeaders(),
            })
            if (!res.ok) {
                return ErrStr(`API request failed with status ${res.status}`);
            }

            return Ok(void 0);

        } catch (err) {
            return Err(err as Error);
        }
    },

    async QuickSearch(keyword: string): Promise<Result<QuickSearchResult[]>> {
        const url = new URL(API_BASE_URL + "/search/comic");
        url.searchParams.append("platform", "1");
        url.searchParams.append("q", keyword);
        url.searchParams.append("limit", "20");
        url.searchParams.append("offset", "0");
        url.searchParams.append("q_type", "");
        url.searchParams.append("update", "true");

        try {
            const res = await fetch(url.toString(), {
                method: "GET",
                headers: GetAPIRequestHeaders(),
            })
            const body = await res.json();

            const list = body.results.list;

            return Ok(list.map(c => ({
                id: c.path_word,
                name: c.name,
                coverUrl: c.cover,
                authorName: c.author.map(d => d.name).join(", "),
            })));

        } catch (e) {
            return Err(e as Error);
        }
    }
}