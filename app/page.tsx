import {Search} from "@/app/client";
import {API_GetProviderList} from "@/lib/api";
import {useTranslations} from "use-intl";
import {getTranslations} from "next-intl/server";

export default async function Page() {
    const providers = await API_GetProviderList();
    const t = await getTranslations();

    return (
        <div className={"flex items-center justify-center"}>
            <div className={"flex items-center justify-center flex-col gap-4 max-w-[90vw] md:max-w-[60vw] w-full"}>
                <div className={"mt-10 flex flex-col justify-center items-center"}>
                    <h1 className={"text-xl font-bold"}>{t("global.title")}</h1>
                    <p>{t("home_page.subtitle")}</p>
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