"use client";

import {ThemeProvider} from "next-themes";
import {ReactNode, useEffect, useRef} from "react";
import {Navbar} from "@/components/common/navbar";
import {Button} from "@/components/ui/button";
import {Toaster} from "sonner";
import LoadingBar, {LoadingBarContainer, LoadingBarRef} from "react-top-loading-bar";
import {usePathname, useSearchParams} from "next/navigation";
import {useDefaultLoadingBar} from "@/lib/util/client";

export function ClientLayout(props: {
    children: ReactNode;
}) {
    const path = usePathname();
    const isReader = path == "/manga/read";

    return (
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
            {!isReader && <Navbar/>}
            <LoadingBarContainer>
                <div>
                    {props.children}
                </div>
            </LoadingBarContainer>
            <div className={"absolute bottom-0 w-full flex items-center justify-center"}>
                <Footer/>
            </div>
            <Toaster
                position={"bottom-right"}
                expand
                richColors
                theme={"dark"}
                duration={5000}
            />
        </ThemeProvider>
    );
}

export function Footer() {
    return (
        <div>
        </div>
    )
}