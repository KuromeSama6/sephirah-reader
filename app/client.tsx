"use client";
import {InputGroup, InputGroupAddon, InputGroupInput} from "@/components/ui/input-group";
import {MdBook, MdCircle, MdMoreHoriz, MdSearch} from "react-icons/md";
import {Button} from "@/components/ui/button";
import {useEffect, useState} from "react";
import {SephirahAPI_GetMangaProviderStatus, SephirahAPI_QuickSearch} from "@/lib/api";
import {Badge} from "@/components/ui/badge";
import {cn} from "@/lib/utils";

type ProviderEntry = {
    id: string,
    name: string
}

export function Search(props: {
    providerList: ProviderEntry[]
}) {
    const [query, setQuery] = useState("");

    async function Submit() {
        if (!query.trim()) return;

        const res = await SephirahAPI_QuickSearch("copymanga", query.trim());
        setQuery("");
    }

    return (
        <div className={"flex flex-col gap-2 w-full"}>
            <form className={"flex gap-2 w-full items-center"} action={Submit}>
                <InputGroup>
                    <InputGroupInput placeholder={"Look for a title..."} value={query} onChange={(e) => setQuery(e.target.value)}/>
                    <InputGroupAddon>
                        <MdBook/>
                    </InputGroupAddon>
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