"use client";
import {
    InputGroup,
    InputGroupAddon,
    InputGroupButton,
    InputGroupInput,
    InputGroupText
} from "@/components/ui/input-group";
import {MdBook, MdCircle, MdMoreHoriz, MdSearch} from "react-icons/md";
import {Button} from "@/components/ui/button";
import {FormEvent, useEffect, useState} from "react";
import {API_GetMangaProviderStatus, API_QuickSearch} from "@/lib/api";
import {Badge} from "@/components/ui/badge";
import {cn, IsChinese} from "@/lib/utils";
import {Spinner} from "@/components/ui/spinner";
import {toast} from "sonner";
import {ProviderEntry, QuickSearchResult} from "@/lib/data/manga";
import {ImageEx} from "@/components/util/client";
import Fuse from "fuse.js";
import {ChineseSimplifiedToTraditional, ChineseTraditionalToSimplified} from "@/lib/opencc";
import Link from "next/link";
import {useTranslations} from "use-intl";

interface ResultEntry {
    provider: ProviderEntry,
    result: QuickSearchResult,
}

export function Search(props: {
    providerList: ProviderEntry[]
}) {
    const [query, setQuery] = useState("");
    const [loading, setLoading] = useState(false);
    const [searched, setSearched] = useState(false);
    const [results, setResults] = useState<ResultEntry[]>([]);
    const [isSimplifiedChinese, setIsSimplifiedChinese] = useState(true);
    const [loadedProviders, setLoadedProviders] = useState<string[]>([]);

    function OnSearchChange(text: string) {
        setQuery(text);
    }

    function ToggleChinese() {
        setIsSimplifiedChinese(!isSimplifiedChinese);

        if (isSimplifiedChinese) {
            setQuery(ChineseSimplifiedToTraditional(query));
        } else {
            setQuery(ChineseTraditionalToSimplified(query));
        }
    }

    function SortedResults(results: ResultEntry[], kw: string): ResultEntry[] {
        const fuse = new Fuse(results, {
            keys: ["result.name"],
            includeScore: true,
            threshold: 0.4,
        })
        const res = fuse.search(kw);

        return res.sort((a, b) => {
            const scoreDiff = (a.score ?? 0) - (b.score ?? 0);
            if (scoreDiff !== 0) return scoreDiff;

            // 2️⃣ secondary: ranking (higher ranking first)
            return b.item.result.ranking - a.item.result.ranking;
        }).map(c => c.item);
    }

    async function Submit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();
        const kw = query;

        if (!query.trim()) return;
        if (loading) return;

        setSearched(true);
        setLoading(true);
        setResults([]);
        setLoadedProviders([]);

        let finishedCount = 0;

        const results: ResultEntry[] = [];
        for (const provider of props.providerList) {
            API_QuickSearch(provider.id, kw.trim())
                .then(res => {
                    setLoadedProviders(prev => [...prev, provider.id]);

                    if (res.ok) {
                        for (const result of res.value) {
                            results.push({
                                provider,
                                result
                            });
                        }

                        setResults(SortedResults(results, kw));
                    }
                })
                .catch(e => {
                    toast.error(`Error searching in provider ${provider.name}: ${e.message}`);
                })
                .finally(() => {
                    finishedCount++;
                    if (finishedCount >= props.providerList.length) {
                        setLoading(false);
                    }
                });
        }
    }

    return (
        <div className={"flex flex-col gap-2 w-full"}>
            <form className={"flex gap-2 w-full items-center"} onSubmit={Submit}>
                <InputGroup>
                    <InputGroupInput placeholder={"Look for a title..."} value={query} onChange={(e) => OnSearchChange(e.target.value)}/>
                    <InputGroupAddon>
                        <MdBook/>
                    </InputGroupAddon>
                    {loading && (
                        <InputGroupAddon align={"inline-end"}>
                            <Spinner/>
                        </InputGroupAddon>
                    )}
                    {!loading && IsChinese(query) && (
                        <InputGroupAddon align={"inline-end"} onClick={ToggleChinese}>
                            <InputGroupButton>简⇄繁</InputGroupButton>
                        </InputGroupAddon>
                    )}
                </InputGroup>
                <Button variant={"default"} disabled={!query.trim() || loading} type={"submit"}>
                    <MdSearch/>
                    <span className={"hidden md:block"}>Search</span>
                </Button>
                <Button variant={"outline"}>
                    <MdMoreHoriz/>
                </Button>
            </form>
            {searched ? <SearchProviderList providers={props.providerList} results={results} loaded={loadedProviders}/> : <ProviderListPreview providers={props.providerList}/>}
            <div className={"flex flex-col gap-2 w-full"}>
                {
                    results.map((row, i) => (
                        <SearchResultBox key={i} entry={row}/>
                    ))
                }
            </div>
        </div>
    )
}

function SearchResultBox(props: {
    entry: ResultEntry,
}) {
    const {provider, result} = props.entry;

    return (
        <Link className={"flex gap-2 w-full p-2 border border-border rounded-md hover:bg-accent hover:cursor-pointer transition duration-200"} href={`/manga/title?provider=${provider.id}&title=${result.id}`} prefetch={false}>
            <ImageEx src={result.coverUrl} alt={""} width={128} height={256} className={"object-cover min-w-24 md:min-w-32 rounded-md"} placeholder={"blur"} blurDataURL={"https://placehold.co/1441x2048/000/FFF?text=Image%20Loading&font=source-sans-pro"}/>
            <div className={"flex flex-col gap-1 ms-auto w-full justify-center"}>
                <span className={"text-muted-foreground text-sm"}>{provider.name}</span>
                <h1 className={"font-semibold text-xl md:text-2xl"}>{result.name}</h1>
                <span className={"text-muted-foreground text-sm"}>{result.authorName}</span>
            </div>
        </Link>
    )
}

function ProviderListPreview(props: {
    providers: ProviderEntry[],
}) {
    type StatusRecord = Record<string, boolean | null>;

    const initialStatus: StatusRecord = {};
    for (const provider of props.providers) {
        initialStatus[provider.id] = null;
    }

    const [status, setStatus] = useState<Record<string, boolean | null>>(initialStatus);
    function SetProviderStatus(providerId: string, isOnline: boolean | null) {
        setStatus(prevStatus => ({
            ...prevStatus,
            [providerId]: isOnline,
        }));
    }

    useEffect(() => {
        for (const provider of props.providers) {
            if (status[provider.id] !== null) continue;

            API_GetMangaProviderStatus(provider.id)
                .then(res => {
                    SetProviderStatus(provider.id, res.ok);
                })
                .catch(err => {
                    console.error(`Failed to get status for provider ${provider.id}:`, err);
                    SetProviderStatus(provider.id, false);
                });
        }
    })

    return (
        <div className={"flex gap-2"}>
            {
                props.providers.map((p, i) => {
                    const color = status[p.id] === null ? "text-zinc-400" : status[p.id] ? "text-green-400" : "text-red-400";

                    return (
                        <Badge variant={"outline"} key={i}>
                            <MdCircle className={cn(color)}/>
                            {p.name}
                        </Badge>
                    );
                })
            }
        </div>
    )
}

function SearchProviderList(props: {
    loaded?: string[],
    providers: ProviderEntry[],
    results: ResultEntry[],
}) {
    type Status = number | Error;
    const data: Record<string, Status> = {};
    for (const provider of props.providers) {
        const count = props.results.filter(c => c.provider.id === provider.id);
        data[provider.id] = count.length;
    }

    const t = useTranslations();

    function IsLoaded(provider: ProviderEntry): boolean {
        return (props.loaded && props.loaded.includes(provider.id)) as boolean;
    }

    return (
        <div className={"flex gap-2"}>
            {
                props.providers.map((c, i) => {
                    const isErr = data[c.id] instanceof Error;

                    return (
                        <Badge key={i} variant={isErr ? "destructive" : "outline"}>
                            <span>{c.name}</span>
                            <span>{isErr ? t("generic.error") : !IsLoaded(c) ? <Spinner/> : String(data[c.id])}</span>
                        </Badge>
                    )
                })
            }
        </div>
    )
}