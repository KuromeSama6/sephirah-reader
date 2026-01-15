"use client";

import {useState} from "react";
import Image from "next/image";

const DEFAULT_FALLBACK_SRC = "https://placehold.co/1441x2048/000/FFF?text=Load%20Failed&font=source-sans-pro";

export function ImageEx(props: {
    src: string;
    alt: string;
    width: number;
    height: number;
    className?: string;
    placeholder?: "blur" | "empty";
    blurDataURL?: string;
    fallbackSrc?: string;
}) {
    const [imgSrc, setImgSrc] = useState(props.src);
    const fallbackSrc = props.fallbackSrc || DEFAULT_FALLBACK_SRC;

    function OnError() {
        if (imgSrc !== fallbackSrc) {
            setImgSrc(fallbackSrc);
        }
    }

    return (
        <Image src={props.src} alt={props.alt} width={props.width} height={props.height} className={props.className} placeholder={props.placeholder} blurDataURL={props.blurDataURL} onError={OnError}/>
    )
}