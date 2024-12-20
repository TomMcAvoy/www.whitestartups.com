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
/* eslint-disable jsx-a11y/heading-has-content */
import { cn } from 'src/utilities/cn';
import * as React from 'react';
const Card = React.forwardRef((_a, ref) => {
    var { className } = _a, props = __rest(_a, ["className"]);
    return (<div className={cn('rounded-lg border bg-card text-card-foreground shadow-sm', className)} ref={ref} {...props}/>);
});
Card.displayName = 'Card';
const CardHeader = React.forwardRef((_a, ref) => {
    var { className } = _a, props = __rest(_a, ["className"]);
    return (<div className={cn('flex flex-col space-y-1.5 p-6', className)} ref={ref} {...props}/>);
});
CardHeader.displayName = 'CardHeader';
const CardTitle = React.forwardRef((_a, ref) => {
    var { className } = _a, props = __rest(_a, ["className"]);
    return (<h3 className={cn('text-2xl font-semibold leading-none tracking-tight', className)} ref={ref} {...props}/>);
});
CardTitle.displayName = 'CardTitle';
const CardDescription = React.forwardRef((_a, ref) => {
    var { className } = _a, props = __rest(_a, ["className"]);
    return (<p className={cn('text-sm text-muted-foreground', className)} ref={ref} {...props}/>);
});
CardDescription.displayName = 'CardDescription';
const CardContent = React.forwardRef((_a, ref) => {
    var { className } = _a, props = __rest(_a, ["className"]);
    return (<div className={cn('p-6 pt-0', className)} ref={ref} {...props}/>);
});
CardContent.displayName = 'CardContent';
const CardFooter = React.forwardRef((_a, ref) => {
    var { className } = _a, props = __rest(_a, ["className"]);
    return (<div className={cn('flex items-center p-6 pt-0', className)} ref={ref} {...props}/>);
});
CardFooter.displayName = 'CardFooter';
export { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle };
//# sourceMappingURL=card.jsx.map