import React, { Fragment } from 'react';
import { ImageMedia } from './ImageMedia';
import { VideoMedia } from './VideoMedia';
export const Media = (props) => {
    var _a;
    const { className, htmlElement = 'div', resource } = props;
    const isVideo = typeof resource === 'object' && ((_a = resource === null || resource === void 0 ? void 0 : resource.mimeType) === null || _a === void 0 ? void 0 : _a.includes('video'));
    const Tag = htmlElement || Fragment;
    return (<Tag {...(htmlElement !== null
        ? {
            className,
        }
        : {})}>
      {isVideo ? <VideoMedia {...props}/> : <ImageMedia {...props}/>}
    </Tag>);
};
//# sourceMappingURL=index.jsx.map