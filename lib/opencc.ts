import * as OpenCC from "opencc-js";

export const ChineseSimplifiedToTraditional = OpenCC.Converter({
    from: "cn",
    to: "tw",
});

export const ChineseTraditionalToSimplified = OpenCC.Converter({
    from: "tw",
    to: "cn",
});