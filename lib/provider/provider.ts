import "server-only";
import {CopyMangaProvider} from "@/lib/provider/manga/copymanga";
import {Result} from "@/lib/util/result";
import {Chapter, LocaleGroup, QuickSearchResult, Title} from "@/lib/data/manga";

export type GetChaptersOpt = {
    title: Title,
};

export interface MangaProvider {
    readonly id: string;
    readonly displayName: string;

    GetStatus(): Promise<void>;
    QuickSearch(keyword: string): Promise<QuickSearchResult[]>;
    GetTitleInfo(id: string): Promise<Title>;
    GetChapters(id: string, options?: GetChaptersOpt): Promise<LocaleGroup[]>;
    GetChapterInfo(titleId: string, id: string): Promise<Chapter>;
    GetImageUrls(titleId: string, chapterId: string): Promise<string[]>;
}

export const MangaProviders: MangaProvider[] = [
    CopyMangaProvider,
];

export function GetMangaProvider(id: string): MangaProvider | null {
    for (const provider of MangaProviders) {
        if (provider.id === id) {
            return provider;
        }
    }
    return null;
}