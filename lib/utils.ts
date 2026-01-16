import {clsx, type ClassValue} from "clsx"
import {twMerge} from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

export function IsChinese(text: string) {
    const chineseRegex = /[\u4e00-\u9fa5]/;
    return chineseRegex.test(text);
}