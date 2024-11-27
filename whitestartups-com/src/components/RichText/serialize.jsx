import { BannerBlock } from '@/blocks/Banner/Component';
import { CallToActionBlock } from '@/blocks/CallToAction/Component';
import { CodeBlock } from '@/blocks/Code/Component';
import { MediaBlock } from '@/blocks/MediaBlock/Component';
import React, { Fragment } from 'react';
import { CMSLink } from '@/components/Link';
import { IS_BOLD, IS_CODE, IS_ITALIC, IS_STRIKETHROUGH, IS_SUBSCRIPT, IS_SUPERSCRIPT, IS_UNDERLINE, } from './nodeFormat';
export function serializeLexical({ nodes }) {
    return (<Fragment>
      {nodes === null || nodes === void 0 ? void 0 : nodes.map((node, index) => {
            if (node == null) {
                return null;
            }
            if (node.type === 'text') {
                let text = <React.Fragment key={index}>{node.text}</React.Fragment>;
                if (node.format & IS_BOLD) {
                    text = <strong key={index}>{text}</strong>;
                }
                if (node.format & IS_ITALIC) {
                    text = <em key={index}>{text}</em>;
                }
                if (node.format & IS_STRIKETHROUGH) {
                    text = (<span key={index} style={{ textDecoration: 'line-through' }}>
                {text}
              </span>);
                }
                if (node.format & IS_UNDERLINE) {
                    text = (<span key={index} style={{ textDecoration: 'underline' }}>
                {text}
              </span>);
                }
                if (node.format & IS_CODE) {
                    text = <code key={index}>{node.text}</code>;
                }
                if (node.format & IS_SUBSCRIPT) {
                    text = <sub key={index}>{text}</sub>;
                }
                if (node.format & IS_SUPERSCRIPT) {
                    text = <sup key={index}>{text}</sup>;
                }
                return text;
            }
            // NOTE: Hacky fix for
            // https://github.com/facebook/lexical/blob/d10c4e6e55261b2fdd7d1845aed46151d0f06a8c/packages/lexical-list/src/LexicalListItemNode.ts#L133
            // which does not return checked: false (only true - i.e. there is no prop for false)
            const serializedChildrenFn = (node) => {
                if (node.children == null) {
                    return null;
                }
                else {
                    if ((node === null || node === void 0 ? void 0 : node.type) === 'list' && (node === null || node === void 0 ? void 0 : node.listType) === 'check') {
                        for (const item of node.children) {
                            if ('checked' in item) {
                                if (!(item === null || item === void 0 ? void 0 : item.checked)) {
                                    item.checked = false;
                                }
                            }
                        }
                    }
                    return serializeLexical({ nodes: node.children });
                }
            };
            const serializedChildren = 'children' in node ? serializedChildrenFn(node) : '';
            if (node.type === 'block') {
                const block = node.fields;
                const blockType = block === null || block === void 0 ? void 0 : block.blockType;
                if (!block || !blockType) {
                    return null;
                }
                switch (blockType) {
                    case 'cta':
                        return <CallToActionBlock key={index} {...block}/>;
                    case 'mediaBlock':
                        return (<MediaBlock className="col-start-1 col-span-3" imgClassName="m-0" key={index} {...block} captionClassName="mx-auto max-w-[48rem]" enableGutter={false} disableInnerContainer={true}/>);
                    case 'banner':
                        return <BannerBlock className="col-start-2 mb-4" key={index} {...block}/>;
                    case 'code':
                        return <CodeBlock className="col-start-2" key={index} {...block}/>;
                    default:
                        return null;
                }
            }
            else {
                switch (node.type) {
                    case 'linebreak': {
                        return <br className="col-start-2" key={index}/>;
                    }
                    case 'paragraph': {
                        return (<p className="col-start-2" key={index}>
                  {serializedChildren}
                </p>);
                    }
                    case 'heading': {
                        const Tag = node === null || node === void 0 ? void 0 : node.tag;
                        return (<Tag className="col-start-2" key={index}>
                  {serializedChildren}
                </Tag>);
                    }
                    case 'list': {
                        const Tag = node === null || node === void 0 ? void 0 : node.tag;
                        return (<Tag className="list col-start-2" key={index}>
                  {serializedChildren}
                </Tag>);
                    }
                    case 'listitem': {
                        if ((node === null || node === void 0 ? void 0 : node.checked) != null) {
                            return (<li aria-checked={node.checked ? 'true' : 'false'} className={` ${node.checked ? '' : ''}`} key={index} 
                            // eslint-disable-next-line jsx-a11y/no-noninteractive-element-to-interactive-role
                            role="checkbox" tabIndex={-1} value={node === null || node === void 0 ? void 0 : node.value}>
                    {serializedChildren}
                  </li>);
                        }
                        else {
                            return (<li key={index} value={node === null || node === void 0 ? void 0 : node.value}>
                    {serializedChildren}
                  </li>);
                        }
                    }
                    case 'quote': {
                        return (<blockquote className="col-start-2" key={index}>
                  {serializedChildren}
                </blockquote>);
                    }
                    case 'link': {
                        const fields = node.fields;
                        return (<CMSLink key={index} newTab={Boolean(fields === null || fields === void 0 ? void 0 : fields.newTab)} reference={fields.doc} type={fields.linkType === 'internal' ? 'reference' : 'custom'} url={fields.url}>
                  {serializedChildren}
                </CMSLink>);
                    }
                    default:
                        return null;
                }
            }
        })}
    </Fragment>);
}
//# sourceMappingURL=serialize.jsx.map