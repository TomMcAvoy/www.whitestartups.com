import { cn } from '@/utilities/cn';
import React from 'react';
import { serializeLexical } from './serialize';
const RichText = ({ className, content, enableGutter = true, enableProse = true, }) => {
    var _a;
    if (!content) {
        return null;
    }
    return (<div className={cn({
            'container ': enableGutter,
            'max-w-none': !enableGutter,
            'mx-auto prose dark:prose-invert ': enableProse,
        }, className)}>
      {content &&
            !Array.isArray(content) &&
            typeof content === 'object' &&
            'root' in content &&
            serializeLexical({ nodes: (_a = content === null || content === void 0 ? void 0 : content.root) === null || _a === void 0 ? void 0 : _a.children })}
    </div>);
};
export default RichText;
//# sourceMappingURL=index.jsx.map