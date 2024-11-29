export function getMonarchGrammar() {
  return {
    keywords: [
      "angle",
      "at",
      "from",
      "to",
      "default",
      "point",
      "cirlce",
      "arc",
      "horizontal",
      "length",
      "partial",
      "perpendicular",
      "rad",
      "radius",
      "samelength",
      "vertical",
    ],

    typeKeywords: ["Arc", "Circle", "Line", "Point", "Sketch"],

    measureKeywords: ["yd", "th", "m", "mm", "in", "ft", "dm", "deg", "cm"],

    actionKeywords: [
      "Constrain",
      "for",
      "import",
      "with",
      "parameter",
      "sin",
      "cos",
      "mod",
      "PI",
      "exp",
    ],

    operators: ["&", `'`, "*", "+", ",", "-", "->", "/", "=", "|", "°"],
    symbols: /&|'|\(|\)|\*|\+|,|-|->|\/|=|\||°/,

    tokenizer: {
      initial: [
        {
          regex: /[_a-zA-Z][\w_]*/,
          action: {
            cases: {
              "@keywords": { token: "keyword" },
              "@typeKeywords": { token: "keyword.type" },
              "@measureKeywords": { token: "keyword.measure" },
              "@actionKeywords": { token: "keyword.action" },
              "@default": { token: "ID" },
            },
          },
        },
        { regex: /[0-9]+(\.[0-9]*)?/, action: { token: "number" } },
        { include: "@whitespace" },
        {
          regex: /@symbols/,
          action: {
            cases: {
              "@operators": { token: "operator" },
              "@default": { token: "" },
            },
          },
        },
      ],
      whitespace: [
        { regex: /\s+/, action: { token: "white" } },
        { regex: /\/\/[^\n\r]*/, action: { token: "comment" } },
      ],
      comment: [],
    },
  };
}
