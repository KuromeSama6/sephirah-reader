import {Search} from "@/app/client";
import {SerphirahAPI_GetProviderList} from "@/lib/api";

export default async function Page() {
    const providers = await SerphirahAPI_GetProviderList();

    return (
        <div className={"flex items-center justify-center"}>
            <div className={"flex items-center justify-center flex-col gap-4 max-w-[90vw] md:max-w-[60vw] w-full"}>
                <div className={"mt-10 flex flex-col justify-center items-center"}>
                    <h1 className={"text-xl font-bold"}>Sephirah Reader</h1>
                    <p>The open-source web manga reader.</p>
                </div>
                <Search providerList={providers}/>
                <ProviderListPreview/>
            </div>
        </div>
    )
}

function ProviderListPreview() {


    return (
        <div>

        </div>
    )
}