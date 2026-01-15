"use server";

import {Err, ErrStr, Ok, Result} from "@/lib/util/result";
import {QuickSearchResult, Title} from "@/lib/data/manga";
import {GetMangaProvider, MangaProviders} from "@/lib/provider/provider";

export async function SerphirahAPI_GetProviderList(): Promise<{
    id: string,
    name: string,
}[]> {
    return MangaProviders.map(c => ({
        id: c.id,
        name: c.displayName
    }));
}



export async function SephirahAPI_GetMangaProviderStatus(id: string): Promise<Result<void>> {
    const provider = GetMangaProvider(id);
    if (!provider) {
        return ErrStr(`Unknown provider id: ${id}`);
    }

    return Ok(void 0);
}

export async function SephirahAPI_QuickSearch(providerId: string, keyword: string): Promise<Result<QuickSearchResult[]>> {
    const provider = GetMangaProvider(providerId)!;
    return await provider.QuickSearch(keyword);
}