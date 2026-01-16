"use server";

import {Err, ErrStr, Ok, Result} from "@/lib/util/result";
import {Chapter, LocaleGroup, ProviderEntry, QuickSearchResult, Title} from "@/lib/data/manga";
import {GetChaptersOpt, GetMangaProvider, MangaProviders} from "@/lib/provider/provider";

export async function SephirahAPI_GetProviderList(): Promise<ProviderEntry[]> {
    return MangaProviders.map(c => ({
        id: c.id,
        name: c.displayName
    }));
}

export async function SephirahAPI_GetProviderEntry(providerId: string): Promise<ProviderEntry> {
    const provider = GetMangaProvider(providerId);
    if (!provider) {
        throw new Error(`Unknown provider id: ${providerId}`);
    }

    return {
        id: provider.id,
        name: provider.displayName
    };
}

export async function SephirahAPI_GetMangaProviderStatus(id: string): Promise<Result<void>> {
    const provider = GetMangaProvider(id);
    if (!provider) {
        return ErrStr(`Unknown provider id: ${id}`);
    }

    await provider.GetStatus();

    return Ok(void 0);
}

export async function SephirahAPI_QuickSearch(providerId: string, keyword: string): Promise<Result<QuickSearchResult[]>> {
    const provider = GetMangaProvider(providerId)!;
    try {
        return Ok(await provider.QuickSearch(keyword));
    } catch (error) {
        return Err(error as Error);
    }
}

export async function SephirahAPI_GetTitleInfo(providerId: string, titleId: string): Promise<Result<Title>> {
    const provider = GetMangaProvider(providerId)!;
    try {
        return Ok(await provider.GetTitleInfo(titleId));
    } catch (error) {
        return Err(error as Error);
    }
}

export async function SephirahAPI_GetChapters(providerId: string, titleId: string, opts?: GetChaptersOpt): Promise<Result<LocaleGroup[]>> {
    const provider = GetMangaProvider(providerId)!;
    try {
        const chapters = await provider.GetChapters(titleId, opts);
        return Ok(chapters);
    } catch (error) {
        return Err(error as Error);
    }
}

export async function SephirahAPI_GetChapterInfo(providerId: string, titleId: string, chapterId: string): Promise<Result<Chapter>> {
    const provider = GetMangaProvider(providerId)!;
    try {
        const chapters = await provider.GetChapterInfo(titleId, chapterId);
        return Ok(chapters);
    } catch (error) {
        return Err(error as Error);
    }
}