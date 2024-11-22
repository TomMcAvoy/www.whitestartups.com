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
import { cn } from 'src/utilities/cn';
import { Slot } from '@radix-ui/react-slot';
import { cva } from 'class-variance-authority';
import * as React from 'react';
const buttonVariants = cva('inline-flex items-center justify-center whitespace-nowrap rounded text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50', {
    defaultVariants: {
        size: 'default',
        variant: 'default',
    },
    variants: {
        size: {
            clear: '',
            default: 'h-10 px-4 py-2',
            icon: 'h-10 w-10',
            lg: 'h-11 rounded px-8',
            sm: 'h-9 rounded px-3',
        },
        variant: {
            default: 'bg-primary text-primary-foreground hover:bg-primary/90',
            destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
            ghost: 'hover:bg-card hover:text-accent-foreground',
            link: 'text-primary items-start justify-start underline-offset-4 hover:underline',
            outline: 'border border-border bg-background hover:bg-card hover:text-accent-foreground',
            secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        },
    },
});
const Button = React.forwardRef((_a, ref) => {
    var { asChild = false, className, size, variant } = _a, props = __rest(_a, ["asChild", "className", "size", "variant"]);
    const Comp = asChild ? Slot : 'button';
    return (<Comp className={cn(buttonVariants({ className, size, variant }))} ref={ref} {...props}/>);
});
Button.displayName = 'Button';
export { Button, buttonVariants };
//# sourceMappingURL=button.jsx.map