var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
import { buttonVariants } from '@/components/ui/button';
import { cn } from 'src/utilities/cn';
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';
import * as React from 'react';
const Pagination = (_a) => {
    var { className } = _a, props = __rest(_a, ["className"]);
    return (<nav aria-label="pagination" className={cn('mx-auto flex w-full justify-center', className)} role="navigation" {...props}/>);
};
Pagination.displayName = 'Pagination';
const PaginationContent = React.forwardRef((_a, ref) => {
    var { className } = _a, props = __rest(_a, ["className"]);
    return (<ul className={cn('flex flex-row items-center gap-1', className)} ref={ref} {...props}/>);
});
PaginationContent.displayName = 'PaginationContent';
const PaginationItem = React.forwardRef((_a, ref) => {
    var { className } = _a, props = __rest(_a, ["className"]);
    return <li className={cn('', className)} ref={ref} {...props}/>;
});
PaginationItem.displayName = 'PaginationItem';
const PaginationLink = (_a) => {
    var { className, isActive, size = 'icon' } = _a, props = __rest(_a, ["className", "isActive", "size"]);
    return (<button aria-current={isActive ? 'page' : undefined} className={cn(buttonVariants({
            size,
            variant: isActive ? 'outline' : 'ghost',
        }), className)} {...props}/>);
};
PaginationLink.displayName = 'PaginationLink';
const PaginationPrevious = (_a) => {
    var { className } = _a, props = __rest(_a, ["className"]);
    return (<PaginationLink aria-label="Go to previous page" className={cn('gap-1 pl-2.5', className)} size="default" {...props}>
    <ChevronLeft className="h-4 w-4"/>
    <span>Previous</span>
  </PaginationLink>);
};
PaginationPrevious.displayName = 'PaginationPrevious';
const PaginationNext = (_a) => {
    var { className } = _a, props = __rest(_a, ["className"]);
    return (<PaginationLink aria-label="Go to next page" className={cn('gap-1 pr-2.5', className)} size="default" {...props}>
    <span>Next</span>
    <ChevronRight className="h-4 w-4"/>
  </PaginationLink>);
};
PaginationNext.displayName = 'PaginationNext';
const PaginationEllipsis = (_a) => {
    var { className } = _a, props = __rest(_a, ["className"]);
    return (<span aria-hidden className={cn('flex h-9 w-9 items-center justify-center', className)} {...props}>
    <MoreHorizontal className="h-4 w-4"/>
    <span className="sr-only">More pages</span>
  </span>);
};
PaginationEllipsis.displayName = 'PaginationEllipsis';
export { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious, };
//# sourceMappingURL=pagination.jsx.map