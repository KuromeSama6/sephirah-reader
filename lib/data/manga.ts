import {Result} from "@/lib/util/result";
import {LocaleType} from "@/i18n/locale";

export interface ProviderEntry {
    id: string,
    name: string,
}

export interface QuickSearchResult {
    readonly id: string;
    readonly name: string;
    readonly coverUrl: string;
    readonly authorName: string;
    readonly ranking: number;
}

export interface Title {
    readonly id: string;
    readonly metadata: TitleMetadata;
}

export interface Chapter {
    readonly id: string;
    readonly ord: number;
    readonly name: string;
    readonly prevId?: string;
    readonly nextId?: string;
}

export interface LocaleGroup {
    readonly id: string;
    readonly locale: LocaleType;
    readonly localizer?: Localizer;
    readonly chapterGroups: ChapterGroup[];
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
    readonly status: TitleStatus;
}

export interface Author {
    readonly id: string;
    readonly name: string;
}

export interface Localizer {
    readonly id: string;
    readonly name: string;
}

export enum TitleStatus {
    ONGOING,
    COMPLETED,
    HIATUS,
    CANCELLED,
}