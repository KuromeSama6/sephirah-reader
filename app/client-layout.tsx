"use client";

import {ThemeProvider} from "next-themes";
import {ReactNode} from "react";
import {Navbar} from "@/components/common/Navbar";
import {Button} from "@/components/ui/button";
import {Toaster} from "sonner";

export function ClientLayout(props: {
    children: ReactNode;
}) {
    return (
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
            <Navbar/>
            <div>
                {props.children}
            </div>
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