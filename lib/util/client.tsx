"use client";

import {IProps, useLoadingBar} from "react-top-loading-bar";
import {Alert, AlertDescription, AlertTitle} from "@/components/ui/alert";
import {MdError} from "react-icons/md";
import {useTranslations} from "use-intl";

export function useDefaultLoadingBar(options?: IProps) {
    return useLoadingBar({
        ...options,
        color: "white",
        shadow: false,
        waitingTime: 250,
    });
}

export function CommonErrorBox(props: {
    error: Error,
}) {
    const t = useTranslations();

    return (
        <Alert variant={"destructive"}>
            <MdError/>
            <AlertTitle>
                {t("global.error.content_load_error")}
            </AlertTitle>
            <AlertDescription>
                {t("global.error.content_load_error_message", {
                    err: props.error.toString(),
                })}
            </AlertDescription>
        </Alert>
    )
}