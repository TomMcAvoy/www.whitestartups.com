'use client';
import { cn } from 'src/utilities/cn';
import NextImage from 'next/image';
import React from 'react';
import cssVariables from '@/cssVariables';
const { breakpoints } = cssVariables;
export const ImageMedia = (props) => {
    const { alt: altFromProps, fill, imgClassName, onClick, onLoad: onLoadFromProps, priority, resource, size: sizeFromProps, src: srcFromProps, } = props;
    const [isLoading, setIsLoading] = React.useState(true);
    let width;
    let height;
    let alt = altFromProps;
    let src = srcFromProps || '';
    if (!src && resource && typeof resource === 'object') {
        const { alt: altFromResource, filename: fullFilename, height: fullHeight, url, width: fullWidth, } = resource;
        width = fullWidth;
        height = fullHeight;
        alt = altFromResource;
        src = `${process.env.NEXT_PUBLIC_SERVER_URL}${url}`;
    }
    // NOTE: this is used by the browser to determine which image to download at different screen sizes
    const sizes = sizeFromProps
        ? sizeFromProps
        : Object.entries(breakpoints)
            .map(([, value]) => `(max-width: ${value}px) ${value}px`)
            .join(', ');
    return (<NextImage alt={alt || ''} className={cn(imgClassName)} fill={fill} height={!fill ? height : undefined} onClick={onClick} onLoad={() => {
            setIsLoading(false);
            if (typeof onLoadFromProps === 'function') {
                onLoadFromProps();
            }
        }} priority={priority} quality={90} sizes={sizes} src={src} width={!fill ? width : undefined}/>);
};
//# sourceMappingURL=index.jsx.map