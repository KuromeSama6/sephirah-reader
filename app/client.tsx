"use client";
import {InputGroup, InputGroupAddon, InputGroupInput} from "@/components/ui/input-group";
import {MdBook, MdCircle, MdMoreHoriz, MdSearch} from "react-icons/md";
import {Button} from "@/components/ui/button";
import {FormEvent, FormEventHandler, useEffect, useState} from "react";
import {SephirahAPI_GetMangaProviderStatus, SephirahAPI_QuickSearch} from "@/lib/api";
import {Badge} from "@/components/ui/badge";
import {cn} from "@/lib/utils";
import {Spinner} from "@/components/ui/spinner";
import {toast} from "sonner";
import {ProviderEntry, QuickSearchResult} from "@/lib/data/manga";
import Image from 'next/image';
import {ImageEx} from "@/components/util/client";

type ResultEntry = [ProviderEntry, QuickSearchResult];

export function Search(props: {
    providerList: ProviderEntry[]
}) {
    const [query, setQuery] = useState("");
    const [loading, setLoading] = useState(false);

    const [results, setResults] = useState<ResultEntry[]>([]);

    async function Submit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();
        if (!query.trim()) return;
        if (loading) return;

        setLoading(true);
        setResults([]);

        let finishedCount = 0;
        for (const provider of props.providerList) {
            SephirahAPI_QuickSearch(provider.id, query.trim())
                .then(res => {
                    if (res.ok) {
                        for (const result of res.value) {
                            setResults(prevResults => ([...prevResults, [provider, result]]));
                        }
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
                    <InputGroupInput placeholder={"Look for a title..."} value={query} onChange={(e) => setQuery(e.target.value)}/>
                    <InputGroupAddon>
                        <MdBook/>
                    </InputGroupAddon>
                    {loading && (
                        <InputGroupAddon align={"inline-end"}>
                            <Spinner/>
                        </InputGroupAddon>
                    )}
                </InputGroup>
                <Button variant={"default"} disabled={!query.trim()} type={"submit"}>
                    <MdSearch/>
                    <span className={"hidden md:block"}>Search</span>
                </Button>
                <Button variant={"outline"}>
                    <MdMoreHoriz/>
                </Button>
            </form>
            <ProviderListPreview providers={props.providerList}/>
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
    const [provider, result] = props.entry;

    return (
        <div className={"flex gap-2 w-full p-2 border border-border rounded-md hover:bg-accent hover:cursor-pointer transition duration-200"}>
            <ImageEx src={result.coverUrl} alt={""} width={128} height={256} className={"object-cover min-w-24 md:min-w-32 rounded-md"} placeholder={"blur"} blurDataURL={"https://placehold.co/1441x2048/000/FFF?text=Image%20Loading&font=source-sans-pro"}/>
            <div className={"flex flex-col gap-1 ms-auto w-full justify-center"}>
                <span className={"text-muted-foreground text-sm"}>{provider.name}</span>
                <h1 className={"font-semibold text-xl md:text-2xl"}>{result.name}</h1>
                <span className={"text-muted-foreground text-sm"}>{result.authorName}</span>
            </div>
        </div>
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

            SephirahAPI_GetMangaProviderStatus(provider.id)
                .then(res => {
                    SetProviderStatus(provider.id, res.ok);
                    console.log(`Status of provider ${provider.id}: ${res.ok}`);
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