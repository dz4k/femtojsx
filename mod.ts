
export namespace JSX {
    export interface IntrinsicElements {
        [elemName: string]: Record<string, string>;
    }

    export interface Element {
        type: "element";
        tag: string;
        props: Record<string, any>;
        children: VNode[];
    }
}

export type Component<T extends { children?: VNode[] }> = (props: T) => VNode;

export type VNode = {
  type: "text";
  text: string;
} | {
  type: "fragment";
  children: VNode[];
} | JSX.Element;

export function h<T extends { children?: VNode[] }>(
  tag: string | Component<T>,
  props: Exclude<T, "children">,
  ...children: (string | VNode | (string | VNode)[])[]
): VNode {
  if (typeof tag === "function") return tag({ ...props, children });
  return {
    type: "element",
    tag,
    props,
    children: children.flat().map((child) => {
      if (typeof child === "object") return child;
      return {
        type: "text",
        text: child?.toString() ?? "",
      };
    }),
  };
}

const selfClosing = new Set([
  "area",
  "base",
  "br",
  "col",
  "embed",
  "hr",
  "img",
  "input",
  "link",
  "meta",
  "param",
  "source",
  "track",
  "wbr",
]);

export function render(vn: VNode): string {
  if (vn.type === "text") return htmlescape(vn.text);
  if (vn.type === "fragment") return vn.children.map(render).join("");

  const { tag, props, children } = vn;

  const rv: string[] = [];
  rv.push("<");
  rv.push(tag);

  for (const prop in props) {
    rv.push(" ");
    rv.push(htmlescape(prop));
    rv.push('="');
    rv.push(htmlescape(props[prop]));
    rv.push('"');
  }
  rv.push(">");

  if (!selfClosing.has(tag)) {
    for (const child of children) {
      rv.push(render(child));
    }

    rv.push("</");
    rv.push(tag);
    rv.push(">");
  }
  return rv.join("");
}

export function Fragment({ children }: { children: VNode[] }): VNode {
  return { type: "fragment", children };
}

export function htmlescape(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/'/g, "&apos;")
    .replace(/"/g, "&quot;");
}
