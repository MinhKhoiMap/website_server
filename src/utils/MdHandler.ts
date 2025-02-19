import * as fs from "fs";
import matter from "gray-matter";
import path from "path";
import { Node, Parent } from "unist";
import yaml from "js-yaml";

import {
  PageInfoSchema,
  PageInfoType,
} from "@/schemaValidation/pageInfo.schema";
import { SafeParseReturnType, z } from "zod";

let visit: any;

interface matterRaw {
  data: {
    [key: string]: any;
  };
  content: string;
}

interface ElementNodeType extends Node {
  tagName?: string;
  properties?: Record<string, any>;
  value?: string;
  children?: ElementNodeType[];
  [key: string]: any;
}

// Dynamic imports
(async function () {
  visit = (await import("unist-util-visit")).visit;
})();

function customImagePlugin<Tree>(): (tree: Tree) => void {
  return (tree: Tree) => {
    visit(
      tree,
      "element",
      (node: any, index: number | null, parent: any | null) => {
        if (node.tagName !== "img" || !parent || index === null) return;

        const imageSrc: string = !String(node.properties.src).startsWith("/")
          ? `/${node.properties.src}`
          : node.properties.src;

        const imgNode: ElementNodeType = {
          type: "element",
          tagName: "img",
          properties: {
            src: `http://${process.env.SERVER_HOST_NAME}:${process.env.SERVER_PORT}/${process.env.STATIC_DIR}/static${imageSrc}`,
            loading: "lazy",
            class: node.properties.class,
            id: node.properties.id,
          },
        };

        if (parent.tagName !== "figure") {
          // const figcaptionNode: ElementNodeType = {
          //   type: "element",
          //   tagName: "figcaption",
          //   properties: {
          //     className: "text-center font-italic mt-1",
          //   },
          //   children: [{ type: "text", value: node.properties.alt }],
          // };

          // console.log(parent.tageName)

          const figureNode: ElementNodeType = {
            type: "element",
            tagName: "figure",
            properties: {
              class: "w-100",
              style:
                "display: flex; flex-direction: column; align-items: center; justify-content: center",
            },
            children: node.properties.alt ? [imgNode] : [imgNode],
          };
          parent.children[index] = figureNode;
        } else {
          parent.children[index] = imgNode;
        }
      }
    );
  };
}

export const md2html: (result: string) => Promise<string> = async (
  md: string
) => {
  const unified = (await import("unified")).unified;
  const remarkParse = (await import("remark-parse")).default;
  const remarkRehype = (await import("remark-rehype")).default;
  const rehypeStringify = (await import("rehype-stringify")).default;
  const rehypeAttr = (await import("rehype-attr")).default;
  const rehypeRaw = (await import("rehype-raw")).default;

  const res = await unified()
    .use(remarkParse)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeRaw)
    .use(rehypeAttr, { properties: "attr" })
    .use(customImagePlugin)
    .use(rehypeStringify)
    .process(md);

  return res.toString();
};

async function contentReader<Output>(
  file: FileType,
  schema: z.Schema,
  options?: {
    preHandler?: (objectRaw: matterRaw) => matterRaw;
    preSerialization?: (res: Output) => Output | Promise<Output>;
  }
): Promise<Output> {
  let info: SafeParseReturnType<Output, Output>;
  const post: Output = await new Promise((resolve) => {
    fs.readFile(file.fullPath, async (e, dataBuff) => {
      if (e) {
        console.error(e);
        return;
      }

      const matterRaw = matter(dataBuff);

      let matterResult: matterRaw = matterRaw as matterRaw;

      if (options?.preHandler) {
        matterResult = options?.preHandler(matterResult);
      }

      const processedContent: string = await md2html(matterResult.content);

      let response: Output;

      if (schema.description === "metadata") {
        response = {
          metadata: {
            ...matterResult.data,
            id: path.basename(file.fullPath, ".md"),
          },
          content: processedContent,
        } as Output;
      } else {
        response = {
          ...matterResult.data,
          id: path.basename(file.fullPath, ".md"),
        } as Output;
      }

      if (options?.preSerialization) {
        response = (await options.preSerialization(response)) as Output;
      }

      info = schema.safeParse(response);

      if (info.success) {
        resolve(info.data);
      } else {
        throw new Error("Error content type: " + info.error.message);
      }
    });
  });

  return post;
}

async function infoPageReader(dir: string): Promise<PageInfoType> {
  const info: PageInfoType = await new Promise((resolve) => {
    fs.readFile(path.join(dir, "_index.md"), (e, buffer) => {
      if (e) {
        throw new Error(`Error reading file ${path}`);
      }

      const matterResult = matter(buffer);

      const info = PageInfoSchema.safeParse(matterResult.data);

      if (info.success) {
        resolve(info.data);
      } else {
        throw new Error("Error content type: " + info.error.message);
      }
    });
  });

  return info;
}

async function metadataMdReader<Output>(
  p: string,
  schema: z.Schema
): Promise<Output> {
  const info: Output = await new Promise((resolve) => {
    fs.readFile(p, async (e, buffer) => {
      if (e) {
        throw new Error(`Error reading file ${p}`);
      }

      const matterResult = matter(buffer);

      const card = schema.safeParse({
        ...matterResult.data,
        id: path.basename(p, ".md"),
      });

      if (!card.error) {
        resolve(card.data);
      } else {
        throw new Error("Error content type: " + card.error.message);
      }
    });
  });

  return info;
}

async function writeContentFile<ContentType>(
  file: FileType,
  schema: z.Schema,
  newContent: ContentType
): Promise<void> {
  let fileContent: string = "";

  const contentParse = schema.safeParse(newContent);

  if (contentParse.error)
    throw new Error("Error parsing content: " + contentParse.error);

  const content = contentParse.data;

  const { id, ...metadata } = content.metadata || content;

  metadata.image = metadata.image.startsWith("http")
    ? metadata.image.slice(metadata.image.indexOf("static") + "static".length)
    : metadata.image;

  const meta = yaml.dump(metadata);
  fileContent += `---\n${meta}---\n\n`;

  if (content.content) {
    fileContent += `${content.content}`;
  }

  fs.writeFileSync(file.fullPath, fileContent);
}

async function updateContentFile<MetaDataType>(
  file: FileType,
  schema: z.Schema,
  newInfo?: MetaDataType,
  newContent?: string
): Promise<void> {
  let fileContent: string = fs.readFileSync(file.fullPath).toString();

  if (newInfo) {
    const infoParse = schema.safeParse(newInfo);

    if (infoParse.error) throw new Error("Error Parse:" + infoParse.error);

    const { id, ...metadata } = infoParse.data || infoParse;

    if (metadata.image)
      metadata.image = metadata.image.startsWith("http")
        ? metadata.image.slice(
            metadata.image.indexOf("static") + "static".length
          )
        : metadata.image;

    const meta = yaml.dump(metadata);

    fileContent = fileContent.replace(/---[\s\S]*?---/, "---\n" + meta + "---");
  }

  if (newContent) {
    fileContent = fileContent.replace(
      /(---[\s\S]*?---)\s*[\s\S]*/,
      `$1\n${newContent}`
    );
  }

  fs.writeFileSync(file.fullPath, fileContent);
}

export {
  contentReader,
  metadataMdReader,
  infoPageReader,
  writeContentFile,
  updateContentFile,
};
