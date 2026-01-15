import {Result} from "@/lib/util/result";

export interface MangaProvider {
    readonly id: string;
    readonly displayName: string;

    GetStatus(): Promise<Result<void>>;
    QuickSearch(keyword: string): Promise<Result<QuickSearchResult[]>>;
}

export interface ProviderEntry {
    id: string,
    name: string,
}

export type QuickSearchResult = {
    readonly id: string;
    readonly name: string;
    readonly coverUrl: string;
    readonly authorName: string;
}

export interface Title {
    readonly id: string;
    readonly metadata: TitleMetadata;
    readonly locales: LocaleGroup;
}

export interface Chapter {
    readonly id: string;
    readonly ord: number;
    readonly name: string;
}

export interface LocaleGroup {
    readonly id: string;
    readonly locale: string;
    readonly localizer?: Localizer;
    readonly chapters: ChapterGroup[];
}

export interface ChapterGroup {
    readonly id: string;
    readonly name: string;
    readonly chapters: Chapter[];
}

export interface TitleMetadata {
    readonly name: string;
    readonly romanizedName?: string;
    readonly description: string;
    readonly coverUrl: string;
    readonly authors: Author[];
}

export interface Author {
    readonly id: string;
    readonly name: string;
}

export interface Localizer {
    readonly id: string;
    readonly name: string;
}