import "server-only";
import {CopyMangaProvider} from "@/lib/provider/manga/copymanga";
import {MangaProvider} from "@/lib/data/manga";

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