import type {Metadata} from "next";
import {Geist, Geist_Mono} from "next/font/google";
import "./globals.css";
import {ClientLayout} from "@/app/client-layout";
import {Toaster} from "sonner";

export const metadata: Metadata = {
    title: "Sephirah Reader",
    description: "Comic reader supporting multiple sources",
};

export default function RootLayout(props: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" suppressHydrationWarning>
        <body>
            <ClientLayout>
                {props.children}
            </ClientLayout>
            <Toaster
                position={"bottom-right"}
                expand
                richColors
                duration={5000}
            />
        </body>
        </html>
    );
}
