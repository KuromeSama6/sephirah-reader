import {getRequestConfig} from 'next-intl/server';
import {cookies} from "next/dist/server/request/cookies";

export default getRequestConfig(async () => {
    const cookiesStore = await cookies();
    const locale = cookiesStore.get("locale")?.value || "en";

    return {
        locale,
        messages: (await import(`@/messages/${locale}.json`)).default,
    };
});