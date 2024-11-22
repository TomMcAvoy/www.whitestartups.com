'use client';
import { cn } from '@/utilities/cn';
import { useSelectedLayoutSegments } from 'next/navigation';
import { PayloadAdminBar } from 'payload-admin-bar';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import './index.scss';
const baseClass = 'admin-bar';
const collectionLabels = {
    pages: {
        plural: 'Pages',
        singular: 'Page',
    },
    posts: {
        plural: 'Posts',
        singular: 'Post',
    },
    projects: {
        plural: 'Projects',
        singular: 'Project',
    },
};
const Title = () => <span>Dashboard</span>;
export const AdminBar = (props) => {
    var _a, _b;
    const { adminBarProps } = props || {};
    const segments = useSelectedLayoutSegments();
    const [show, setShow] = useState(false);
    const collection = (collectionLabels === null || collectionLabels === void 0 ? void 0 : collectionLabels[segments === null || segments === void 0 ? void 0 : segments[1]]) ? segments === null || segments === void 0 ? void 0 : segments[1] : 'pages';
    const router = useRouter();
    const onAuthChange = React.useCallback((user) => {
        setShow(user === null || user === void 0 ? void 0 : user.id);
    }, []);
    return (<div className={cn(baseClass, 'py-2 bg-black text-white', {
            block: show,
            hidden: !show,
        })}>
      <div className="container">
        <PayloadAdminBar {...adminBarProps} className="py-2 text-white" classNames={{
            controls: 'font-medium text-white',
            logo: 'text-white',
            user: 'text-white',
        }} cmsURL={process.env.NEXT_PUBLIC_SERVER_URL} collection={collection} collectionLabels={{
            plural: ((_a = collectionLabels[collection]) === null || _a === void 0 ? void 0 : _a.plural) || 'Pages',
            singular: ((_b = collectionLabels[collection]) === null || _b === void 0 ? void 0 : _b.singular) || 'Page',
        }} logo={<Title />} onAuthChange={onAuthChange} onPreviewExit={() => {
            fetch('/next/exit-preview').then(() => {
                router.push('/');
                router.refresh();
            });
        }} style={{
            backgroundColor: 'transparent',
            padding: 0,
            position: 'relative',
            zIndex: 'unset',
        }}/>
      </div>
    </div>);
};
//# sourceMappingURL=index.jsx.map